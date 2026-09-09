import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const newsSerif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-news",
  display: "swap",
});

export const metadata: Metadata = {
  title: "서울교육 AI 브리핑 센터",
  description: "서울교육청·교육부·연합뉴스의 실제 공개 데이터를 모아 보는 교육행정 상황판",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={newsSerif.variable}>
      <body>{children}</body>
    </html>
  );
}
