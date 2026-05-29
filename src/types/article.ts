export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // HTML from Tiptap
  coverImage?: string;
  tags: string[];
  author: string;
  publishedAt?: string; // ISO, only set on publish
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export type ArticleMeta = Omit<Article, "content">;
