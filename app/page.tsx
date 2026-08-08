"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  FileCode2,
  FolderGit2,
  Rocket,
  Zap,
  ShieldCheck,
  Users,
  Heart,
  Flame,
  Clock,
} from "lucide-react";
import { getPopular, getLatest, getFeedRepos } from "@/lib/db";
import type { Repo } from "@/lib/types";
import { RepoCard } from "@/components/RepoCard";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { profile, authUser } = useAuth();
  const [q, setQ] = useState("");
  const [popular, setPopular] = useState<Repo[] | null>(null);
  const [latest, setLatest] = useState<Repo[] | null>(null);
  const [feed, setFeed] = useState<Repo[] | null>(null);
  const [tab, setTab] = useState<"populer" | "terbaru" | "ikuti">("populer");

  useEffect(() => {
    getPopular("stars", 8).then(setPopular);
    getLatest(8).then(setLatest);
  }, []);

  useEffect(() => {
    if (profile?.following?.length) getFeedRepos(profile.following).then(setFeed);
  }, [profile?.uid]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const features = [
    { icon: FileCode2, title: "Multi-file", desc: "Upload banyak file sekaligus, lengkap dengan README." },
    { icon: FolderGit2, title: "Repository", desc: "Setiap paste punya link sendiri & bisa dibagikan." },
    { icon: Rocket, title: "Super cepat", desc: "Berbasis Firebase, langsung tampil seketika." },
    { icon: ShieldCheck, title: "Aman & privat", desc: "Hanya kamu & admin yang bisa menghapus paste-mu." },
    { icon: Zap, title: "Syntax highlight", desc: "Kode berwarna otomatis untuk 30+ bahasa." },
    { icon: Users, title: "Komunitas", desc: "Like, follow, dan temukan kreator keren." },
  ];

  const list = tab === "populer" ? popular : tab === "terbaru" ? latest : feed;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-violet-700/25 blur-[130px] animate-blob" />
        <div className="pointer-events-none absolute top-20 right-0 h-72 w-72 rounded-full bg-fuchsia-600/15 blur-[110px] animate-blob2" />

        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:pt-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="chip mx-auto">
              <Flame size={13} className="text-orange-400" />
              Gratis selamanya · Dibuat dengan 💜
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Bagikan kode
              <br />
              <span className="gradient-text">lebih keren</span>, lebih cepat.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Paste, upload banyak file, tambahkan README & tag, lalu bagikan link-nya.
              Seperti Pastebin — tapi jauh lebih modern.
            </p>

            <form onSubmit={submit} className="mx-auto mt-9 max-w-xl">
              <div className="group flex items-center gap-2 rounded-2xl border border-line bg-card/80 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20">
                <Search size={18} className="ml-3 shrink-0 text-faint" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari repository, tag, atau username..."
                  className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-faint outline-none"
                />
                <button className="btn btn-primary btn-md shrink-0">
                  <Search size={15} />
                  <span className="hidden sm:inline">Cari</span>
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/create" className="btn btn-primary btn-lg w-full sm:w-auto">
                <Plus size={18} /> Buat Paste Sekarang
              </Link>
              <Link href="/about" className="btn btn-ghost btn-lg w-full sm:w-auto">
                Pelajari selengkapnya
              </Link>
            </div>

            <p className="mt-6 font-mono text-xs text-faint">
              https://dipaste.vercel.app/<span className="text-violet-300">nama-repository</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-line/60 bg-surface/60">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6">
          {[
            ["∞", "Paste dibuat"],
            ["30+", "Bahasa kode"],
            ["100%", "Gratis"],
            ["0", "Iklan mengganggu"],
          ].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="gradient-text text-3xl font-extrabold">{v}</p>
              <p className="mt-1 text-xs text-muted">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REPOS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              {tab === "populer" ? "🔥 Populer" : tab === "terbaru" ? "⚡ Terbaru" : "❤️ Dari orang yang kamu ikuti"}
            </h2>
            <p className="mt-1 text-sm text-muted">Jelajahi karya kreator dari seluruh dunia.</p>
          </div>
          <div className="flex gap-1 rounded-xl bg-raised p-1">
            {(["populer", "terbaru", "ikuti"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  tab === t ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25" : "text-muted hover:text-white"
                }`}
              >
                {t === "populer" ? "Populer" : t === "terbaru" ? "Terbaru" : "Mengikuti"}
              </button>
            ))}
          </div>
        </div>

        {tab === "ikuti" && !profile?.following?.length && (
          <div className="card mt-8 p-10 text-center">
            <Heart size={32} className="mx-auto text-faint" />
            <p className="mt-3 font-semibold text-white">Kamu belum mengikuti siapa pun</p>
            <p className="mt-1 text-sm text-muted">Ikuti kreator dari halaman profil mereka untuk melihat karya terbarunya di sini.</p>
            <Link href="/search" className="btn btn-ghost btn-md mt-5">Jelajahi kreator</Link>
          </div>
        )}

        {list === null ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="skeleton h-9 w-9 rounded-full" />
                <div className="skeleton mt-4 h-5 w-3/4" />
                <div className="skeleton mt-2 h-4 w-full" />
                <div className="skeleton mt-5 h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="card mt-8 p-10 text-center">
            <FileCode2 size={32} className="mx-auto text-faint" />
            <p className="mt-3 text-sm text-muted">Belum ada repository. Jadilah yang pertama!</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((r, i) => (
              <RepoCard key={r.slug} repo={r} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <span className="chip"><Clock size={13} /> Semua yang kamu butuhkan</span>
          <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
            Lebih dari sekadar <span className="gradient-text">pastebin</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
            Dibangun khusus untuk developer modern yang ingin berbagi kode dengan cepat dan tampil beda.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card group p-6 transition-all hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-900/20"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/25 to-indigo-600/25 border border-violet-500/25 text-violet-300 transition-transform group-hover:scale-110">
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 font-bold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/60 via-surface to-fuchsia-950/40 p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-violet-600/30 blur-[90px]" />
          <h2 className="relative text-2xl font-extrabold sm:text-3xl">
            Siap berbagi karya pertamamu?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-muted">
            Daftar gratis, upload file, dan dapatkan link-nya dalam hitungan detik.
          </p>
          <Link href={authUser ? "/create" : "/login"} className="btn btn-primary btn-lg relative mt-7">
            <Plus size={18} /> Mulai Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}
