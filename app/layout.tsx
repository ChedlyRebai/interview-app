import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// NOTE: Disabled google font import to avoid remote font fetch failures in
// environments without outbound network access. To re-enable, either restore
// `next/font/google` usage or host the font files locally and use
// `next/font/local`.

export const metadata: Metadata = {
  title: "Interview APP",
  description: "Ai powered interview app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased pattern`}> 
        {children}
        <Toaster />
      </body>
    </html>
  );
}
