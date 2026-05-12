import { Card } from "@/components/ui/card";
import { Heart, MessageCircle } from "lucide-react";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
}

const AVATAR_COLORS = [
  "from-pink-400 to-rose-500",
  "from-orange-400 to-amber-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-blue-500",
  "from-fuchsia-400 to-pink-500",
];

function colorFromString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function PostCard({ post }: PostCardProps) {
  const initial = post.author.slice(0, 1);
  return (
    <Card className="overflow-hidden hover:shadow-card-hover transition-all duration-200 flex flex-col">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${colorFromString(
              post.author
            )} text-white font-semibold text-sm shadow-sm`}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{post.author}</div>
            <div className="text-xs text-muted-foreground">{post.publishDate}</div>
          </div>
        </div>
        <h3 className="text-base font-semibold leading-snug mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-4">
          {post.content}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-xs text-brand-red-deep/80 bg-brand-red-pale/60 px-2 py-0.5 rounded-md"
            >
              #{t}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground border-t border-border/60 pt-3">
          <div className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            <span>{post.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{post.comments}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
