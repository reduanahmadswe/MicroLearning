import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MicroLearning - AI-Powered Learning Platform",
  description: "Learn anything in 1-2 minutes with AI-generated micro lessons",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
