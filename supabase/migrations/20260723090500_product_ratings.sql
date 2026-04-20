-- Ratings for services (recreated after the rebuild; old table was Chariow-keyed)

create table public.product_ratings (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.services(id) on delete cascade,
  stars      integer not null check (stars between 1 and 5),
  comment    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.product_ratings enable row level security;

create policy "ratings: public read" on public.product_ratings
  for select using (true);

create policy "ratings: insert own" on public.product_ratings
  for insert with check (user_id = auth.uid());

create policy "ratings: update own" on public.product_ratings
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
