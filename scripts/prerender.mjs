#!/usr/bin/env node
/**
 * Post-build step: writes a static index.html snapshot per route into dist/,
 * each with the correct <title>, <meta description>, canonical, and OG/Twitter
 * tags for that page baked in.
 *
 * Why: this is a pure client-side SPA (no SSR). nginx serves the same
 * dist/index.html for every route (see nginx.conf's `try_files ... /index.html`),
 * so without this step every URL — service pages, blog posts, About, etc. —
 * returns the homepage's title/description/canonical to crawlers and social
 * previews that don't execute JavaScript. React's own per-page SEO hooks
 * (useSEO/useCanonical) only fix what a JS-executing visitor sees, after the
 * fact.
 *
 * This script writes real files at dist/<route>/index.html, which nginx's
 * existing `try_files $uri $uri/ /index.html;` rule serves directly for that
 * exact path — no nginx.conf change needed. A real browser still loads the
 * full React app on top: App.tsx uses createRoot() (not hydrateRoot()), so it
 * fully re-renders over this static shell rather than hydrating it.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const BASE_URL = "https://www.lflauto.co.uk";
const S3_BASE = "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com";

const template = readFileSync(join(DIST, "index.html"), "utf8");

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function withMeta(html, { path, title, description, robots, extraHead = "" }) {
  const url = `${BASE_URL}${path}`;
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeAttr(description)}" />`
  );
  out = out.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  out = out.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeAttr(title)}" />`
  );
  out = out.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeAttr(description)}" />`
  );
  out = out.replace(
    /<meta property="twitter:url" content="[^"]*" \/>/,
    `<meta property="twitter:url" content="${url}" />`
  );
  out = out.replace(
    /<meta property="twitter:title" content="[^"]*" \/>/,
    `<meta property="twitter:title" content="${escapeAttr(title)}" />`
  );
  out = out.replace(
    /<meta property="twitter:description" content="[^"]*" \/>/,
    `<meta property="twitter:description" content="${escapeAttr(description)}" />`
  );
  out = out.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  if (robots) {
    out = out.replace("</head>", `    <meta name="robots" content="${robots}" />\n  </head>`);
  }
  if (extraHead) {
    out = out.replace("</head>", `    ${extraHead}\n  </head>`);
  }
  return out;
}

function writeRoute(path, html) {
  // Flat "<route>.html" files, not "<route>/index.html" — nginx's directory
  // index handling 301-redirects "/about" to "/about/" when a matching
  // directory exists, which would contradict the trailing-slash-free
  // canonical this same file sets. A flat file has no such directory-index
  // behavior: nginx's `try_files $uri $uri.html ...` serves it directly.
  const file = join(DIST, `${path.replace(/^\//, "")}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html, "utf8");
  console.log(`  prerendered ${path}`);
}

async function fetchJsonSafe(url, fallback) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

// ---- static pages ----
const STATIC_PAGES = [
  {
    path: "/about",
    title: "About Lashikala Hettiarachchi | Flautist & Composer | LTCL Qualified",
    description:
      "Meet Lashikala Hettiarachchi — LTCL & Visharad qualified flautist and composer based in Croydon, UK. Master's in Music Management, member of Just Flute Orchestra UK and Viraaga Orchestra.",
  },
  {
    path: "/portfolio",
    title: "Performances & Portfolio | Lashikala Hettiarachchi, Flautist",
    description:
      "Explore recent performances, concerts, and collaborations by Sri Lankan flautist Lashikala Hettiarachchi across the UK and internationally.",
  },
  {
    path: "/awards",
    title: "Awards & Achievements | Lashikala Hettiarachchi",
    description:
      "National Youth Award-winning flautist Lashikala Hettiarachchi's achievements, qualifications, and recognitions in Western and Indian classical music.",
  },
  {
    path: "/gallery",
    title: "Photo Gallery | Lashikala Hettiarachchi, Flautist",
    description:
      "Photo gallery of performances, teaching, and musical events featuring flautist Lashikala Hettiarachchi in Croydon, London and beyond.",
  },
  {
    path: "/contact",
    title: "Contact | Book Flute Lessons or a Performance | Lflauto",
    description:
      "Get in touch to book flute lessons in Croydon, London & Surrey, or enquire about live flute performances for weddings and events.",
  },
  {
    path: "/blog",
    title: "Blog | Flute Tips, Music Theory & Insights | Lflauto",
    description:
      "Flute practice tips, music theory guides, and insights from Sri Lankan flautist Lashikala Hettiarachchi's musical journey.",
  },
  {
    path: "/sitemap",
    title: "Sitemap | Lflauto",
    description: "Browse all pages on the LF Flauto website.",
    robots: "noindex, follow",
  },
];

console.log("Prerendering static pages...");
for (const page of STATIC_PAGES) {
  writeRoute(page.path, withMeta(template, page));
}

// ---- service pages ----
// Falls back to these defaults (kept in sync with src/lib/servicePageStorage.ts)
// if data/service-pages.json hasn't been created/edited via the admin dashboard yet.
const DEFAULT_SERVICE_PAGES = {
  "western-flute-lessons-london": {
    metaTitle: "Western Flute Lessons London | LTCL Qualified Teacher | Lflauto",
    metaDescription:
      "Western classical flute lessons in London, Croydon & Surrey with LTCL-qualified flautist Lashikala Hettiarachchi. Beginners welcome. ABRSM & Trinity exam preparation. In-person and online.",
  },
  "bansuri-lessons-croydon": {
    metaTitle: "Bansuri Lessons Croydon | Indian Flute Teacher London | Lflauto",
    metaDescription:
      "Learn the bansuri (Indian bamboo flute) in Croydon & London with Visharad-qualified flautist Lashikala Hettiarachchi. North Indian classical raags, Bollywood music & exam preparation. Online lessons available.",
  },
  "flute-performance-events": {
    metaTitle: "Flute Performances for Weddings & Events | London | Lflauto",
    metaDescription:
      "Book professional live flute music for weddings, corporate events & parties in London, Croydon & Surrey. Western classical, Bollywood & fusion on flute and bansuri — solo or with ensemble.",
  },
};

console.log("Fetching service page content...");
const servicePages = await fetchJsonSafe(`${S3_BASE}/data/service-pages.json`, {});

console.log("Prerendering service pages...");
for (const [slug, fallback] of Object.entries(DEFAULT_SERVICE_PAGES)) {
  const content = { ...fallback, ...servicePages[slug] };
  writeRoute(
    `/${slug}`,
    withMeta(template, { path: `/${slug}`, title: content.metaTitle, description: content.metaDescription })
  );
}

// ---- blog posts ----
console.log("Fetching published articles...");
const articleIndex = await fetchJsonSafe(`${S3_BASE}/data/articles/index.json`, []);
const published = Array.isArray(articleIndex) ? articleIndex.filter((a) => a.status === "published") : [];

console.log(`Prerendering ${published.length} blog post(s)...`);
for (const article of published) {
  const path = `/blog/${article.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary,
    image: article.coverImage || undefined,
    author: { "@type": "Person", name: article.author, url: BASE_URL },
    publisher: { "@type": "Person", name: "Lashikala Hettiarachchi", url: BASE_URL },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    url: `${BASE_URL}${path}`,
    keywords: (article.tags || []).join(", "),
  };
  writeRoute(
    path,
    withMeta(template, {
      path,
      title: `${article.title} | LF Flauto`,
      description: article.summary || "",
      extraHead: `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    })
  );
}

console.log(
  `\nDone: ${STATIC_PAGES.length} static pages, ${Object.keys(DEFAULT_SERVICE_PAGES).length} service pages, ${published.length} blog post(s) prerendered.`
);
