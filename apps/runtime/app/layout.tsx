import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cradle Runtime" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
