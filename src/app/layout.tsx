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
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
