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
Next.js 15 (App Router) · Tailwind CSS v4 · Firebase (Auth, Firestore, Storage) · Framer Motion · highlight.js

## 🚀 Setup

1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan: **Authentication** (Email/Password), **Firestore Database** (Standard), **Storage**
3. Salin `firestore.rules` → Firestore → Rules → Publish
4. Salin `storage.rules` → Storage → Rules → Publish
5. Salin `.env.example` jadi `.env.local`, isi config Firebase-mu
6. `npm install && npm run dev`

## ☁️ Deploy ke Vercel
Import repo ini di https://vercel.com → Deploy. Build & install otomatis.

> ⚠️ `.env.local` sudah berisi config publik (aman, proteksi di rules). Untuk produksi serius, pindahkan ke Environment Variables Vercel.

## 🛡️ Keamanan
- Firestore Rules: publik hanya baca, tulis wajib login + cooldown 30 detik
- Storage Rules: file repo publik baca, upload wajib login
- Honeypot field di form daftar untuk memblokir bot
- Untuk proteksi maksimal: aktifkan **App Check** (reCAPTCHA) di Firebase Console
