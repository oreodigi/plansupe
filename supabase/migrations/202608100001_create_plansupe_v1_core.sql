create table public.businesses (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, category text not null, stage text not null default 'Planning', city text not null default '',
  currency text not null default 'INR', budget numeric(14,2) not null default 0 check (budget >= 0),
  launch_date date, archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index businesses_owner_idx on public.businesses(owner_id);

create table public.setup_items (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
  module text not null, name text not null,
  status text not null default 'Not started' check (status in ('Not started','In progress','Blocked','Completed','Not applicable')),
  estimated_cost numeric(14,2) not null default 0 check (estimated_cost >= 0),
  committed_cost numeric(14,2) not null default 0 check (committed_cost >= 0),
  paid_amount numeric(14,2) not null default 0 check (paid_amount >= 0 and paid_amount <= committed_cost),
  due_date date, source text not null default 'custom', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index setup_items_business_idx on public.setup_items(business_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null, module text not null default 'General', status text not null default 'To do' check (status in ('To do','In progress','Blocked','Done')),
  priority text not null default 'Medium' check (priority in ('Low','Medium','High')), due_date date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index tasks_business_idx on public.tasks(business_id);

create table public.vendors (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null, category text not null default '', contact_name text not null default '', phone text not null default '',
  email text not null default '', created_at timestamptz not null default now()
);
create index vendors_business_idx on public.vendors(business_id);

alter table public.businesses enable row level security;
alter table public.setup_items enable row level security;
alter table public.tasks enable row level security;
alter table public.vendors enable row level security;

create policy "businesses_select_own" on public.businesses for select to authenticated using ((select auth.uid()) = owner_id);
create policy "businesses_insert_own" on public.businesses for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "businesses_update_own" on public.businesses for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "businesses_delete_own" on public.businesses for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "setup_items_own_business" on public.setup_items for all to authenticated
using (exists (select 1 from public.businesses b where b.id = setup_items.business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = setup_items.business_id and b.owner_id = (select auth.uid())));
create policy "tasks_own_business" on public.tasks for all to authenticated
using (exists (select 1 from public.businesses b where b.id = tasks.business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = tasks.business_id and b.owner_id = (select auth.uid())));
create policy "vendors_own_business" on public.vendors for all to authenticated
using (exists (select 1 from public.businesses b where b.id = vendors.business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b where b.id = vendors.business_id and b.owner_id = (select auth.uid())));

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.businesses, public.setup_items, public.tasks, public.vendors to authenticated;
