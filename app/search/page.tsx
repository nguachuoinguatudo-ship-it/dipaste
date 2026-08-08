"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { searchRepos, getPopular } from "@/lib/db";
import type { Repo } from "@/lib/types";
import { RepoCard } from "@/components/RepoCard";
import { Avatar } from "@/components/Avatar";
import Link from "next/link";
import { getUserByUsername, type Profile } from "@/lib/db";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") || "";
  const [term, setTerm] = useState(q);
  const [results, setResults] = useState<Repo[] | null>(null);
  const [userHits, setUserHits] = useState<Profile[]>([]);
  const [popular, setPopular] = useState<Repo[]>([]);

  useEffect(() => {
    setTerm(q);
    if (!q) {
      setResults(null);
      setUserHits([]);
      getPopular("stars", 12).then(setPopular);
      return;
    }
    setResults(null);
    const t = setTimeout(async () => {
      const [repos, users] = await Promise.all([searchRepos(q), getUserByUsername(q)]);
      setResults(repos);
      setUserHits(users ? [users] : []);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Jelajah</h1>
      <p className="mt-1 text-sm text-muted">Cari repository, tag, atau kreator di Dipaste.</p>

      <form onSubmit={submit} className="mt-6">
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-card p-2 transition-all focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20">
          <Search size={18} className="ml-3 shrink-0 text-faint" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Contoh: nextjs, bot whatsapp, api..."
            className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-faint outline-none"
          />
          {term && (
            <button type="button" onClick={() => { setTerm(""); router.push("/search"); }} className="rounded-lg p-2 text-faint hover:text-white">
              <X size={16} />
            </button>
          )}
          <button className="btn btn-primary btn-md shrink-0">Cari</button>
        </div>
      </form>

      {!q ? (
        <>
          <h2 className="mt-12 text-lg font-bold text-white">⭐ Populer minggu ini</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((r, i) => (
              <RepoCard key={r.slug} repo={r} index={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          {userHits.length > 0 && (
            <div className="card mt-8 p-4">
              {userHits.map((u) => (
                <Link key={u.uid} href={`/u/${u.username}`} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-raised">
                  <Avatar src={u.photoURL} name={u.name} verified={u.verified} size={44} />
                  <div>
                    <p className="font-bold text-white">{u.name} {u.verified && <span className="text-xs text-cyan-400">✓</span>}</p>
                    <p className="text-sm text-muted">@{u.username}</p>
                  </div>
                  <span className="ml-auto text-xs text-faint">{u.bio || "Kreator Dipaste"}</span>
                </Link>
              ))}
            </div>
          )}

          <h2 className="mt-8 text-lg font-bold text-white">
            {results === null ? "Mencari..." : `${results.length} hasil untuk "${q}"`}
          </h2>
          {results === null ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-5">
                  <div className="skeleton h-9 w-9 rounded-full" />
                  <div className="skeleton mt-4 h-5 w-3/4" />
                  <div className="skeleton mt-2 h-4 w-full" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="card mt-5 p-12 text-center">
              <Search size={32} className="mx-auto text-faint" />
              <p className="mt-3 font-semibold text-white">Tidak ada hasil untuk "{q}"</p>
              <p className="mt-1 text-sm text-muted">Coba kata kunci lain atau buat paste pertamamu!</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((r, i) => (
                <RepoCard key={r.slug} repo={r} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
