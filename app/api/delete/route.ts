import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { verifyIdToken } from "@/lib/verify-token";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }
    await verifyIdToken(token);

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
