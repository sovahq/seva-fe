import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { PageTransition, SiteHeader } from "@/components/layout";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Seva",
  description: "Manage your Local Organisation — governance, members, meetings, and finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="antialiased">
        <Providers>
          <div className="relative z-[1] flex min-h-screen flex-col">
            <SiteHeader />
            <PageTransition>{children}</PageTransition>
          </div>
        </Providers>
      </body>
    </html>
  );
}
