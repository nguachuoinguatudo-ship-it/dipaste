"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UserPlus,
  UserCheck,
  Star,
  Eye,
  FolderGit2,
  Users,
  Calendar,
  Pencil,
  Mail,
  Link2,
  Heart,
  FileCode2,
  SearchX,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getUserByUsername, getUserRepos, toggleFollow, getFollowers, getFollowing, getStarredRepos } from "@/lib/db";
import { formatCount, formatDate } from "@/lib/format";
import type { Profile, Repo } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { RepoCard } from "@/components/RepoCard";
import { useToast } from "@/components/Toast";

export default function ProfileView({ username }: { username: string }) {
  const router = useRouter();
  const { authUser, profile: me } = useAuth();
  const { toast } = useToast();

  const [user, setUser] = useState<Profile | null | "loading">("loading");
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [tab, setTab] = useState<"repos" | "likes" | "followers" | "following">("repos");
  const [followers, setFollowers] = useState<Profile[] | null>(null);
  const [following, setFollowing] = useState<Profile[] | null>(null);
  const [likes, setLikes] = useState<Repo[] | null>(null);
  const [followerCount, setFollowerCount] = useState(0);

  const isMe =
    user !== "loading" && user !== null && (me?.username === user.username || me?.uid === user.uid);
  const isFollowing = me?.following?.includes(user !== "loading" && user !== null ? user.uid : "") || false;

  useEffect(() => {
    let alive = true;
    (async () => {
      const u = await getUserByUsername(username);
      if (!alive) return;
      setUser(u);
      if (!u) return;
      const [rs, fc] = await Promise.all([
        getUserRepos(u.uid, "createdAt", 50),
        Promise.resolve(u.followers || 0),
      ]);
      if (!alive) return;
      setRepos(rs);
      setFollowerCount(fc);
    })();
    return () => {
      alive = false;
    };
  }, [username]);

  useEffect(() => {
    if (user === "loading") return;
    if (!user) return;
    if (tab !== "followers") return;
    const u: Profile = user;
    setFollowers(null);
    getFollowers(u.uid).then(setFollowers);
  }, [tab, user]);

  useEffect(() => {
    if (user === "loading") return;
    if (!user) return;
    if (tab !== "following") return;
    const u: Profile = user;
    setFollowing(null);
    getFollowing(u.uid).then(setFollowing);
  }, [tab, user]);

  useEffect(() => {
    if (user === "loading") return;
    if (!user) return;
    if (tab !== "likes") return;
    const u: Profile = user;
    setLikes(null);
    getStarredRepos(u.uid).then(setLikes);
  }, [tab, user]);

  const onFollow = async () => {
    if (!me) return router.push("/login");
    if (user === "loading") return;
    if (!user) return;
    const u: Profile = user;
    const now = await toggleFollow(me, u.uid);
    setFollowerCount((c) => c + (now ? 1 : -1));
    toast(now ? `Kamu mengikuti @${u.username}` : `Berhenti mengikuti @${u.username}`, now ? "success" : "info");
  };

  if (user === "loading") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="card overflow-hidden">
          <div className="skeleton h-36 w-full rounded-none" />
          <div className="p-6">
            <div className="skeleton h-20 w-20 rounded-full" />
            <div className="skeleton mt-4 h-6 w-1/3" />
            <div className="skeleton mt-2 h-4 w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <SearchX size={40} className="mx-auto text-faint" />
        <h1 className="mt-5 text-2xl font-extrabold text-white">Profil tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted">Tidak ada pengguna dengan username "@{username}".</p>
        <Link href="/" className="btn btn-primary btn-lg mt-6">Kembali ke Beranda</Link>
      </div>
    );
  }

  const tabs = [
    { id: "repos" as const, label: "Repository", icon: FolderGit2, count: repos?.length },
    { id: "likes" as const, label: "Disukai", icon: Heart, count: me?.uid === user.uid ? undefined : undefined },
    { id: "followers" as const, label: "Pengikut", icon: Users, count: followerCount },
    { id: "following" as const, label: "Mengikuti", icon: UserCheck, count: user.following?.length || 0 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-violet-800/40 via-indigo-800/30 to-fuchsia-800/40 sm:h-36" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex items-end justify-between gap-4">
            <Avatar src={user.photoURL} name={user.name} verified={user.verified} size={96} className="ring-4 ring-bg" />
            <div className="flex gap-2 pb-2">
              {isMe ? (
                <Link href="/me" className="btn btn-ghost btn-md">
                  <Pencil size={15} /> Edit Profil
                </Link>
              ) : (
                <button onClick={onFollow} className={`btn btn-md ${isFollowing ? "btn-ghost" : "btn-primary"}`}>
                  {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  {isFollowing ? "Mengikuti" : "Ikuti"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
              {user.verified && (
                <span className="inline-flex items-center rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
                  ✓ Terverifikasi
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted">@{user.username}</p>
            {user.bio && <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#d6d6e4]">{user.bio}</p>}
            {user.email && isMe && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-faint">
                <Mail size={12} /> {user.email}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line/70 pt-4 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5"><FolderGit2 size={14} /> {repos?.length ?? "…"} repository</span>
            <span className="inline-flex items-center gap-1.5"><Users size={14} /> {formatCount(followerCount)} pengikut</span>
            <span className="inline-flex items-center gap-1.5"><UserCheck size={14} /> {formatCount(user.following?.length || 0)} mengikuti</span>
            <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> Bergabung {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </motion.div>

      {/* TABS */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-raised p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              tab === t.id ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25" : "text-muted hover:text-white"
            }`}
          >
            <t.icon size={15} />
            {t.label}
            {typeof t.count === "number" && <span className="text-xs opacity-70">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="mt-6">
        {tab === "repos" &&
          (repos === null ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-5">
                  <div className="skeleton h-9 w-9 rounded-full" />
                  <div className="skeleton mt-4 h-5 w-3/4" />
                  <div className="skeleton mt-2 h-4 w-full" />
                </div>
              ))}
            </div>
          ) : repos.length === 0 ? (
            <div className="card p-12 text-center">
              <FileCode2 size={32} className="mx-auto text-faint" />
              <p className="mt-3 font-semibold text-white">{isMe ? "Kamu belum punya repository" : `${user.name} belum punya repository`}</p>
              {isMe && (
                <Link href="/create" className="btn btn-primary btn-md mt-5">Buat Paste Pertama</Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {repos.map((r, i) => (
                <RepoCard key={r.slug} repo={r} index={i} />
              ))}
            </div>
          ))}

        {tab === "likes" &&
          (likes === null ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-5">
                  <div className="skeleton h-9 w-9 rounded-full" />
                  <div className="skeleton mt-4 h-5 w-3/4" />
                </div>
              ))}
            </div>
          ) : likes.length === 0 ? (
            <div className="card p-12 text-center">
              <Heart size={32} className="mx-auto text-faint" />
              <p className="mt-3 font-semibold text-white">Belum ada yang disukai</p>
              <p className="mt-1 text-sm text-muted">Repository yang di-like akan muncul di sini.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {likes.map((r, i) => (
                <RepoCard key={r.slug} repo={r} index={i} />
              ))}
            </div>
          ))}

        {tab === "followers" &&
          (followers === null ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card flex items-center gap-3 p-4">
                  <div className="skeleton h-11 w-11 rounded-full" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton mt-2 h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : followers.length === 0 ? (
            <div className="card p-12 text-center">
              <Users size={32} className="mx-auto text-faint" />
              <p className="mt-3 font-semibold text-white">Belum ada pengikut</p>
              <p className="mt-1 text-sm text-muted">Bagikan profilmu biar dikenal komunitas!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {followers.map((f) => (
                <Link key={f.uid} href={`/u/${f.username}`} className="card flex items-center gap-3 p-4 transition-all hover:border-violet-500/40">
                  <Avatar src={f.photoURL} name={f.name} verified={f.verified} size={44} />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{f.name}</p>
                    <p className="truncate text-xs text-muted">@{f.username}</p>
                  </div>
                  {f.bio && <p className="ml-auto hidden max-w-[40%] truncate text-xs text-faint md:block">{f.bio}</p>}
                </Link>
              ))}
            </div>
          ))}

        {tab === "following" &&
          (following === null ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card flex items-center gap-3 p-4">
                  <div className="skeleton h-11 w-11 rounded-full" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton mt-2 h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : following.length === 0 ? (
            <div className="card p-12 text-center">
              <UserCheck size={32} className="mx-auto text-faint" />
              <p className="mt-3 font-semibold text-white">Belum mengikuti siapa pun</p>
              <p className="mt-1 text-sm text-muted">Ikuti kreator untuk melihat karyanya di beranda.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {following.map((f) => (
                <Link key={f.uid} href={`/u/${f.username}`} className="card flex items-center gap-3 p-4 transition-all hover:border-violet-500/40">
                  <Avatar src={f.photoURL} name={f.name} verified={f.verified} size={44} />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{f.name}</p>
                    <p className="truncate text-xs text-muted">@{f.username}</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-violet-300">
                    <Eye size={12} /> {formatCount(f.followers || 0)} pengikut
                  </span>
                </Link>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
