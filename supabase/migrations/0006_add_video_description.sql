-- Optional video description.
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

alter table videos add column if not exists description text;
