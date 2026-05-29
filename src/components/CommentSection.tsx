import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, User, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fetchComments, addComment } from "@/lib/commentStorage";
import type { Comment } from "@/types/comment";

const USERNAME_KEY = "lf_comment_username";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  slug: string;
}

export default function CommentSection({ slug }: Props) {
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY) ?? "");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [contentError, setContentError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoadingComments(true);
    fetchComments(slug).then((data) => {
      setComments(data);
      setLoadingComments(false);
    });
  }, [slug]);

  // Persist username
  useEffect(() => {
    if (username) localStorage.setItem(USERNAME_KEY, username);
  }, [username]);

  function validate(): boolean {
    let ok = true;
    if (!username.trim()) { setUsernameError("Please enter a display name."); ok = false; }
    else if (username.trim().length > 30) { setUsernameError("Max 30 characters."); ok = false; }
    else setUsernameError("");

    if (!content.trim()) { setContentError("Comment cannot be empty."); ok = false; }
    else if (content.trim().length > 1000) { setContentError("Max 1000 characters."); ok = false; }
    else setContentError("");

    return ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const updated = await addComment(slug, username, content);
      setComments(updated);
      setContent("");
      toast({ title: "Comment posted!", description: "Your comment is now live." });
    } catch (err) {
      toast({ title: "Failed to post", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16 pt-10 border-t border-border" ref={formRef}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="font-playfair text-2xl font-bold text-foreground">
          {loadingComments ? "Comments" : `Comments (${comments.length})`}
        </h2>
      </div>

      {/* Comment list */}
      {loadingComments ? (
        <div className="flex items-center gap-2 text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading comments…
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground italic py-4">
          No comments yet — be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4 mb-10">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="bg-muted/30 border border-border rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">{c.username}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                    <Clock className="w-3 h-3" />
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap pl-10 leading-relaxed">
                  {c.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Post comment form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-playfair text-lg font-semibold text-foreground mb-5">
          Leave a comment
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Display name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Choose a name (e.g. MusicLover, Jane)"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(""); }}
              maxLength={30}
              className={usernameError ? "border-destructive" : ""}
              disabled={submitting}
            />
            <div className="flex justify-between mt-1">
              {usernameError
                ? <p className="text-xs text-destructive">{usernameError}</p>
                : <p className="text-xs text-muted-foreground">This is shown publicly with your comment</p>}
              <span className="text-xs text-muted-foreground">{username.length}/30</span>
            </div>
          </div>

          {/* Comment body */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Comment <span className="text-destructive">*</span>
            </label>
            <textarea
              placeholder="Share your thoughts…"
              value={content}
              onChange={(e) => { setContent(e.target.value); setContentError(""); }}
              maxLength={1000}
              rows={4}
              disabled={submitting}
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background
                placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring focus-visible:ring-offset-2 resize-none
                ${contentError ? "border-destructive" : "border-input"}`}
            />
            <div className="flex justify-between mt-1">
              {contentError
                ? <p className="text-xs text-destructive">{contentError}</p>
                : <span />}
              <span className="text-xs text-muted-foreground">{content.length}/1000</span>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting…</>
              : <><Send className="w-4 h-4 mr-2" /> Post Comment</>}
          </Button>
        </form>
      </div>
    </section>
  );
}
