"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  Eye,
  Files,
  Calendar,
  Clock,
  Copy,
  Check,
  Trash2,
  UserPlus,
  UserCheck,
  FileCode2,
  BookMarked,
  Loader2,
  AlertTriangle,
  SearchX,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getRepo,
  getRepoFiles,
  registerView,
  toggleStarRepo,
  toggleFollow,
  deleteRepo,
  readFileContent,
  getUserByUsername,
} from "@/lib/db";
import { langFromName, timeAgo, formatCount, formatDate } from "@/lib/format";
import type { Repo, RepoFile, Profile } from "@/lib/types";
import { CodeViewer, ReadmeView } from "@/components/CodeViewer";
import { Avatar } from "@/components/Avatar";
import { useToast } from "@/components/Toast";

export default function RepoView({ slug }: { slug: string }) {
  const router = useRouter();
  const { authUser, profile: me } = useAuth();
  const { toast } = useToast();

  const [repo, setRepo] = useState<Repo | null | "loading">("loading");
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [starred, setStarred] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = me?.uid === (repo as Repo | null)?.uid;
  const isFollowing = me?.following?.includes(owner?.uid || "") || false;

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await getRepo(slug);
      if (!alive) return;
      setRepo(r);
      if (!r) return;
      registerView(slug);
      const fs = await getRepoFiles(slug);
      if (!alive) return;
      setFiles(fs);
      const own = await getUserByUsername(r.ownerUsername);
      if (alive) setOwner(own);
      setStarred(me?.starred?.includes(slug) || false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const readme = useMemo(
    () => files.find((f) => f.isReadme) || null,
    [files]
  );

  useEffect(() => {
    if (!files.length) return;
    if (!readme && !active) {
      setActive(files[0].id);
      return;
    }
    if (readme && !active) {
      setActive("readme");
      setCode("");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length]);

  const activeFile = files.find((f) => f.id === active);

  useEffect(() => {
    const target = active === "readme" ? readme : activeFile;
    if (!target) return;
    let alive = true;
    setCodeLoading(true);
    setCode("");
    readFileContent(target.path)
      .then((c) => alive && setCode(c))
      .catch(() => alive && setCode("// Gagal memuat file. Mungkin sudah dihapus."))
      .finally(() => alive && setCodeLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile?.id, active === "readme" ? readme?.id : null]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const onStar = async () => {
    if (!me || !authUser) return router.push("/login");
    const now = await toggleStarRepo(me, repo as Repo);
    setStarred(now);
    toast(now ? "Berhasil di-like! ❤️" : "Like dihapus.", now ? "success" : "info");
  };

  const onFollow = async () => {
    if (!me || !owner) return router.push("/login");
    const now = await toggleFollow(me, owner.uid);
    toast(now ? `Kamu mengikuti @${owner.username}` : `Berhenti mengikuti @${owner.username}`, now ? "success" : "info");
    setOwner({ ...owner, followers: (owner.followers || 0) + (now ? 1 : -1) });
  };

  const onDelete = async () => {
    if (!repo || repo === "loading" || !isOwner) return;
    setDeleting(true);
    try {
      await deleteRepo(slug, files);
      toast("Repository dihapus.");
      router.push("/");
    } catch {
      toast("Gagal menghapus. Coba lagi.", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (repo === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="skeleton h-8 w-2/3" />
        <div className="skeleton mt-4 h-4 w-1/3" />
        <div className="skeleton mt-8 h-96 w-full" />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <SearchX size={40} className="mx-auto text-faint" />
        <h1 className="mt-5 text-2xl font-extrabold text-white">Repository tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted">
          "{slug}" tidak ada atau sudah dihapus oleh pemiliknya.
        </p>
        <Link href="/" className="btn btn-primary btn-lg mt-6">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-violet-800/40 via-indigo-800/30 to-fuchsia-800/40 sm:h-24" />
        <div className="px-5 pb-5 sm:px-7">
          <div className="-mt-10 flex items-end justify-between gap-4">
            <Avatar src={repo.ownerPhotoURL || owner?.photoURL} name={repo.ownerName} verified={repo.ownerVerified || owner?.verified} size={76} className="ring-4 ring-bg" />
            <div className="flex gap-2 pb-1">
              <button onClick={copyLink} className="btn btn-ghost btn-sm sm:btn-md">
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span className="hidden sm:inline">{copied ? "Tersalin!" : "Salin Link"}</span>
              </button>
              <button onClick={onStar} className={`btn btn-sm sm:btn-md ${starred ? "bg-amber-500/15 border border-amber-500/40 text-amber-300" : "btn-ghost"}`}>
                <Star size={16} className={starred ? "fill-amber-400 text-amber-400" : ""} />
                <span className="hidden sm:inline">{starred ? "Di-like" : "Like"}</span>
                <span className="font-bold">{formatCount(repo.stars)}</span>
              </button>
              {!isOwner && owner && (
                <button onClick={onFollow} className={`btn btn-sm sm:btn-md ${isFollowing ? "btn-ghost" : "btn-primary"}`}>
                  {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  {isFollowing ? "Mengikuti" : "Ikuti"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <Link href={`/u/${repo.ownerUsername}`} className="group flex w-fit items-center gap-2 text-sm">
              <span className="text-muted group-hover:text-violet-300 transition-colors">@{repo.ownerUsername}</span>
              {repo.ownerVerified && (
                <span className="inline-flex items-center rounded-full bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                  ✓ Terverifikasi
                </span>
              )}
            </Link>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{repo.title}</h1>
            {repo.description && <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">{repo.description}</p>}
            {repo.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {repo.tags.map((t) => (
                  <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="tag transition-colors hover:bg-violet-500/20">
                    #{t}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line/70 pt-4 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5"><Eye size={14} /> {formatCount(repo.views)} dilihat</span>
            <span className="inline-flex items-center gap-1.5"><Star size={14} className="text-amber-400" /> {formatCount(repo.stars)} like</span>
            <span className="inline-flex items-center gap-1.5"><Files size={14} /> {repo.filesCount} file</span>
            <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> {formatDate(repo.createdAt)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {timeAgo(repo.updatedAt || repo.createdAt)}</span>
            <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-faint">/{repo.slug}</span>
          </div>
        </div>
      </motion.div>

      {/* CONTENT */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* FILE LIST */}
        <aside className="card h-fit overflow-hidden lg:sticky lg:top-20">
          <div className="border-b border-line bg-raised/60 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-faint">File</p>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto p-2">
            {files.map((f) => (
              <li key={f.id}>
                <button
                  onClick={() => setActive(f.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all ${
                    active === f.id ? "bg-gradient-to-r from-violet-600/25 to-indigo-600/15 border border-violet-500/30 text-white" : "text-muted hover:bg-raised hover:text-white"
                  }`}
                >
                  {f.isReadme ? <BookMarked size={16} className="shrink-0 text-emerald-400" /> : <FileCode2 size={16} className="shrink-0 text-violet-300/80" />}
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{f.name}</span>
                  <span className="shrink-0 text-[10px] text-faint">{(f.size / 1024).toFixed(1)}K</span>
                </button>
              </li>
            ))}
            {files.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-faint">Tidak ada file</li>
            )}
          </ul>
        </aside>

        {/* VIEWER */}
        <div className="min-w-0">
          {codeLoading ? (
            <div className="skeleton h-96 w-full" />
          ) : active === "readme" && readme ? (
            <ReadmeView markdown={code} />
          ) : activeFile ? (
            <CodeViewer code={code} lang={langFromName(activeFile.name)} name={activeFile.name} />
          ) : (
            <div className="card p-12 text-center text-sm text-muted">
              <BookMarked size={30} className="mx-auto text-emerald-400" />
              <p className="mt-3">Pilih file untuk melihat isinya.</p>
            </div>
          )}
        </div>
      </div>

      {/* OWNER ACTIONS */}
      {isOwner && (
        <div className="card mt-6 flex flex-col items-center justify-between gap-3 border-rose-500/20 p-5 sm:flex-row">
          <div className="flex items-center gap-2.5 text-sm text-muted">
            <AlertTriangle size={16} className="text-amber-400" />
            Kamu pemilik repository ini.
          </div>
          <div className="flex gap-2">
            {!confirmDel ? (
              <button onClick={() => setConfirmDel(true)} className="btn btn-danger btn-md">
                <Trash2 size={15} /> Hapus Repository
              </button>
            ) : (
              <>
                <button onClick={() => setConfirmDel(false)} className="btn btn-ghost btn-md">Batal</button>
                <button onClick={onDelete} disabled={deleting} className="btn btn-danger btn-md disabled:opacity-60">
                  {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />} Yakin, hapus!
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
