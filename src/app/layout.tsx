import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"]
});

export const metadata: Metadata = {
  title: "HERMES",
  description: "HERMES Landing Page"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={notoSansKr.className}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
