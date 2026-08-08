"use client";

import Link from "next/link";
import { Terminal, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                <Terminal size={15} className="text-white" />
              </span>
              <span className="text-base font-extrabold">
                Di<span className="gradient-text">paste</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Tempat berbagi kode, paste, dan repository secara instan. Cepat, modern, dan gratis untuk semua.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-faint">Produk</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
                <Link href="/" className="hover:text-white">Beranda</Link>
                <Link href="/search" className="hover:text-white">Jelajah</Link>
                <Link href="/create" className="hover:text-white">Buat Paste</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-faint">Komunitas</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
                <Link href="/about" className="hover:text-white">Tentang</Link>
                <Link href="/login" className="hover:text-white">Daftar</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-faint">Lainnya</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
                <a href="#" className="hover:text-white">Status</a>
                <a href="#" className="hover:text-white">Bantuan</a>
              </div>
            </div>
          </div>
        </div>
        <div className="divider mt-10" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Dipaste. Dibuat dengan <Heart size={12} className="inline text-rose-500" /> dan Firebase.</p>
          <a href="#" className="inline-flex items-center gap-1.5 hover:text-white">
            <Github size={14} /> GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
