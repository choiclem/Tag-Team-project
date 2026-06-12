create table if not exists public.app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "Anyone can read shared devlog" on public.app_state;
create policy "Anyone can read shared devlog"
on public.app_state for select
to anon
using (id = 'shared');

drop policy if exists "Anyone can insert shared devlog" on public.app_state;
create policy "Anyone can insert shared devlog"
on public.app_state for insert
to anon
with check (id = 'shared');

drop policy if exists "Anyone can update shared devlog" on public.app_state;
create policy "Anyone can update shared devlog"
on public.app_state for update
to anon
using (id = 'shared')
with check (id = 'shared');

do $$
begin
  alter publication supabase_realtime add table public.app_state;
exception
  when duplicate_object then null;
end $$;
