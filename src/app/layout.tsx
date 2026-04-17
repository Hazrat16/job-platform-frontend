import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JobPlatform - Find Your Dream Job or Hire the Best Talent",
  description:
    "Connect with opportunities that match your skills and aspirations. Whether you're looking for your next career move or building your dream team, JobPlatform makes it simple and effective.",
  keywords:
    "jobs, careers, employment, hiring, recruitment, job search, job posting",
  authors: [{ name: "JobPlatform Team" }],
  openGraph: {
    title: "JobPlatform - Find Your Dream Job or Hire the Best Talent",
    description:
      "Connect with opportunities that match your skills and aspirations.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen antialiased bg-slate-50 text-slate-900`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            className: "!rounded-xl !shadow-lg !px-4 !py-3 !text-sm !font-medium",
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              maxWidth: "min(100vw - 2rem, 28rem)",
            },
            success: {
              duration: 3200,
              iconTheme: {
                primary: "#22c55e",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4800,
              iconTheme: {
                primary: "#f87171",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
