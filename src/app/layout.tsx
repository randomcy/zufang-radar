import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "租房雷达 · 帮年轻人租到真正适合自己的房子",
  description:
    "用 Conjoint Analysis 反推你的隐性偏好，结合通勤地图和小红书真实声音，告诉你哪个小区才是你的菜。",
  keywords: ["北京租房", "小红书", "租房", "通勤", "小区评价"],
};

export const viewport: Viewport = {
  themeColor: "#FF2442",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t border-border/60 bg-background py-8 mt-16">
          <div className="container text-center text-xs text-muted-foreground">
            <p>租房雷达 · 小红书面试 Demo · 数据均为虚构</p>
            <p className="mt-1">© 2025 zufang-radar · Made for 小红书 with care.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
