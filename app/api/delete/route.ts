import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function admin() {
  if (getApps().length) return getApps()[0];
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }
    await getAuth(admin()).verifyIdToken(token);

    const { url } = await req.json();
    if (typeof url !== "string" || !url.includes(".public.blob.vercel-storage.com")) {
      return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
    }

    await del(url);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal menghapus" },
      { status: 500 }
    );
  }
}
