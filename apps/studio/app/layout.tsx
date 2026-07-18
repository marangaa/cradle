import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "./styles.css";
export const metadata: Metadata = { title: "Cradle Studio", description: "Create a living representative for your website." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
