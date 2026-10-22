-- Clearbrief's private client scope and estimate workspace.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 100),
  client text not null check (char_length(btrim(client)) between 1 and 100),
  description text not null default '' check (char_length(description) <= 1000),
  estimate numeric(12, 2) not null check (estimate between 0 and 10000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_updated_idx
  on public.projects (user_id, updated_at desc);

alter table public.projects enable row level security;

revoke all on table public.projects from anon;
grant select, insert, update, delete on table public.projects to authenticated;

create policy "Users can view their own project briefs"
  on public.projects for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own project briefs"
  on public.projects for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own project briefs"
  on public.projects for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own project briefs"
  on public.projects for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_project_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_project_updated_at();
