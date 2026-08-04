-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  created_at timestamptz default now(),
  stripe_customer_id text,
  subscription_status text default 'free' check (subscription_status in ('free', 'trialing', 'active', 'past_due', 'canceled')),
  subscription_current_period_end timestamptz,
  klaviyo_profile_id text,
  marketing_consent boolean default false,
  theme_preference text default 'dark' check (theme_preference in ('light', 'dark'))
);

-- Puzzles table
create table public.puzzles (
  id uuid default uuid_generate_v4() primary key,
  game_key text not null check (game_key in ('wordle', 'connections')),
  publish_date date not null,
  payload jsonb not null,
  difficulty text default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  created_at timestamptz default now(),
  unique(game_key, publish_date)
);

-- Results table
create table public.results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  puzzle_id uuid references public.puzzles(id) on delete cascade,
  game_key text not null,
  publish_date date not null,
  solved boolean not null,
  guesses_used int,
  time_ms int,
  completed_at timestamptz default now(),
  unique(user_id, puzzle_id)
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.puzzles enable row level security;
alter table public.results enable row level security;

-- Users: can only read/update own row
create policy "users_own" on public.users
  for all using (auth.uid() = id);

-- Puzzles: anyone can read today's or past puzzles, future dates are blocked
create policy "puzzles_read" on public.puzzles
  for select using (publish_date <= current_date);

-- Results: users can read/write own results
create policy "results_own" on public.results
  for all using (auth.uid() = user_id);

-- Function to get current streak for a user
create or replace function public.get_streak(p_user_id uuid, p_game_key text)
returns int language plpgsql as $$
declare
  streak int := 0;
  check_date date := current_date;
begin
  loop
    if exists (
      select 1 from public.results
      where user_id = p_user_id
        and game_key = p_game_key
        and publish_date = check_date
        and solved = true
    ) then
      streak := streak + 1;
      check_date := check_date - 1;
    else
      exit;
    end if;
  end loop;
  return streak;
end;
$$;

-- Seed sample Wordle puzzles
insert into public.puzzles (game_key, publish_date, payload) values
  ('wordle', current_date, '{"word": "OLLIE", "hint": "The foundation of all tricks"}'),
  ('wordle', current_date + 1, '{"word": "GRIND", "hint": "Slide along a rail or ledge"}'),
  ('wordle', current_date + 2, '{"word": "FAKIE", "hint": "Riding backward"}'),
  ('wordle', current_date + 3, '{"word": "SMITH", "hint": "A classic grind named after Mike"}'),
  ('wordle', current_date + 4, '{"word": "BLUNT", "hint": "Tail on the lip, wheels over"}'),
  ('wordle', current_date + 5, '{"word": "SKATE", "hint": "What it''s all about"}'),
  ('wordle', current_date + 6, '{"word": "PIVOT", "hint": "Rotate on the back truck"}'),
  ('wordle', current_date + 7, '{"word": "NOLLY", "hint": "Nose ollie"}')
on conflict (game_key, publish_date) do nothing;

-- Seed sample Connections puzzles
insert into public.puzzles (game_key, publish_date, payload) values
  ('connections', current_date, '{
    "groups": [
      {
        "category": "FLIP TRICKS",
        "color": "yellow",
        "items": ["KICKFLIP", "HEELFLIP", "HARDFLIP", "INWARD"]
      },
      {
        "category": "GRINDS",
        "color": "green",
        "items": ["NOSEGRIND", "TAILSLIDE", "FEEBLE", "CROOKED"]
      },
      {
        "category": "GRABS",
        "color": "blue",
        "items": ["MELON", "INDY", "STALEFISH", "MUTE"]
      },
      {
        "category": "STANCES",
        "color": "purple",
        "items": ["REGULAR", "GOOFY", "FAKIE", "SWITCH"]
      }
    ]
  }'),
  ('connections', current_date + 1, '{
    "groups": [
      {
        "category": "PRO SKATERS FIRST NAMES",
        "color": "yellow",
        "items": ["TONY", "RODNEY", "NYJAH", "MARK"]
      },
      {
        "category": "SKATE BRANDS",
        "color": "green",
        "items": ["ELEMENT", "BAKER", "PLAN B", "GIRL"]
      },
      {
        "category": "SKATE SPOTS",
        "color": "blue",
        "items": ["HUBBA", "GAP", "LEDGE", "RAIL"]
      },
      {
        "category": "TRICK PREFIXES",
        "color": "purple",
        "items": ["BACK", "FRONT", "HALF", "NOLLIE"]
      }
    ]
  }')
on conflict (game_key, publish_date) do nothing;
