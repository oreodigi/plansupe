revoke execute on function public.add_business_team_member(uuid, text) from anon;
revoke execute on function public.claim_my_business_invites() from anon;

create index business_members_invited_by_idx
  on public.business_members(invited_by);
