import Link from "next/link";
import { createClient } from "@/src/lib/supabase/client";
import publishedSeed from "@/data/published-articles.json";
import draftedSeed from "@/data/drafted-articles.json";

const SECTIONS = ["World", "AI", "Tech", "Finance"] as const;
type SectionKey = (typeof SECTIONS)[number];

type Article = {
  title: string;
  slug: string;
  meta?: string;
  tags?: string[];
  section?: string | null;
  status?: string;
  published_at?: string | null;
  created_at?: string | null;
};

function normalizeSection(section: string | null | undefined): SectionKey | null {
  if (!section) return null;
  const s = section.toLowerCase();
  if (s === "world") return "World";
  if (s === "ai") return "AI";
  if (s === "tech") return "Tech";
  if (s === "finance") return "Finance";
  return null;
}

function inferSectionFromTags(tags?: string[]): SectionKey | null {
  if (!tags || tags.length === 0) return null;
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.includes("world") || lower.includes("geopolitics")) return "World";
  if (lower.includes("ai") || lower.includes("artificial-intelligence")) return "AI";
  if (lower.includes("technology") || lower.includes("tech")) return "Tech";
  if (lower.includes("finance") || lower.includes("markets") || lower.includes("venture-capital"))
    return "Finance";
  return null;
}

function groupBySection(rows: Article[]): Record<SectionKey, Article[]> {
  const grouped: Record<SectionKey, Article[]> = {
    World: [],
    AI: [],
    Tech: [],
    Finance: [],
  };

  for (const row of rows) {
    const explicit = normalizeSection(row.section ?? null);
    const inferred = explicit ?? inferSectionFromTags(row.tags ?? []);
    if (!inferred) continue;
    grouped[inferred].push(row);
  }

  // Sort newest first when dates are present
  for (const key of SECTIONS) {
    grouped[key].sort((a, b) => {
      const aDate = a.published_at ?? a.created_at ?? "";
      const bDate = b.published_at ?? b.created_at ?? "";
      return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
    });
  }

  return grouped;
}

export default async function HomePage() {
  const supabase = createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("title, slug, meta, tags, section, status, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  let articles: Article[] = posts ?? [];

  if ((!posts || posts.length === 0) && !error) {
    console.log("No published posts found in Supabase; falling back to local seed data.");
    const fromPublished = (publishedSeed as Article[]).map((a) => ({ ...a, status: "published" }));
    const fromDrafts = (draftedSeed as Article[]).map((a) => ({ ...a, status: "draft" }));
    articles = [...fromPublished, ...fromDrafts];
  } else if (error) {
    console.error("Error loading posts from Supabase", error);
    const fromPublished = (publishedSeed as Article[]).map((a) => ({ ...a, status: "published" }));
    const fromDrafts = (draftedSeed as Article[]).map((a) => ({ ...a, status: "draft" }));
    articles = [...fromPublished, ...fromDrafts];
  }

  const grouped = groupBySection(articles);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 p-8">
      <header className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold">Daily Macro + AI Briefing</h1>
        <p className="text-sm text-slate-300">
          Latest published articles grouped by section. Data is loaded from Supabase when available
          (falls back to local JSON seed during early setup).
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-2">
        {SECTIONS.map((section) => {
          const items = grouped[section];
          if (!items || items.length === 0) return null;

          return (
            <div key={section} className="space-y-3">
              <h2 className="text-xl font-semibold">{section}</h2>
              <div className="space-y-4">
                {items.map((article) => (
                  <article
                    key={article.slug}
                    className="rounded border border-slate-800 bg-slate-950/40 p-4 shadow-sm transition hover:border-slate-600 hover:bg-slate-900/60"
                  >
                    <h3 className="text-base font-semibold">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-sky-400 hover:text-sky-300 hover:underline"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    {article.meta && (
                      <p className="mt-1 text-xs text-slate-300">{article.meta}</p>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-3 text-[11px] text-slate-400">
                      Teaser coming soon – this links to the future article page.
                    </p>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
