import "@/app/globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { UserProvider } from "@/contexts/user-context";
import { LoadingProvider } from "@/contexts/loading-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CrowdVibe - Collaborative Game Coding",
  description: "Collaboratively code games together with the community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="crowdvibe-theme"
          >
            <LoadingProvider>{children}</LoadingProvider>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
