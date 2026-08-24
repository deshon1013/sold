-- Video comments, with one level of replies + row-level security.
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- parent_comment_id is nullable and self-references comments: null means a
-- top-level comment, non-null means a reply. Nesting is kept to one level by
-- the UI (only top-level comments expose a Reply action), not by a DB
-- constraint -- simpler than enforcing it in SQL, and the only thing that
-- actually needs to guarantee it here is what renders the reply button.
--
-- videos.comment_count stays the source of truth for display (already
-- selected on every video fetch) -- a trigger keeps it in sync, same as
-- likes -> videos.like_count in 0004.

begin;

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  parent_comment_id uuid references comments (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_video_id_idx on comments (video_id);
create index if not exists comments_parent_comment_id_idx on comments (parent_comment_id);

alter table comments enable row level security;

drop policy if exists "comments are readable by authenticated users" on comments;
create policy "comments are readable by authenticated users"
  on comments for select
  using (auth.role() = 'authenticated');

drop policy if exists "users can post their own comments" on comments;
create policy "users can post their own comments"
  on comments for insert
  with check (auth.uid() = user_id);

create or replace function public.handle_comment_count_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.videos set comment_count = comment_count + 1 where id = new.video_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.videos set comment_count = greatest(comment_count - 1, 0) where id = old.video_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_comment_count_sync on comments;
create trigger on_comment_count_sync
  after insert or delete on comments
  for each row execute function public.handle_comment_count_sync();

commit;
