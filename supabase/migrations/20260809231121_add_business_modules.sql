create table public.business_modules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  module_key text not null check (module_key in ('Licenses','Location','Interiors','Equipment','Staff','Branding','Operations','Marketing')),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, module_key)
);

create index business_modules_business_idx on public.business_modules(business_id);

insert into public.business_modules (business_id, module_key, sort_order)
select distinct
  setup_items.business_id,
  case setup_items.module
    when 'Compliance' then 'Licenses'
    when 'Furniture' then 'Interiors'
    when 'Team' then 'Staff'
    when 'Products' then 'Operations'
    else setup_items.module
  end,
  case setup_items.module
    when 'Compliance' then 0 when 'Location' then 1 when 'Furniture' then 2
    when 'Equipment' then 3 when 'Team' then 4 when 'Branding' then 5
    when 'Products' then 6 when 'Operations' then 6 when 'Marketing' then 7
    else 8
  end
from public.setup_items
where setup_items.module in ('Compliance','Licenses','Location','Furniture','Interiors','Equipment','Team','Staff','Products','Branding','Operations','Marketing')
on conflict (business_id, module_key) do nothing;

update public.setup_items set module = 'Licenses' where module = 'Compliance';
update public.setup_items set module = 'Interiors' where module = 'Furniture';
update public.setup_items set module = 'Staff' where module = 'Team';
update public.setup_items set module = 'Operations' where module = 'Products';

alter table public.business_modules enable row level security;

create policy "business_modules_own_business" on public.business_modules
for all to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = business_modules.business_id
    and b.owner_id = (select auth.uid())
))
with check (exists (
  select 1 from public.businesses b
  where b.id = business_modules.business_id
    and b.owner_id = (select auth.uid())
));

grant select, insert, update, delete on public.business_modules to authenticated;
