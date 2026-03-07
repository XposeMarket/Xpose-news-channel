# XposeMarket News Channel

This repo contains a Next.js App Router + Supabase scaffold for the XposeMarket news channel.

## Getting started

1. Clone the repo (or add this remote to your existing local folder):
   ```bash
   git clone git@github.com:XposeMarket/xposemarket-news-channel.git
   # or, from your existing project directory
   git remote add origin git@github.com:XposeMarket/xposemarket-news-channel.git
   git push -u origin main
   ```
2. Install dependencies:
   ```bash
   pnpm install # or npm/yarn
   ```
3. Configure environment:
   Create `.env.local` in the project root with:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
   ```
4. Run the dev server:
   ```bash
   pnpm dev
   ```

The app will be available at http://localhost:3000.

## Project structure

- `src/app/layout.tsx` – root layout + global styles
- `src/app/page.tsx` – homepage querying Supabase (with JSON fallback) for news posts
- `src/app/globals.css` – global styles
- `src/lib/supabase/client.ts` – browser Supabase client factory
- `data/*.json` – local seed content for published/drafted articles and headlines
- `SUPABASE_SCHEMA.md` – database schema and notes for the `posts` table


## Data model

- `SUPABASE_SCHEMA.md` documents the `posts` table used for news articles.
- The home page (`src/app/page.tsx`) queries `public.posts` for the latest `status = 'published'` rows, groups them into **World**, **AI**, **Tech**, and **Finance** sections, and renders title, tags, and teaser with links to `/articles/[slug]` (future route).
- During early setup (before Supabase has rows or when queries fail), the home page falls back to `data/published-articles.json` and `data/drafted-articles.json` as local seed content.

## Git remote

The canonical GitHub remote for this project is:

```bash
git@github.com:XposeMarket/xposemarket-news-channel.git
```


