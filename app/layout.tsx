import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";

export const metadata: Metadata = {
  title: {
    default: "Dipaste — Bagikan kode dengan gaya",
    template: "%s • Dipaste",
  },
  description:
    "Dipaste adalah platform modern untuk berbagi kode, paste, dan repository. Upload banyak file, README, tag, dan bagikan link-nya ke siapa saja.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <ToastProvider>
            <MaintenanceGuard>
              <Navbar />
              <main className="min-h-[70vh]">{children}</main>
              <Footer />
            </MaintenanceGuard>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
