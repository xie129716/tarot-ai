import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "星辰之镜 — AI塔罗牌占卜",
  description:
    "通过手势识别与AI智能解读，探索塔罗牌的奥秘。一款融合前沿AI技术与古老智慧的互动占卜体验。",
  keywords: ["塔罗牌", "AI占卜", "手势识别", "DeepSeek", "塔罗解读"],
  openGraph: {
    title: "星辰之镜 — AI塔罗牌占卜",
    description: "手势选择塔罗牌，AI为你解读命运的暗示",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a1a] font-sans">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(15, 15, 35, 0.95)",
              color: "#e8e0f0",
              border: "1px solid rgba(147, 112, 219, 0.2)",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
