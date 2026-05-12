"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/types";
import {
  groupPostsByPrimary,
  filterPostsByKeywords,
  type PostTopic,
} from "@/lib/postTopics";
import { ThumbsUp, ThumbsDown, Home, FileText, X } from "lucide-react";

const TABS: Array<{ key: PostTopic | "全部"; label: string; icon: React.ElementType }> =
  [
    { key: "全部", label: "全部", icon: FileText },
    { key: "优点", label: "好评", icon: ThumbsUp },
    { key: "缺点", label: "槽点", icon: ThumbsDown },
    { key: "居住体验", label: "居住体验", icon: Home },
  ];

interface Props {
  posts: Post[];
  /** 来自父组件的过滤（点击了某个 pro/con 时联动） */
  externalFilter?: { label: string; keywords: string[] } | null;
  onClearExternalFilter?: () => void;
}

export function PostsSection({
  posts,
  externalFilter,
  onClearExternalFilter,
}: Props) {
  const [tab, setTab] = useState<PostTopic | "全部">("全部");

  const buckets = useMemo(() => groupPostsByPrimary(posts), [posts]);

  // 计算每个 tab 的数量
  const counts: Record<PostTopic | "全部", number> = {
    "全部": posts.length,
    "优点": buckets["优点"].length,
    "缺点": buckets["缺点"].length,
    "居住体验": buckets["居住体验"].length,
    "价格": 0,
    "通勤": 0,
    "配套": 0,
    "物业": 0,
  };

  // 当前展示的帖子
  const filtered = useMemo(() => {
    if (externalFilter) {
      return filterPostsByKeywords(posts, externalFilter.keywords);
    }
    if (tab === "全部") return posts;
    return buckets[tab];
  }, [posts, buckets, tab, externalFilter]);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">真实声音</h2>
          <p className="text-xs text-muted-foreground mt-1">
            来自住过这里的人的真实记录（数据为虚构 mock）
          </p>
        </div>
        <Badge variant="soft">{posts.length} 条</Badge>
      </div>

      {/* ===== 外部过滤态（从优缺点点过来）===== */}
      {externalFilter && (
        <div className="mb-4 inline-flex items-center gap-2 bg-brand-red-pale/40 border border-brand-red/20 rounded-lg px-3 py-2 text-sm">
          <span className="text-muted-foreground">查看证据：</span>
          <span className="font-semibold text-brand-red-deep">
            {externalFilter.label}
          </span>
          <span className="text-xs text-muted-foreground">
            ({filtered.length} 条相关)
          </span>
          <button
            onClick={onClearExternalFilter}
            className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-md hover:bg-white/80 text-muted-foreground hover:text-brand-red transition-colors"
            aria-label="清除筛选"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ===== Tab 切换（外部 filter 时禁用）===== */}
      {!externalFilter && (
        <div className="flex flex-wrap gap-2 mb-4 border-b border-border/60 pb-3">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            const count = counts[key];
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                  active
                    ? "bg-brand-red text-white shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span
                  className={`text-[10px] font-mono tabular-nums ${
                    active ? "text-white/80" : "text-muted-foreground/70"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ===== 列表 ===== */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm bg-secondary/30 rounded-xl">
          暂无相关帖子
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.slice(0, 6).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {filtered.length > 6 && (
        <div className="text-center mt-4 text-xs text-muted-foreground">
          还有 {filtered.length - 6} 条，可在产品化版本中查看更多
        </div>
      )}
    </div>
  );
}
