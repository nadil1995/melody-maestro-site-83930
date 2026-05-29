import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Comment } from "@/types/comment";

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

function commentKey(slug: string) {
  return `data/articles/comments/${slug}.json`;
}

async function s3Put(key: string, body: string) {
  const client = buildClient();
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: "application/json" }),
    { expiresIn: 3600 }
  );
  const res = await fetch(url, {
    method: "PUT",
    body,
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`S3 write failed: ${res.status}`);
}

export async function fetchComments(slug: string): Promise<Comment[]> {
  try {
    // Use no-cors-style: if S3 returns 403/404 (file not yet created) treat as empty.
    const res = await fetch(`${S3_BASE}/${commentKey(slug)}?t=${Date.now()}`);
    if (res.status === 403 || res.status === 404 || !res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Admin-only: creates an empty comments file for a slug if one doesn't exist.
 * Eliminates 403 console noise for readers visiting that article.
 */
export async function ensureCommentsFile(slug: string): Promise<Comment[]> {
  try {
    const res = await fetch(`${S3_BASE}/${commentKey(slug)}?t=${Date.now()}`);
    if (res.ok) return res.json();
    await s3Put(commentKey(slug), "[]");
    return [];
  } catch {
    return [];
  }
}

export async function addComment(
  slug: string,
  username: string,
  content: string
): Promise<Comment[]> {
  const current = await fetchComments(slug);
  const comment: Comment = {
    id: crypto.randomUUID(),
    articleSlug: slug,
    username: username.trim().slice(0, 30),
    content: content.trim().slice(0, 1000),
    createdAt: new Date().toISOString(),
  };
  const updated = [...current, comment];
  await s3Put(commentKey(slug), JSON.stringify(updated, null, 2));
  return updated;
}

export async function deleteComment(slug: string, commentId: string): Promise<Comment[]> {
  const current = await fetchComments(slug);
  const updated = current.filter((c) => c.id !== commentId);
  await s3Put(commentKey(slug), JSON.stringify(updated, null, 2));
  return updated;
}
