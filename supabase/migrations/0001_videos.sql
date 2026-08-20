-- Videos table + row-level security.
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- uploaded_by_name is denormalized (not joined from a profiles table) because
-- auth is currently just name/email/password with no profiles table yet --
-- see the build plan for the username-login phase that would introduce one.

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  game_title text not null,
  video_url text not null,
  thumbnail_url text,
  uploaded_by uuid not null references auth.users (id) on delete cascade,
  uploaded_by_name text not null,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists videos_created_at_idx on videos (created_at desc);

alter table videos enable row level security;

create policy "videos are readable by authenticated users"
  on videos for select
  using (auth.role() = 'authenticated');

create policy "users insert their own videos"
  on videos for insert
  with check (auth.uid() = uploaded_by);

create policy "only the uploader can update their video"
  on videos for update
  using (auth.uid() = uploaded_by)
  with check (auth.uid() = uploaded_by);

create policy "only the uploader can delete their video"
  on videos for delete
  using (auth.uid() = uploaded_by);
