-- Adds the uploader's avatar (denormalized, same pattern as uploaded_by_name)
-- so it can render next to their name without a profiles table join.
-- Run this in each environment's Supabase project: SQL Editor -> New query -> paste -> Run.
--
-- Like uploaded_by_name, this is a snapshot at upload time -- if a user
-- changes their avatar later, videos they already uploaded keep showing
-- the old one. Same accepted tradeoff as the name field.

alter table videos add column if not exists uploaded_by_avatar_url text;
