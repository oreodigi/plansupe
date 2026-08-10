alter table public.business_modules
  add column if not exists planned_budget numeric(14,2)
  check (planned_budget is null or planned_budget >= 0);

alter table public.business_modules
  drop constraint if exists business_modules_module_key_check;

alter table public.business_modules
  add constraint business_modules_module_key_check
  check (module_key in ('Licenses','Location','Interiors','Equipment','Staff','Branding','Operations','Marketing','Assets'));

insert into public.business_modules (business_id, module_key, sort_order)
select id, 'Assets', 8
from public.businesses
where archived_at is null
on conflict (business_id, module_key) do nothing;
