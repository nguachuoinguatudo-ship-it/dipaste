import { createPublicKey, createVerify } from "crypto";

const CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let cache: { data: Record<string, string>; at: number } | null = null;

async function getCertificates(): Promise<Record<string, string>> {
  if (cache && Date.now() - cache.at < 60 * 60 * 1000) return cache.data;
  const res = await fetch(CERTS_URL);
  const data = (await res.json()) as Record<string, string>;
  cache = { data, at: Date.now() };
  return data;
}

export interface VerifiedToken {
  uid: string;
  email?: string;
  exp: number;
}

export async function verifyIdToken(idToken: string): Promise<VerifiedToken> {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Token tidak valid");

  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());

  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
    throw new Error("Token sudah kedaluwarsa");
  }
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (payload.aud !== projectId) {
    throw new Error("Audience tidak cocok");
  }

  const certs = await getCertificates();
  const cert = certs[header.kid];
  if (!cert) throw new Error("Kunci publik tidak ditemukan");

  const key = createPublicKey(cert);
  const ok = createVerify("RSA-SHA256")
    .update(`${parts[0]}.${parts[1]}`)
    .verify(key, Buffer.from(parts[2], "base64url"));
  if (!ok) throw new Error("Tanda tangan tidak valid");

  return { uid: payload.sub, email: payload.email, exp: payload.exp };
}
