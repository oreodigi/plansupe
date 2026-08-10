alter table public.setup_items
  add column if not exists vendor_id uuid references public.vendors(id) on delete set null;

create index if not exists setup_items_vendor_idx
  on public.setup_items(vendor_id);
