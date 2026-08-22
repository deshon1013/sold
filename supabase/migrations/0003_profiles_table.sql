-- Introduces a public "profiles" table that mirrors each user's name/avatar
-- from auth.users, kept in sync automatically by a trigger. Videos now
-- reference profiles instead of copying the name/avatar at upload time, so
-- a changed avatar or name shows up everywhere immediately -- including on
-- videos uploaded before the change -- instead of being frozen as a
-- snapshot from whenever that video was uploaded.
--
-- Run this in each environment's Supabase project: SQL Editor -> New query -> paste -> Run.

begin;

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles are readable by authenticated users" on profiles;
create policy "profiles are readable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

-- No insert/update policies for regular users -- profiles is only ever
-- written by the trigger below, running as its owner (bypasses RLS).
-- Editing your name/avatar still goes through auth.updateUser() exactly as
-- before (see lib/auth.ts); this table just mirrors the result.

create or replace function public.handle_user_profile_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.raw_user_meta_data ->> 'avatar_url',
    now()
  )
  on conflict (id) do update
    set name = excluded.name,
        avatar_url = excluded.avatar_url,
        updated_at = excluded.updated_at;
  return new;
end;
$$;

drop trigger if exists on_auth_user_profile_sync on auth.users;
create trigger on_auth_user_profile_sync
  after insert or update on auth.users
  for each row execute function public.handle_user_profile_sync();

-- Backfill profiles for every user that already exists.
insert into public.profiles (id, name, avatar_url, updated_at)
select id, coalesce(raw_user_meta_data ->> 'name', ''), raw_user_meta_data ->> 'avatar_url', now()
from auth.users
on conflict (id) do update
  set name = excluded.name,
      avatar_url = excluded.avatar_url,
      updated_at = excluded.updated_at;

-- Repoint videos.uploaded_by at profiles instead of auth.users directly, so
-- PostgREST can embed the uploader's *current* profile in one select. Safe
-- now that every existing user has a profiles row from the backfill above.
alter table videos drop constraint if exists videos_uploaded_by_fkey;
alter table videos add constraint videos_uploaded_by_fkey
  foreign key (uploaded_by) references public.profiles (id) on delete cascade;

-- No longer needed -- name/avatar are read live via the profiles join now.
alter table videos drop column if exists uploaded_by_name;
alter table videos drop column if exists uploaded_by_avatar_url;

commit;
