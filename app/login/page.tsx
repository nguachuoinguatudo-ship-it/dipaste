"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateAuthProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createProfile } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { Terminal, Mail, Lock, Loader2, User } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { authUser } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [hpValue, setHpValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<"auth" | "profile">("auth");
  const [tempUser, setTempUser] = useState<any>(null);

  if (authUser && step === "auth") {
    router.replace("/");
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hpValue) {
      toast("Terjadi kesalahan. Coba lagi.", "error");
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateAuthProfile(cred.user, { displayName: name || username || email.split("@")[0] });
        setTempUser(cred.user);
        setStep("profile");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast("Berhasil masuk!", "success");
        router.replace("/");
      }
    } catch (err: any) {
      const code = err?.code || "";
      toast(
        code.includes("email-already-in-use")
          ? "Email sudah terdaftar, silakan masuk."
          : code.includes("wrong-password") || code.includes("invalid-credential")
            ? "Email atau password salah."
            : code.includes("user-not-found")
              ? "Akun tidak ditemukan."
              : code.includes("weak-password")
                ? "Password minimal 6 karakter."
                : code.includes("invalid-email")
                  ? "Format email salah."
                  : "Terjadi kesalahan. Coba lagi.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;
    setBusy(true);
    const res = await createProfile(tempUser.uid, {
      username,
      name: name || username,
      email: tempUser.email || "",
    });
    if (!res.ok) {
      toast(res.error || "Gagal menyimpan profil", "error");
      setBusy(false);
      return;
    }
    toast("Akun berhasil dibuat! Selamat datang di Dipaste.", "success");
    router.replace("/");
  };

  const input =
    "w-full rounded-xl border border-line bg-raised py-3 pl-11 pr-4 text-sm text-white placeholder:text-faint outline-none transition-all focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-14">
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px] animate-blob" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[120px] animate-blob2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/30">
            <Terminal size={26} className="text-white" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold">
            {step === "profile" ? "Siapkan profilmu" : mode === "login" ? "Selamat datang kembali" : "Buat akun baru"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {step === "profile"
              ? "Pilih username unikmu untuk mulai berbagi kode."
              : mode === "login"
                ? "Masuk untuk melihat paste dan repository favoritmu."
                : "Gratis selamanya. Tanpa kartu kredit."}
          </p>
        </div>

        <div className="card p-6 sm:p-8 shadow-2xl shadow-black/40">
          {step === "auth" ? (
            <>
              <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-raised p-1">
                {(["login", "register"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                      mode === m ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25" : "text-muted hover:text-white"
                    }`}
                  >
                    {m === "login" ? "Masuk" : "Daftar"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={hpValue}
                  onChange={(e) => setHpValue(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={input}
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Password (min. 6 karakter)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={input}
                  />
                </div>
                {mode === "register" && (
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
                    <input
                      placeholder="Nama (opsional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={input}
                    />
                  </div>
                )}
                <button disabled={busy} className="btn btn-primary btn-lg w-full disabled:opacity-60">
                  {busy ? <Loader2 size={18} className="animate-spin" /> : mode === "login" ? "Masuk" : "Daftar"}
                  {!busy && "→"}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={saveProfile} className="flex flex-col gap-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">@</span>
                <input
                  required
                  placeholder="username (3-20 karakter, lowercase)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className={input}
                />
              </div>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  placeholder="Nama tampilan (opsional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={input}
                />
              </div>
              <button disabled={busy} className="btn btn-primary btn-lg w-full disabled:opacity-60">
                {busy ? <Loader2 size={18} className="animate-spin" /> : "Simpan & Mulai"}
              </button>
              <p className="text-center text-xs text-faint">
                Link profilmu nanti: <span className="font-mono text-violet-300">dipaste.vercel.app/u/{username || "username"}</span>
              </p>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-faint">
          Dengan masuk, kamu menyetujui syarat & ketentuan Dipaste.{" "}
          <Link href="/about" className="text-violet-300 hover:underline">Baca selengkapnya</Link>
        </p>
      </motion.div>
    </div>
  );
}
