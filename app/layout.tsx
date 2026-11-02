import type { Metadata } from "next";
import "./globals.css";
import { companion } from "./companion";

export const metadata: Metadata = {
  title: `${companion.productName} | Learn Twitch by doing`,
  description: "A tiny daily learning path that turns Twitch knowledge into real streaming practice.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: companion.imagePath,
  },
  appleWebApp: { capable: true, title: companion.productName, statusBarStyle: "default" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
