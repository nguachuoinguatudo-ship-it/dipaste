"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UploadCloud,
  FileCode2,
  X,
  Plus,
  Pencil,
  Check,
  Loader2,
  BookMarked,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { createRepo, repoSlugAvailable } from "@/lib/db";
import { slugify, readmeOf } from "@/lib/format";
import { useToast } from "@/components/Toast";
import Link from "next/link";

interface LocalFile {
  id: string;
  file: File;
  name: string;
  isReadme: boolean;
}

export default function CreatePage() {
  const router = useRouter();
  const { authUser, profile } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [slugTaken, setSlugTaken] = useState<boolean | null>(null);

  if (!authUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Sparkles size={36} className="mx-auto text-violet-400" />
        <h1 className="mt-4 text-2xl font-extrabold">Masuk dulu yuk!</h1>
        <p className="mt-2 text-sm text-muted">Kamu perlu akun untuk membuat paste & repository.</p>
        <Link href="/login" className="btn btn-primary btn-lg mt-6">Masuk / Daftar</Link>
      </div>
    );
  }

  if (profile === null) return null;

  const addFiles = useCallback((list: FileList | File[]) => {
    const arr = Array.from(list);
    setFiles((prev) => {
      const next = [...prev];
      const taken = new Set(next.map((f) => f.name));
      for (const file of arr) {
        let name = file.name;
        let i = 1;
        while (taken.has(name)) {
          const dot = name.lastIndexOf(".");
          name = dot === -1 ? `${file.name.slice(0, dot)}-${i}` : `${file.name.slice(0, dot)}-${i}${file.name.slice(dot)}`;
          i++;
        }
        taken.add(name);
        next.push({ id: `${Date.now()}-${Math.random()}`, file, name, isReadme: readmeOf(file.name) });
      }
      return next;
    });
  }, []);

  const removeFile = (id: string) => setFiles((p) => p.filter((f) => f.id !== id));

  const renameFile = (id: string, name: string) => {
    setFiles((p) => {
      const conflict = p.some((f) => f.id !== id && f.name === name);
      return p.map((f) => (f.id === id ? { ...f, name: conflict ? f.name : name } : f));
    });
  };

  const toggleReadme = (id: string) => {
    setFiles((p) => p.map((f) => (f.id === id ? { ...f, isReadme: !f.isReadme } : f)));
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");
      if (t && !tags.includes(t) && tags.length < 8) {
        setTags((p) => [...p, t]);
        setTagInput("");
      }
    }
  };

  const checkSlug = async (e: React.FocusEvent<HTMLInputElement>) => {
    const s = slugify(e.target.value);
    if (!s) {
      setSlugTaken(null);
      return;
    }
    setSlugTaken(!(await repoSlugAvailable(s)));
  };

  const totalSize = files.reduce((a, f) => a + f.file.size, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !authUser) return;
    if (!title.trim()) return toast("Judul wajib diisi.", "error");
    if (files.length === 0) return toast("Tambahkan minimal 1 file.", "error");
    if (totalSize > 50 * 1024 * 1024) return toast("Total ukuran maksimal 50MB.", "error");
    if (slugTaken) return toast("Slug custom sudah dipakai.", "error");

    setBusy(true);
    setProgress(0);
    try {
      const slug = await createRepo(
        profile,
        {
          title,
          description,
          tags,
          slug: customSlug || "",
          files: files.map((f) => ({
            name: f.name,
            isReadme: f.isReadme,
            size: f.file.size,
            type: f.file.type || "text/plain",
            file: f.file,
          })),
          onProgress: setProgress,
        }
      );
      toast("Repository berhasil dibuat! 🎉");
      router.push(`/${slug}`);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message?.includes("anti-spam")
        ? "Anti-spam: tunggu 30 detik sebelum post lagi."
        : err?.code?.includes("permission-denied")
          ? "Ditolak: posting terlalu cepat atau akun belum lengkap."
          : err?.code?.includes("quota")
            ? "Storage penuh. Hubungi admin."
            : err?.code?.includes("unavailable")
              ? "Koneksi bermasalah. Coba lagi."
              : "Gagal membuat repository. Coba lagi.";
      toast(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border border-line bg-raised px-4 py-3 text-sm text-white placeholder:text-faint outline-none transition-all focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30">
          <FileCode2 size={20} className="text-white" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold">Buat Repository</h1>
          <p className="text-sm text-muted">Upload file, tambahkan README, dan bagikan link-nya.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-6">
        {/* DETAIL */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-faint">Informasi</h2>
          <div className="mt-4 flex flex-col gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul repository *"
              maxLength={80}
              className={input + " text-base font-semibold"}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat (opsional)"
              maxLength={300}
              rows={3}
              className={input + " resize-none"}
            />
            <div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Tag, tekan Enter — mis. nextjs, api, bot (maks 8)"
                className={input}
              />
              {tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="tag">
                      #{t}
                      <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))} className="ml-1 text-violet-400/70 hover:text-rose-400">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <input
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                onBlur={checkSlug}
                placeholder={`Link custom (opsional) — kosongkan untuk otomatis`}
                className={input + " font-mono text-sm"}
              />
              <div className="mt-2 flex items-center gap-2 font-mono text-xs text-faint">
                <span>dipaste.vercel.app/</span>
                <span className="text-violet-300">{customSlug ? slugify(customSlug) : slugify(title) || "nama-repository"}</span>
                {slugTaken === true && (
                  <span className="inline-flex items-center gap-1 text-rose-400">
                    <AlertTriangle size={12} /> sudah dipakai
                  </span>
                )}
                {slugTaken === false && (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Check size={12} /> tersedia
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* FILES */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-faint">
              File <span className="normal-case text-muted">({files.length})</span>
            </h2>
            {files.length > 0 && (
              <span className="text-xs text-faint">
                {(totalSize / 1024 / 1024).toFixed(2)} MB / 50 MB
              </span>
            )}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
              dragOver ? "border-violet-400 bg-violet-500/10" : "border-line bg-raised/40 hover:border-violet-500/50 hover:bg-violet-500/5"
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/30">
              <UploadCloud size={22} className="text-violet-300" />
            </span>
            <p className="mt-3 text-sm font-semibold text-white">Klik atau seret file ke sini</p>
            <p className="mt-1 text-xs text-faint">Bisa banyak file sekaligus. Yang bernama README.md otomatis jadi README.</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => { addFiles(e.target.files || []); e.target.value = ""; }}
            />
          </div>

          {files.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {files.map((f) => (
                <li key={f.id} className="group flex items-center gap-2.5 rounded-xl border border-line bg-raised/50 px-3 py-2.5 transition-colors hover:border-violet-500/40">
                  <FileCode2 size={17} className={`shrink-0 ${f.isReadme ? "text-emerald-400" : "text-violet-300"}`} />
                  <input
                    value={f.name}
                    onChange={(e) => renameFile(f.id, e.target.value)}
                    className={`w-full min-w-0 flex-1 bg-transparent font-mono text-sm text-white outline-none ${f.isReadme ? "" : "text-[#d6d6e4]"}`}
                  />
                  <span className="hidden shrink-0 text-[11px] text-faint sm:inline">
                    {(f.file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleReadme(f.id)}
                    title={f.isReadme ? "Jadikan file biasa" : "Jadikan README"}
                    className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all ${
                      f.isReadme
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "border border-line text-faint hover:text-white hover:border-emerald-500/40"
                    }`}
                  >
                    <BookMarked size={12} />
                    <span className="hidden sm:inline">{f.isReadme ? "README" : "Tandai"}</span>
                  </button>
                  <button type="button" onClick={() => removeFile(f.id)} className="shrink-0 rounded-lg p-1.5 text-faint transition-colors hover:bg-rose-500/10 hover:text-rose-400">
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* SUBMIT */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5 sm:p-6">
          {busy ? (
            <div>
              <div className="flex items-center gap-3">
                <Loader2 size={18} className="animate-spin text-violet-400" />
                <p className="text-sm font-semibold text-white">Mengunggah {files.length} file...</p>
              </div>
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-raised">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-right font-mono text-xs text-faint">{progress}%</p>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg w-full">
              <Sparkles size={18} />
              Publish Repository
            </button>
          )}
          <p className="mt-3 text-center text-xs text-faint">
            Dengan publish, repository langsung bisa dilihat publik di linknya.
          </p>
        </motion.section>
      </form>
    </div>
  );
}
