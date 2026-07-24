-- Override storefront-facing fields per product.
-- Extends the existing product_details table (description + activation) with:
--   - display_name : override the product's name on the storefront
--   - category     : force a category different from the default
--   - banner_url   : 4:3 banner displayed on item card + item detail hero
--
-- All fields are nullable; when null, the default value is used.

alter table public.product_details
  add column if not exists display_name text,
  add column if not exists category     text,
  add column if not exists banner_url   text;

-- Public bucket for the 4:3 banners.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-banners',
  'product-banners',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS: lecture publique, écriture admin uniquement.
drop policy if exists "public read banners" on storage.objects;
create policy "public read banners"
  on storage.objects for select
  using (bucket_id = 'product-banners');

drop policy if exists "admin insert banners" on storage.objects;
create policy "admin insert banners"
  on storage.objects for insert
  with check (
    bucket_id = 'product-banners'
    and public.get_user_role(auth.uid()) in ('app_admin', 'system_admin')
  );

drop policy if exists "admin update banners" on storage.objects;
create policy "admin update banners"
  on storage.objects for update
  using (
    bucket_id = 'product-banners'
    and public.get_user_role(auth.uid()) in ('app_admin', 'system_admin')
  );

drop policy if exists "admin delete banners" on storage.objects;
create policy "admin delete banners"
  on storage.objects for delete
  using (
    bucket_id = 'product-banners'
    and public.get_user_role(auth.uid()) in ('app_admin', 'system_admin')
  );
