create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role text not null default 'Collaborator' check (role in ('Collaborator')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index business_members_business_email_unique
  on public.business_members (business_id, lower(email));
create unique index business_members_business_user_unique
  on public.business_members (business_id, user_id)
  where user_id is not null;
create index business_members_user_idx on public.business_members(user_id);

alter table public.business_members enable row level security;

create or replace function private.is_business_owner(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.businesses business
    where business.id = p_business_id
      and business.owner_id = (select auth.uid())
  );
$$;

create or replace function private.can_access_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_business_owner(p_business_id)
    or exists (
      select 1
      from public.business_members member
      where member.business_id = p_business_id
        and member.user_id = (select auth.uid())
        and member.accepted_at is not null
    );
$$;

revoke all on function private.is_business_owner(uuid) from public;
revoke all on function private.can_access_business(uuid) from public;
grant execute on function private.is_business_owner(uuid) to authenticated;
grant execute on function private.can_access_business(uuid) to authenticated;

create policy "business_members_select_workspace"
on public.business_members for select to authenticated
using (private.can_access_business(business_id));

create policy "business_members_insert_owner"
on public.business_members for insert to authenticated
with check (private.is_business_owner(business_id));

create policy "business_members_update_owner"
on public.business_members for update to authenticated
using (private.is_business_owner(business_id))
with check (private.is_business_owner(business_id));

create policy "business_members_delete_owner"
on public.business_members for delete to authenticated
using (private.is_business_owner(business_id));

drop policy if exists "businesses_select_own" on public.businesses;
create policy "businesses_select_workspace"
on public.businesses for select to authenticated
using (private.can_access_business(id));

drop policy if exists "setup_items_own_business" on public.setup_items;
create policy "setup_items_workspace"
on public.setup_items for all to authenticated
using (private.can_access_business(business_id))
with check (private.can_access_business(business_id));

drop policy if exists "tasks_own_business" on public.tasks;
create policy "tasks_workspace"
on public.tasks for all to authenticated
using (private.can_access_business(business_id))
with check (private.can_access_business(business_id));

drop policy if exists "vendors_own_business" on public.vendors;
create policy "vendors_workspace"
on public.vendors for all to authenticated
using (private.can_access_business(business_id))
with check (private.can_access_business(business_id));

drop policy if exists "business_modules_own_business" on public.business_modules;
create policy "business_modules_workspace"
on public.business_modules for all to authenticated
using (private.can_access_business(business_id))
with check (private.can_access_business(business_id));

create or replace function public.add_business_team_member(
  p_business_id uuid,
  p_email text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_user_id uuid;
  v_display_name text;
  v_existing_user_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if not private.is_business_owner(p_business_id) then
    raise exception 'Only the business owner can add team members';
  end if;

  if v_email = '' or position('@' in v_email) < 2 then
    raise exception 'Enter a valid email address';
  end if;

  select users.id,
         coalesce(users.raw_user_meta_data ->> 'full_name', '')
    into v_user_id, v_display_name
  from auth.users users
  where lower(users.email) = v_email
  limit 1;

  if v_user_id = (select auth.uid()) then
    raise exception 'You are already the owner of this business';
  end if;

  select member.user_id
    into v_existing_user_id
  from public.business_members member
  where member.business_id = p_business_id
    and lower(member.email) = v_email;

  if found then
    if v_existing_user_id is not null then
      return 'already_member';
    end if;
    return 'pending';
  end if;

  insert into public.business_members (
    business_id,
    user_id,
    email,
    display_name,
    invited_by,
    accepted_at
  ) values (
    p_business_id,
    v_user_id,
    v_email,
    coalesce(nullif(v_display_name, ''), split_part(v_email, '@', 1)),
    (select auth.uid()),
    case when v_user_id is null then null else now() end
  );

  return case when v_user_id is null then 'pending' else 'added' end;
end;
$$;

create or replace function public.claim_my_business_invites()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
  v_display_name text;
  v_count integer;
begin
  if (select auth.uid()) is null then
    return 0;
  end if;

  select lower(users.email),
         coalesce(users.raw_user_meta_data ->> 'full_name', '')
    into v_email, v_display_name
  from auth.users users
  where users.id = (select auth.uid());

  update public.business_members member
  set user_id = (select auth.uid()),
      accepted_at = now(),
      display_name = coalesce(nullif(v_display_name, ''), member.display_name)
  where member.user_id is null
    and lower(member.email) = v_email;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.add_business_team_member(uuid, text) from public;
revoke all on function public.claim_my_business_invites() from public;
grant execute on function public.add_business_team_member(uuid, text) to authenticated;
grant execute on function public.claim_my_business_invites() to authenticated;

grant select, insert, update, delete on public.business_members to authenticated;
