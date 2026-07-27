import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./styles.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Cradle Studio",
  description: "Create and install an animated website character.",
  referrer: "no-referrer",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}

