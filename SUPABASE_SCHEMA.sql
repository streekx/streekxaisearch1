
-- 1. PROFILES TABLE (Syncs with Auth)
-- This table stores public user info separately from the secure auth.users table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  streekx_id text unique not null,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  job_title text,
  dob text,
  gender text,
  mobile text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PROJECTS TABLE (Workspaces/Collections)
create table public.projects (
  id text not null primary key, -- Using text to match client-side UUIDs
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  emoji text,
  description text,
  ai_prompt text,
  visibility text default 'Private',
  created_at bigint, -- Storing JS timestamps (Date.now())
  updated_at bigint
);

-- 3. SESSIONS TABLE (Search History)
create table public.sessions (
  id text not null primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  query text not null,
  timestamp bigint,
  project_id text references public.projects(id) on delete set null
);

-- 4. MESSAGES TABLE (Chat Content)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  session_id text references public.sessions(id) on delete cascade not null,
  role text not null, -- 'user' or 'model'
  content text,
  sources jsonb, -- Stores search results as JSON
  attachments jsonb, -- Stores file attachments as JSON
  timestamp bigint
);

-- 5. ROW LEVEL SECURITY (RLS)
-- Enable security on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.sessions enable row level security;
alter table public.messages enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." 
  on public.profiles for select using (true);

create policy "Users can update own profile." 
  on public.profiles for update using (auth.uid() = id);

-- Policies for Projects
create policy "Users can manage own projects" 
  on public.projects for all using (auth.uid() = user_id);

-- Policies for Sessions
create policy "Users can manage own sessions" 
  on public.sessions for all using (auth.uid() = user_id);

-- Policies for Messages
-- Users can access messages if they own the parent session
create policy "Users can manage messages" 
  on public.messages for all using (
    exists (
      select 1 from public.sessions 
      where id = messages.session_id 
      and user_id = auth.uid()
    )
  );

-- 6. TWO-STEP AUTHENTICATION TABLE
create table public.two_step_auth (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  method text not null check (method in ('authenticator', 'security_key', 'phone', 'backup_code')),
  identifier text not null,
  verified boolean default false,
  created_at timestamptz default now(),
  unique(user_id, method, identifier)
);

-- 7. RECOVERY OPTIONS TABLE
create table public.recovery_options (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('phone', 'streekx_id', 'backup_codes')),
  value text not null encrypted with (cipher = 'aes-256-cbc', key = 'encryption_key'),
  created_at timestamptz default now()
);

-- 8. SECURITY CODES TABLE
create table public.security_codes (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  code text not null,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '30 days'
);

-- 9. PASSWORD MANAGER TABLE
create table public.password_manager (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  website text not null,
  username text not null,
  password text not null encrypted with (cipher = 'aes-256-cbc', key = 'encryption_key'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. DEVICE MANAGEMENT TABLE
create table public.devices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  device_name text not null,
  device_type text check (device_type in ('mobile', 'tablet', 'desktop')),
  browser text,
  os text,
  last_active timestamptz default now(),
  is_current boolean default false,
  created_at timestamptz default now()
);

-- 11. THIRD PARTY CONNECTIONS TABLE
create table public.third_party_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  account_email text not null,
  account_name text,
  connected_at timestamptz default now(),
  last_used timestamptz,
  unique(user_id, platform, account_email)
);

-- 12. RLS FOR NEW TABLES
alter table public.two_step_auth enable row level security;
alter table public.recovery_options enable row level security;
alter table public.security_codes enable row level security;
alter table public.password_manager enable row level security;
alter table public.devices enable row level security;
alter table public.third_party_connections enable row level security;

-- 13. RLS POLICIES FOR NEW TABLES
create policy "Users can manage own 2FA"
  on public.two_step_auth for all using (auth.uid() = user_id);

create policy "Users can manage own recovery options"
  on public.recovery_options for all using (auth.uid() = user_id);

create policy "Users can manage own security codes"
  on public.security_codes for all using (auth.uid() = user_id);

create policy "Users can manage own passwords"
  on public.password_manager for all using (auth.uid() = user_id);

create policy "Users can manage own devices"
  on public.devices for all using (auth.uid() = user_id);

create policy "Users can manage own connections"
  on public.third_party_connections for all using (auth.uid() = user_id);

-- 14. AUTOMATION (Trigger)
-- Automatically creates a profile entry when a user signs up via Supabase Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    streekx_id, 
    username, 
    full_name, 
    mobile, 
    gender, 
    dob, 
    avatar_url
  )
  values (
    new.id,
    new.raw_user_meta_data->>'streekx_id',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'mobile',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'dob',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
