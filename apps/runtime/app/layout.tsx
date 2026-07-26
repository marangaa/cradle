import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cradle Runtime",
  description: "The Cradle runtime serves the widget, manifest, and companion API for your installation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          :root { --ink: #111; --paper: #f4f3ed; --blue: #3559ff; --yellow: #e7ff36; --pink: #ff8bd4; --muted: #54544f; --soft: #dad9d1; --mono: "SFMono-Regular", Consolas, monospace; --sans: system-ui, Arial, sans-serif; }
          * { box-sizing: border-box; }
          html, body { min-height: 100%; margin: 0; background: var(--paper); color: var(--ink); font-family: var(--sans); }
          body { background-image: linear-gradient(rgba(17,17,17,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,.09) 1px, transparent 1px); background-size: 28px 28px; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
