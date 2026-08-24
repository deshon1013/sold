-- Per-user video likes + row-level security.
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- videos.like_count stays the source of truth for display (it's already
-- selected on every video fetch) -- a trigger keeps it in sync with this
-- table so nothing downstream needs to change how it reads that count.

begin;

create table if not exists likes (
  video_id uuid not null references videos (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id, user_id)
);

alter table likes enable row level security;

drop policy if exists "likes are readable by authenticated users" on likes;
create policy "likes are readable by authenticated users"
  on likes for select
  using (auth.role() = 'authenticated');

drop policy if exists "users can like videos" on likes;
create policy "users can like videos"
  on likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can unlike their own likes" on likes;
create policy "users can unlike their own likes"
  on likes for delete
  using (auth.uid() = user_id);

create or replace function public.handle_like_count_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.videos set like_count = like_count + 1 where id = new.video_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.videos set like_count = greatest(like_count - 1, 0) where id = old.video_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_like_count_sync on likes;
create trigger on_like_count_sync
  after insert or delete on likes
  for each row execute function public.handle_like_count_sync();

commit;
