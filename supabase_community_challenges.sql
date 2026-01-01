-- Community Challenges Table for Social Arena
-- Run this in Supabase SQL Editor

-- Create the community_challenges table
create table if not exists community_challenges (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references auth.users(id) on delete cascade,
  creator_name text not null,
  title text not null,
  scenarios jsonb not null,  -- Array of 3 scenarios
  plays_count integer default 0,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '3 days')
);

-- Enable Row Level Security
alter table community_challenges enable row level security;

-- Everyone can view active challenges
create policy "Anyone can view active challenges"
  on community_challenges for select
  using (expires_at > now());

-- Authenticated users can create challenges
create policy "Users can create challenges"
  on community_challenges for insert
  with check (auth.uid() = creator_id);

-- Anyone can update plays_count (for incrementing)
create policy "Anyone can update plays count"
  on community_challenges for update
  using (true)
  with check (true);

-- Index for faster queries on expiry
create index if not exists idx_challenges_expires 
  on community_challenges(expires_at);

-- Function to clean up expired challenges (optional - can run manually or via cron)
create or replace function cleanup_expired_challenges()
returns integer as $$
declare
  deleted_count integer;
begin
  delete from community_challenges where expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer;
