"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Terminal, Search, Menu, X, Plus, User, LogOut, ShieldCheck, Wrench } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { getSettings } from "@/lib/db";
import type { AppSettings } from "@/lib/types";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function Navbar() {
  const { authUser, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/about", label: "Tentang" },
    { href: "/search", label: "Jelajah" },
  ];

  const nav = (
    <>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === l.href ? "text-white bg-raised" : "text-muted hover:text-white"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <motion.span
              whileHover={{ rotate: -8, scale: 1.05 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30"
            >
              <Terminal size={18} className="text-white" />
            </motion.span>
            <span className="text-lg font-extrabold tracking-tight">
              Di<span className="gradient-text">paste</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">{nav}</nav>
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link href="/search" className="btn btn-ghost btn-md">
            <Search size={16} />
            <span className="hidden lg:inline">Cari repository</span>
          </Link>
          {authUser ? (
            <>
              <Link href="/create" className="btn btn-primary btn-md">
                <Plus size={16} /> <span className="hidden sm:inline">Buat Paste</span>
              </Link>
              <Link href="/me" className="rounded-full transition-transform hover:scale-105">
                <Avatar src={profile?.photoURL} name={profile?.name || authUser.email || "u"} verified={profile?.verified} size={38} />
              </Link>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-md">
              Masuk / Daftar
            </Link>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-line bg-bg/95 px-4 py-4 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-1">
            {nav}
            <div className="divider my-2" />
            {authUser ? (
              <>
                <Link href="/create" className="btn btn-primary btn-md mb-1">
                  <Plus size={16} /> Buat Paste
                </Link>
                <Link href={`/u/${profile?.username}`} className="btn btn-ghost btn-md justify-start">
                  <User size={16} /> Profil saya
                </Link>
                <Link href="/me" className="btn btn-ghost btn-md justify-start">
                  <Wrench size={16} /> Pengaturan
                </Link>
                {settings?.maintenance && (
                  <Link href="/maintenance" className="btn btn-ghost btn-md justify-start">
                    <ShieldCheck size={16} /> Status
                  </Link>
                )}
                <button
                  className="btn btn-ghost btn-md justify-start text-rose-300"
                  onClick={() => signOut(auth).then(() => router.push("/"))}
                >
                  <LogOut size={16} /> Keluar
                </button>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary btn-md">
                Masuk / Daftar
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
