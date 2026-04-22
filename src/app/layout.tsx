import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html lang="en" className={plusJakarta.variable}>
      <body
        className={`${plusJakarta.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            className:
              "!rounded-2xl !border !border-slate-700/40 !shadow-2xl !shadow-indigo-950/20 !px-4 !py-3 !text-sm !font-medium !backdrop-blur-md",
            style: {
              background: "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,27,75,0.92))",
              color: "#f8fafc",
              maxWidth: "min(100vw - 2rem, 28rem)",
            },
            success: {
              duration: 3200,
              iconTheme: {
                primary: "#34d399",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4800,
              iconTheme: {
                primary: "#fb7185",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
