import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import AuthMiddleware from "@/components/auth/AuthMiddleware";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MicroLearning - AI-Powered Learning Platform",
  description: "Learn anything in 1-2 minutes with AI-generated micro lessons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthMiddleware>
            {children}
            <Toaster position="top-right" richColors />
          </AuthMiddleware>
        </Providers>
      </body>
    </html>
  );
}
