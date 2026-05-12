"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, FileSearch, Quote } from "lucide-react";
import type { Community, Post } from "@/types";
import { extractKeywords } from "@/lib/postTopics";
import { PostsSection } from "./PostsSection";

interface Props {
  community: Community;
  posts: Post[];
}

export function CommunityInteractive({ community, posts }: Props) {
  // 当用户点击某条 pro/con 时，记录该条目作为外部 filter
  const [activeEvidence, setActiveEvidence] = useState<{
    label: string;
    keywords: string[];
  } | null>(null);

  // 滚动到帖子区
  const scrollToPosts = () => {
    setTimeout(() => {
      document
        .getElementById("posts-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleClickItem = (title: string, summary: string) => {
    const keywords = extractKeywords(`${title} ${summary}`);
    setActiveEvidence({ label: title, keywords });
    scrollToPosts();
  };

  return (
    <>
      {/* ===== 优缺点 TOP3（可点击）===== */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Pros */}
        <Card className="p-6">
          <h2 className="text-base font-bold flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ThumbsUp className="h-4 w-4" />
            </div>
            优点 TOP 3
          </h2>
          <div className="space-y-3">
            {community.pros.map((p, i) => (
              <button
                key={i}
                onClick={() => handleClickItem(p.title, p.summary)}
                className="w-full text-left pl-3 border-l-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-r-md py-1 -my-1 px-2 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm group-hover:text-emerald-700 transition-colors">
                    {p.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                    <FileSearch className="h-2.5 w-2.5" />
                    {p.evidenceCount} 条证据
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {p.summary}
                </p>
                {p.evidence && p.evidence.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {p.evidence.slice(0, 2).map((q, qi) => (
                      <div key={qi} className="flex items-start gap-1.5 text-[11px] text-emerald-900/70 leading-snug bg-emerald-50/50 rounded px-2 py-1">
                        <Quote className="h-2.5 w-2.5 mt-0.5 shrink-0 text-emerald-500" />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/70 mt-3 text-center">
            点击任意条目查看全部支撑帖子
          </p>
        </Card>

        {/* Cons */}
        <Card className="p-6">
          <h2 className="text-base font-bold flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <ThumbsDown className="h-4 w-4" />
            </div>
            缺点 TOP 3
          </h2>
          <div className="space-y-3">
            {community.cons.map((c, i) => (
              <button
                key={i}
                onClick={() => handleClickItem(c.title, c.summary)}
                className="w-full text-left pl-3 border-l-2 border-rose-300 hover:border-rose-500 hover:bg-rose-50/40 rounded-r-md py-1 -my-1 px-2 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm group-hover:text-rose-700 transition-colors">
                    {c.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0 group-hover:bg-rose-100 group-hover:text-rose-700 transition-colors">
                    <FileSearch className="h-2.5 w-2.5" />
                    {c.evidenceCount} 条证据
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {c.summary}
                </p>
                {c.evidence && c.evidence.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {c.evidence.slice(0, 2).map((q, qi) => (
                      <div key={qi} className="flex items-start gap-1.5 text-[11px] text-rose-900/70 leading-snug bg-rose-50/50 rounded px-2 py-1">
                        <Quote className="h-2.5 w-2.5 mt-0.5 shrink-0 text-rose-500" />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/70 mt-3 text-center">
            点击任意条目查看全部支撑帖子
          </p>
        </Card>
      </div>

      {/* ===== 真实声音（被 controlled） ===== */}
      <div id="posts-section">
        <PostsSection
          posts={posts}
          externalFilter={activeEvidence}
          onClearExternalFilter={() => setActiveEvidence(null)}
        />
      </div>
    </>
  );
}
