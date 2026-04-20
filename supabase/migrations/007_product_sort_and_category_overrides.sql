-- Per-product sort order on the storefront. Lower values render first.
alter table public.product_details
  add column if not exists sort_order int not null default 0;

create index if not exists idx_product_details_sort_order
  on public.product_details(sort_order);

-- Per-category overrides: custom SVG/PNG icon + display label + sort order.
-- Key = category slug (stored lowercased; matches CardProduct.cat).
create table if not exists public.category_overrides (
  slug         text primary key,
  display_label text,
  icon_url     text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_category_overrides_sort
  on public.category_overrides(sort_order);

drop trigger if exists category_overrides_updated_at on public.category_overrides;
create trigger category_overrides_updated_at
  before update on public.category_overrides
  for each row execute function public.set_updated_at();

alter table public.category_overrides enable row level security;

drop policy if exists "public read category_overrides" on public.category_overrides;
create policy "public read category_overrides"
  on public.category_overrides for select
  using (true);

drop policy if exists "admin write category_overrides" on public.category_overrides;
create policy "admin write category_overrides"
  on public.category_overrides for all
  using (public.get_user_role(auth.uid()) in ('app_admin', 'system_admin'))
  with check (public.get_user_role(auth.uid()) in ('app_admin', 'system_admin'));

-- Allow SVG uploads to the shared product-banners bucket.
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
where id = 'product-banners';
