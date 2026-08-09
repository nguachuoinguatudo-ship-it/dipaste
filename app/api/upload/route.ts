import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function admin() {
  if (getApps().length) return getApps()[0];
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }
    const decoded = await getAuth(admin()).verifyIdToken(token);
    const uid = decoded.uid;

    const form = await req.formData();
    const file = form.get("file");
    const kind = form.get("kind") as string;
    const folder = (form.get("folder") as string) || "";

    if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
      return NextResponse.json({ error: "File diperlukan" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Maksimal 5MB per file" }, { status: 400 });
    }

    let pathname: string;
    if (kind === "avatar") {
      if (folder !== uid) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      pathname = `avatars/${uid}/avatar.${ext}`;
    } else if (kind === "repo") {
      if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(folder)) {
        return NextResponse.json({ error: "Folder invalid" }, { status: 400 });
      }
      pathname = `repos/${folder}/${sanitizeName(file.name)}`;
    } else {
      return NextResponse.json({ error: "Tipe upload tidak dikenal" }, { status: 400 });
    }

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Upload gagal" },
      { status: 500 }
    );
  }
}
