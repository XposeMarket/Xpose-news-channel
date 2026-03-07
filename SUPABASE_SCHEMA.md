# Supabase Schema

> This file documents the expected database schema for the app and how it is used.

## Environment

The client is configured via the following **required** environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon public key

## Auth

The scaffold only reads the current user via `supabase.auth.getUser()` on the home page.
You can extend this with RLS policies and tables as needed.

## Example tables (optional)

You might create these tables in Supabase if you want to persist data:

```sql
-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz default now()
);

-- todos
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz default now()
);
```

Document any schema changes below this line.

---

## Changelog

- Initial scaffold: auth-only, optional `profiles` + `todos` examples.
- Added `posts` table for news articles (see `## Posts` section below).

## Posts

```sql
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  meta text,
  tags text[] default '{}',
  section text check (section in ('world', 'ai', 'tech', 'finance')),
  status text not null check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz default now()
);
```

- `section` – high-level category for homepage grouping: `world`, `ai`, `tech`, or `finance`.
- `status` – use `published` for live articles; homepage only queries `status = 'published'`.
- `tags` – arbitrary topical tags used for display only on the homepage.
- `published_at` – optional; when set, homepage sorts by newest first (falls back to `created_at`).

