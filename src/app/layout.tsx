// src/app/layout.tsx
import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "BetMaxx",
  description: "Best odds at a glance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
