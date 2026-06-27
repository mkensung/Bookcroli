import type { Metadata } from "next";
import { Inter } from "next/font/google";
// 🚀 บรรทัดนี้คือสายไฟที่หลุดไปครับ! สั่งให้ดึงสีมาใช้
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bookcroli",
  description: "An AI-powered book translation app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-vibrant-palette="true">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}