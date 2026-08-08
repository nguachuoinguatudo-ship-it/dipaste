"use client";

import { motion } from "framer-motion";
import {
  Terminal,
  FileCode2,
  FolderGit2,
  Rocket,
  ShieldCheck,
  Zap,
  Users,
  Heart,
  BadgeCheck,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const sections = [
    {
      icon: FileCode2,
      title: "Apa itu Dipaste?",
      desc: "Dipaste adalah platform berbagi kode & teks modern. Beda dari pastebin biasa, kamu bisa upload banyak file sekaligus dalam satu repository — lengkap dengan README, tag, dan judul.",
    },
    {
      icon: FolderGit2,
      title: "Repository dengan link sendiri",
      desc: "Setiap repository punya link unik. Contohnya dipaste.vercel.app/proyek-kamu. Bisa dibagikan ke siapa saja — dilihat siapa saja, tanpa perlu akun.",
    },
    {
      icon: Zap,
      title: "Cepat & modern",
      desc: "Dibangun di atas Firebase + Next.js, dengan syntax highlighting 30+ bahasa, tampilan responsif untuk HP maupun desktop.",
    },
    {
      icon: ShieldCheck,
      title: "Privasi & kontrol",
      desc: "Kamu yang punya kendali penuh atas kontenmu. Hapus repository kapan saja. Admin hanya bertindak untuk konten melanggar aturan.",
    },
    {
      icon: Users,
      title: "Komunitas",
      desc: "Like repository favoritmu, ikuti kreator, dan tampilkan profilmu sendiri dengan foto, bio, sampai badge verifikasi biru khas Dipaste.",
    },
    {
      icon: Heart,
      title: "Gratis & terbuka",
      desc: "100% gratis untuk semua orang. Dipaste dibuat untuk mendorong developer (terutama dari Indonesia!) berbagi karya lebih banyak.",
    },
  ];

  const stats = [
    ["tanpa iklan", "100%"],
    ["bahasa", "30+"],
    ["multi-file", "∞"],
    ["gratis", "Rp 0"],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/30">
          <Terminal size={26} className="text-white" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">
          Tentang <span className="gradient-text">Dipaste</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
          Pastebin, tapi untuk era modern. Dibuat dengan ❤️ untuk para developer yang ingin berbagi kode dengan cepat, rapi, dan bergaya.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="card p-6 transition-all hover:border-violet-500/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/25 to-indigo-600/25 border border-violet-500/25 text-violet-300">
              <s.icon size={19} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-white">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="card p-6 text-center">
            <p className="gradient-text text-2xl font-extrabold">{v}</p>
            <p className="mt-1 text-xs text-muted">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        <div className="card p-6 text-center">
          <BadgeCheck size={28} className="mx-auto text-cyan-400" />
          <p className="mt-3 font-bold text-white">Badge verifikasi</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Tanda centang biru di profil & repository untuk akun resmi/terkenal.
          </p>
        </div>
        <div className="card p-6 text-center">
          <Users size={28} className="mx-auto text-violet-400" />
          <p className="mt-3 font-bold text-white">Follow & like</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Ikuti kreator favorit, like repository, dan lihat feed mereka.
          </p>
        </div>
        <div className="card p-6 text-center">
          <Globe size={28} className="mx-auto text-emerald-400" />
          <p className="mt-3 font-bold text-white">Bisa di HP & PC</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Tampilan smooth di semua perangkat — buat paste dari mana saja.
          </p>
        </div>
      </div>

      <div className="card mt-14 overflow-hidden border-violet-500/30 bg-gradient-to-br from-violet-950/50 to-surface p-10 text-center">
        <Rocket size={28} className="mx-auto text-violet-300" />
        <h2 className="mt-4 text-2xl font-extrabold">Yuk, mulai sekarang!</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Gratis, cepat, dan tanpa ribet. Karya pertamamu hanya butuh beberapa detik.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/create" className="btn btn-primary btn-lg w-full sm:w-auto">
            Buat Paste
          </Link>
          <Link href="/login" className="btn btn-ghost btn-lg w-full sm:w-auto">
            Daftar Akun
          </Link>
        </div>
      </div>
    </div>
  );
}
