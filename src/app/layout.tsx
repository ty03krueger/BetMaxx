import type { Metadata } from "next";
import Providers from "./providers";
import Footer from "./components/Footer"; // ⬅️ add this import

export const metadata: Metadata = {
  title: "BetMaxx",
  description: "Best odds at a glance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Providers>
          {/* App shell: flex column so footer sits at the bottom */}
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
