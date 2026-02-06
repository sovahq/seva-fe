import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PageTransition, SiteHeader } from "@/components/layout";
import { Providers } from "./providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Seva",
  description: "Manage your Local Organisation — governance, members, events, and finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <PageTransition>{children}</PageTransition>
          </div>
        </Providers>
      </body>
    </html>
  );
}
