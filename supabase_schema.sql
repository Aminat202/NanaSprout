-- Create a table for public profiles using Supabase Auth
create table profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  username text unique,
  avatar_url text, -- Store as string (e.g., "avatar_1")
  home_env text default 'default', -- Background theme
  xp integer default 0,
  health integer default 100,
  toxicity integer default 0,
  achievements jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Policy: Everyone can view profiles (for leaderboard)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Policy: Users can insert their own profile
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- Policy: Users can update own profile
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Tournaments Table (Community Events)
create table tournaments (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references auth.users(id),
  name text not null,
  topic text not null, -- e.g. "Ocean Conservation"
  questions_json jsonb not null, -- Store AI generated Q&A
  participants jsonb default '[]'::jsonb, -- List of user IDs
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table tournaments enable row level security;

create policy "Tournaments are viewable by everyone."
  on tournaments for select
  using ( true );

create policy "Users can create tournaments."
  on tournaments for insert
  with check ( auth.uid() = creator_id );
