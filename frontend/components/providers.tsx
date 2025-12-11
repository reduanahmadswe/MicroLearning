"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReduxProvider } from "@/store/ReduxProvider";

export function Providers({ children }: { children: ReactNode }) {
  // Use environment variable or fallback placeholder
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
