import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Article, ArticleMeta } from "@/types/article";

const BUCKET = import.meta.env.VITE_S3_BUCKET as string;
const REGION = import.meta.env.VITE_S3_REGION as string;
const S3_BASE = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

function buildClient() {
  return new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID as string,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY as string,
    },
  });
}

async function s3Put(key: string, body: string, contentType: string) {
  const client = buildClient();
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 3600 }
  );
  const res = await fetch(url, {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType },
  });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status} ${res.statusText}`);
}

// ── Public reads ─────────────────────────────────────────────────────────────

export async function fetchArticleIndex(): Promise<ArticleMeta[]> {
  try {
    const res = await fetch(`${S3_BASE}/data/articles/index.json?t=${Date.now()}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Called once by the admin panel on first open.
 * Creates data/articles/index.json with [] if it doesn't exist,
 * which converts S3 403/404 on GET to a clean 200 [] for all site visitors.
 */
export async function ensureArticlesIndex(): Promise<ArticleMeta[]> {
  try {
    const res = await fetch(`${S3_BASE}/data/articles/index.json?t=${Date.now()}`);
    if (res.ok) return res.json();
    // 403 or 404 — file missing, create it now using admin credentials
    await s3Put("data/articles/index.json", "[]", "application/json");
    return [];
  } catch {
    return [];
  }
}

export async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${S3_BASE}/data/articles/${slug}.json?t=${Date.now()}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Admin writes ──────────────────────────────────────────────────────────────

/** Save (create or update) an article and refresh the index. */
export async function saveArticle(article: Article, index: ArticleMeta[]): Promise<void> {
  // 1. Save full article file
  await s3Put(
    `data/articles/${article.slug}.json`,
    JSON.stringify(article, null, 2),
    "application/json"
  );

  // 2. Rebuild index (upsert)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content: _omit, ...meta } = article;
  const filtered = index.filter((a) => a.id !== article.id);
  filtered.push(meta);
  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  await s3Put(
    "data/articles/index.json",
    JSON.stringify(filtered, null, 2),
    "application/json"
  );
}

/** Delete an article and refresh the index. */
export async function deleteArticle(id: string, slug: string, index: ArticleMeta[]): Promise<void> {
  // Remove from index (we can't delete S3 objects without DELETE permission,
  // so we just tombstone by removing from index — the slug file stays but is unreachable)
  const filtered = index.filter((a) => a.id !== id);
  await s3Put(
    "data/articles/index.json",
    JSON.stringify(filtered, null, 2),
    "application/json"
  );
  // Optionally overwrite slug file with empty marker so it won't be fetched
  // (no hard delete required; index controls visibility)
  void slug;
}

/** Upload an image into the articles folder and return its public URL. */
export async function uploadArticleImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `articles/images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const client = buildClient();
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: file.type }),
    { expiresIn: 3600 }
  );
  const res = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);

  return `${S3_BASE}/${key}`;
}

/** Slugify a title */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
