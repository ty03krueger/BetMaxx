import type { Metadata } from "next";
import Providers from "./providers";
import Footer from "./components/Footer";
import { BooksProvider } from "./contexts/BookProvider";

export const metadata: Metadata = {
  title: "BetMaxx",
  description: "Best odds at a glance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Providers>
          <BooksProvider>
            {/* App shell: flex column so footer sits at the bottom */}
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
              <main style={{ flex: 1 }}>
                {children}
              </main>
              <Footer />
            </div>
          </BooksProvider>
        </Providers>
      </body>
    </html>
  );
}
