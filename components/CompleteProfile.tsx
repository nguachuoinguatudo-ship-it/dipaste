"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, AtSign, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { createProfile } from "@/lib/db";
import { useToast } from "@/components/Toast";

export function CompleteProfile() {
  const { authUser } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!authUser) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await createProfile(authUser.uid, {
      username,
      name: name || username,
      email: authUser.email || "",
    });
    if (!res.ok) {
      toast(res.error || "Gagal menyimpan profil.", "error");
      setBusy(false);
      return;
    }
    toast("Profil berhasil dibuat! Selamat datang. 🎉");
    setBusy(false);
  };

  const input =
    "w-full rounded-xl border border-line bg-raised py-3 pl-11 pr-4 text-sm text-white placeholder:text-faint outline-none transition-all focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/30">
            <Sparkles size={26} className="text-white" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Lengkapi profilmu</h1>
          <p className="mt-2 text-sm text-muted">
            Akunmu belum punya profil. Buat username unik untuk mulai berbagi kode.
          </p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">@</span>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="username (3-20 karakter, lowercase)"
              maxLength={20}
              className={input}
            />
          </div>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
            <input
              placeholder="Nama tampilan (opsional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className={input}
            />
          </div>
          <button disabled={busy} className="btn btn-primary btn-lg w-full disabled:opacity-60">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <AtSign size={18} />}
            {busy ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
