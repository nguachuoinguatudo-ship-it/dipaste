# ⚡ Dipaste

Pastebin modern: share kode dengan gaya. Multi-file, README, tags, like, follow, dan profil keren.

## ✨ Fitur
- 🔐 Login/daftar dengan Firebase Auth (Email/Password)
- 📁 Upload banyak file sekaligus + README otomatis (README.md)
- 🏷️ Tag, judul, deskripsi, dan link custom per repository (`/nama-repository`)
- 🎨 Syntax highlighting 30+ bahasa
- ❤️ Like repository & 👥 follow kreator + feed "Mengikuti"
- 👤 Profil: username, nama, foto profil, bio, badge terverifikasi biru
- 🔍 Home dengan pencarian, trending, dan about
- 📱 Responsif: mobile & desktop, animasi smooth
- 🛡️ Anti-spam: honeypot di daftar + cooldown 30 detik antar post
- 🔧 Panel admin terpisah: repo `dipaste-admin`

## 🧱 Stack
Next.js 15 (App Router) · Tailwind CSS v4 · Firebase (Auth, Firestore) · Vercel Blob (file storage gratis) · Framer Motion · highlight.js

## 🚀 Setup

1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan: **Authentication** (Email/Password), **Firestore Database** (Standard)
3. Salin `firestore.rules` → Firestore → Rules → Publish
4. Salin `.env.example` jadi `.env.local`, isi config Firebase-mu
5. Buat Blob Store: https://vercel.com/account/settings/blob-store → salin token ke environment `BLOB_READ_WRITE_TOKEN`
6. `npm install && npm run dev`

## ☁️ Deploy ke Vercel
Import repo ini di https://vercel.com → Deploy. Build & install otomatis.
Pastikan env var `BLOB_READ_WRITE_TOKEN` + config Firebase terpasang di project Vercel.

> ⚠️ `.env.local` sudah berisi config publik (aman, proteksi di rules). Untuk produksi serius, pindahkan ke Environment Variables Vercel.

## 🛡️ Keamanan
- Firestore Rules: publik hanya baca, tulis wajib login + cooldown 30 detik
- File (Vercel Blob): upload & hapus lewat API route yang wajib token Firebase Auth (verified server-side)
- Honeypot field di form daftar untuk memblokir bot
- Untuk proteksi maksimal: aktifkan **App Check** (reCAPTCHA) di Firebase Console
