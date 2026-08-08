"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Camera,
  Loader2,
  Save,
  AtSign,
  LogOut,
  FolderGit2,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { updateProfile, uploadAvatar, usernameAvailable, getUserRepos, getStarredRepos } from "@/lib/db";
import { useToast } from "@/components/Toast";
import { Avatar } from "@/components/Avatar";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Repo } from "@/lib/types";
import { RepoCard } from "@/components/RepoCard";
import Link from "next/link";
import { formatCount } from "@/lib/format";

export default function MePage() {
  const router = useRouter();
  const { authUser, profile, loading } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [myRepos, setMyRepos] = useState<Repo[]>([]);
  const [myLikes, setMyLikes] = useState<Repo[]>([]);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio);
    getUserRepos(profile.uid, "createdAt", 6).then(setMyRepos);
    getStarredRepos(profile.uid).then(setMyLikes);
  }, [profile?.uid]);

  if (loading) return null;

  if (!authUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <User size={36} className="mx-auto text-violet-400" />
        <h1 className="mt-4 text-2xl font-extrabold">Masuk dulu yuk!</h1>
        <Link href="/login" className="btn btn-primary btn-lg mt-6">Masuk / Daftar</Link>
      </div>
    );
  }

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast("Foto maksimal 5MB.", "error");
    setUploading(true);
    uploadAvatar(authUser.uid, f)
      .then((url) => updateProfile(authUser.uid, { photoURL: url }))
      .then(() => toast("Foto profil diperbarui!"))
      .catch(() => toast("Gagal upload foto.", "error"))
      .finally(() => {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const uname = username.trim().toLowerCase();
      if (uname !== profile.username) {
        if (!/^[a-z0-9_]{3,20}$/.test(uname)) {
          toast("Username 3-20 karakter, lowercase & underscore.", "error");
          return;
        }
        const ok = await usernameAvailable(uname);
        if (!ok) return void toast("Username sudah dipakai.", "error");
      }
      await updateProfile(profile.uid, {
        name: name.trim() || profile.username,
        username: uname,
        bio: bio.trim(),
      });
      toast("Profil berhasil disimpan!");
    } catch {
      toast("Gagal menyimpan profil.", "error");
    } finally {
      setSaving(false);
    }
  };

  const input =
    "w-full rounded-xl border border-line bg-raised px-4 py-3 text-sm text-white placeholder:text-faint outline-none transition-all focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Pengaturan Profil</h1>
      <p className="mt-1 text-sm text-muted">Kelola identitasmu di Dipaste.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card h-fit p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar src={profile?.photoURL} name={profile?.name} verified={profile?.verified} size={104} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-raised text-muted transition-all hover:border-violet-500/60 hover:text-white disabled:opacity-60"
                title="Ganti foto profil"
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickAvatar} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">{profile?.name}</h2>
            <p className="text-sm text-muted">@{profile?.username}</p>
            {profile?.verified && (
              <span className="mt-2 inline-flex items-center rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-bold text-cyan-300">
                Akun Terverifikasi
              </span>
            )}
            <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-raised p-3">
                <p className="text-lg font-extrabold text-white">{formatCount(myRepos.length)}</p>
                <p className="text-[10px] text-faint">REPOSITORY</p>
              </div>
              <div className="rounded-xl bg-raised p-3">
                <p className="text-lg font-extrabold text-white">{formatCount(myLikes.length)}</p>
                <p className="text-[10px] text-faint">DISUKAI</p>
              </div>
              <div className="rounded-xl bg-raised p-3">
                <p className="text-lg font-extrabold text-white">{formatCount(profile?.followers || 0)}</p>
                <p className="text-[10px] text-faint">PENGIKUT</p>
              </div>
            </div>
            <button
              onClick={() => signOut(auth).then(() => router.push("/"))}
              className="btn btn-danger btn-md mt-5 w-full"
            >
              <LogOut size={15} /> Keluar
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col gap-6">
          <form onSubmit={save} className="card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-faint">Identitas</h3>
            <div className="mt-4 flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <User size={13} /> Nama tampilan
                  </label>
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className={input} />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <AtSign size={13} /> Username
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    maxLength={20}
                    className={input}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <User size={13} /> Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder="Ceritakan tentang dirimu singkat..."
                  className={input + " resize-none"}
                />
                <p className="mt-1 text-right text-[11px] text-faint">{bio.length}/160</p>
              </div>
              <button disabled={saving} className="btn btn-primary btn-md w-full sm:w-auto disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Simpan Perubahan
              </button>
            </div>
          </form>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-faint">
                <FolderGit2 size={14} /> Repository Saya
              </h3>
              <Link href={`/u/${profile?.username}`} className="flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200">
                Lihat profil <ArrowUpRight size={13} />
              </Link>
            </div>
            {myRepos.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Belum ada repository. Yuk buat yang pertama!</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {myRepos.map((r) => (
                  <RepoCard key={r.slug} repo={r} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
