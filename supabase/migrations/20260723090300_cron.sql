-- WalanoCast — scheduled jobs (spec S1)

create extension if not exists pg_cron;

-- S1: expire pending orders + release their reservations, every 15 min
select cron.schedule(
  'walanocast-expire-orders',
  '*/15 * * * *',
  $$select public.expire_orders()$$
);
