"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getCountFromServer,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { Repo, RepoFile, Profile } from "@/lib/types";
import { readmeOf } from "@/lib/format";

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "paste"
  );
}

/* ===================== AUTH / PROFILE ===================== */

export async function usernameAvailable(username: string): Promise<boolean> {
  const q = query(collection(db, "users"), where("username", "==", username), limit(1));
  const snap = await getDocs(q);
  return snap.empty;
}

export async function createProfile(
  uid: string,
  data: { username: string; name: string; email: string }
): Promise<{ ok: boolean; error?: string }> {
  const username = data.username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { ok: false, error: "Username 3-20 karakter, huruf kecil, angka, underscore." };
  }
  const ok = await usernameAvailable(username);
  if (!ok) return { ok: false, error: "Username sudah dipakai." };

  await setDoc(doc(db, "users", uid), {
    uid,
    username,
    name: data.name.trim() || username,
    email: data.email || "",
    photoURL: "",
    bio: "",
    verified: false,
    starred: [],
    following: [],
    followers: 0,
    createdAt: Date.now(),
  });
  return { ok: true };
}

export async function updateProfile(uid: string, patch: Partial<Profile>) {
  await updateDoc(doc(db, "users", uid), patch);
}

export async function getUserByUsername(username: string): Promise<Profile | null> {
  const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Profile;
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const ref0 = ref(storage, `avatars/${uid}/avatar.${ext}`);
  await uploadBytes(ref0, file, { contentType: file.type });
  return getDownloadURL(ref0);
}

export async function getUserStats(uid: string): Promise<{ repos: number }> {
  const q = query(collection(db, "repos"), where("uid", "==", uid));
  const snap = await getCountFromServer(q);
  return { repos: snap.data().count };
}

/* ===================== FOLLOW ===================== */

export async function toggleFollow(me: Profile, targetUid: string): Promise<boolean> {
  const isFollowing = (me.following || []).includes(targetUid);
  const myRef = doc(db, "users", me.uid);
  const targetRef = doc(db, "users", targetUid);
  const batch = writeBatch(db);
  if (isFollowing) {
    batch.update(myRef, { following: arrayRemove(targetUid) });
    batch.update(targetRef, { followers: increment(-1) });
  } else {
    batch.update(myRef, { following: arrayUnion(targetUid) });
    batch.update(targetRef, { followers: increment(1) });
  }
  await batch.commit();
  return !isFollowing;
}

export async function getFollowers(uid: string): Promise<Profile[]> {
  const q = query(collection(db, "users"), where("following", "array-contains", uid), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Profile);
}

export async function getFollowing(uid: string): Promise<Profile[]> {
  const me = await getDoc(doc(db, "users", uid));
  if (!me.exists()) return [];
  const following = (me.data() as Profile).following || [];
  const out: Profile[] = [];
  for (const id of following.slice(0, 50)) {
    const d = await getDoc(doc(db, "users", id));
    if (d.exists()) out.push(d.data() as Profile);
  }
  return out;
}

export async function getFeedRepos(uids: string[]): Promise<Repo[]> {
  if (!uids.length) return [];
  const q = query(collection(db, "repos"), where("uid", "in", uids.slice(0, 10)), orderBy("createdAt", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as Repo), slug: d.id }));
}

/* ===================== REPOS ===================== */

export async function uniqueSlug(base: string): Promise<string> {
  let s = slugify(base);
  while ((await getDoc(doc(db, "repos", s))).exists()) {
    s = `${slugify(base)}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return s;
}

export async function repoSlugAvailable(slug: string): Promise<boolean> {
  return !(await getDoc(doc(db, "repos", slugify(slug)))).exists();
}

export async function createRepo(
  owner: Profile,
  data: {
    title: string;
    description: string;
    tags: string[];
    slug: string;
    files: { name: string; isReadme: boolean; size: number; type: string; file: File }[];
    onProgress?: (pct: number) => void;
  }
): Promise<string> {
  const slug = data.slug || (await uniqueSlug(data.title));

  for (let i = 0; i < data.files.length; i++) {
    const f = data.files[i];
    const r = ref(storage, `repos/${slug}/${f.name}`);
    await uploadBytes(r, f.file, { contentType: f.type });
    data.onProgress?.(Math.round(((i + 1) / data.files.length) * 60));
  }

  const repoRef = doc(db, "repos", slug);
  const batch = writeBatch(db);
  batch.set(repoRef, {
    uid: owner.uid,
    slug,
    ownerUsername: owner.username,
    ownerName: owner.name,
    ownerPhotoURL: owner.photoURL || "",
    ownerVerified: !!owner.verified,
    title: data.title.trim(),
    description: data.description.trim(),
    tags: data.tags,
    filesCount: data.files.length,
    views: 0,
    stars: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  data.files.forEach((f, i) => {
    const fileRef = doc(collection(repoRef, "files"));
    batch.set(fileRef, {
      name: f.name,
      path: `repos/${slug}/${f.name}`,
      size: f.size,
      type: f.type,
      isReadme: f.isReadme || readmeOf(f.name),
      order: i,
    });
  });

  try {
    await updateDoc(doc(db, "users", owner.uid), { lastRepoAt: serverTimestamp() });
  } catch (e: any) {
    if (e?.code === "permission-denied") {
      throw new Error("Tunggu 30 detik dulu sebelum post lagi — anti-spam!");
    }
  }

  await batch.commit();
  data.onProgress?.(100);
  return slug;
}

export async function getRepo(slug: string): Promise<Repo | null> {
  const d = await getDoc(doc(db, "repos", slug));
  return d.exists() ? (d.data() as Repo) : null;
}

export async function getRepoFiles(slug: string): Promise<RepoFile[]> {
  const snap = await getDocs(query(collection(db, "repos", slug, "files"), orderBy("order", "asc")));
  return snap.docs.map((d) => ({ ...(d.data() as RepoFile), id: d.id }));
}

export function registerView(slug: string) {
  try {
    if (sessionStorage.getItem(`viewed:${slug}`)) return;
    sessionStorage.setItem(`viewed:${slug}`, "1");
    updateDoc(doc(db, "repos", slug), { views: increment(1) });
  } catch {
    /* noop */
  }
}

export async function toggleStarRepo(me: Profile, repo: Repo): Promise<boolean> {
  const starred = (me.starred || []).includes(repo.slug);
  const batch = writeBatch(db);
  batch.update(doc(db, "users", me.uid), {
    starred: starred ? arrayRemove(repo.slug) : arrayUnion(repo.slug),
  });
  batch.update(doc(db, "repos", repo.slug), { stars: increment(starred ? -1 : 1) });
  await batch.commit();
  return !starred;
}

export async function getStarredRepos(uid: string): Promise<Repo[]> {
  const me = await getDoc(doc(db, "users", uid));
  if (!me.exists()) return [];
  const starred = (me.data() as Profile).starred || [];
  const out: Repo[] = [];
  for (const s of starred.slice(0, 30)) {
    const d = await getDoc(doc(db, "repos", s));
    if (d.exists()) out.push(d.data() as Repo);
  }
  return out;
}

export async function searchRepos(q: string): Promise<Repo[]> {
  const snap = await getDocs(
    query(collection(db, "repos"), orderBy("createdAt", "desc"), limit(300))
  );
  const term = q.toLowerCase();
  return snap.docs
    .map((d) => ({ ...(d.data() as Repo), slug: d.id }))
    .filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.ownerUsername.toLowerCase().includes(term) ||
        (r.tags || []).some((t) => t.toLowerCase().includes(term))
    )
    .slice(0, 30);
}

export async function getPopular(how: "views" | "stars" = "views", n = 12): Promise<Repo[]> {
  const snap = await getDocs(
    query(collection(db, "repos"), orderBy(how, "desc"), limit(n))
  );
  return snap.docs.map((d) => ({ ...(d.data() as Repo), slug: d.id }));
}

export async function getLatest(n = 12): Promise<Repo[]> {
  const snap = await getDocs(
    query(collection(db, "repos"), orderBy("createdAt", "desc"), limit(n))
  );
  return snap.docs.map((d) => ({ ...(d.data() as Repo), slug: d.id }));
}

export async function getUserRepos(uid: string, how: "createdAt" | "stars" = "createdAt", n = 50): Promise<Repo[]> {
  const snap = await getDocs(
    query(collection(db, "repos"), where("uid", "==", uid), orderBy(how, "desc"), limit(n))
  );
  return snap.docs.map((d) => ({ ...(d.data() as Repo), slug: d.id }));
}

export async function deleteRepo(slug: string, files: RepoFile[]) {
  const batch = writeBatch(db);
  for (const f of files) {
    batch.delete(doc(collection(doc(db, "repos", slug), "files"), f.id));
    try {
      await deleteObject(ref(storage, f.path));
    } catch {
      /* already gone */
    }
  }
  batch.delete(doc(db, "repos", slug));
  await batch.commit();
}

export async function readFileContent(path: string): Promise<string> {
  const url = await getDownloadURL(ref(storage, path));
  const res = await fetch(url);
  return res.text();
}

/* ===================== SETTINGS ===================== */

export async function getSettings(): Promise<AppSettings | null> {
  const d = await getDoc(doc(db, "settings", "app"));
  if (!d.exists()) return null;
  return d.data() as AppSettings;
}

export async function onSettings(cb: (s: AppSettings | null) => void): Promise<() => void> {
  return onSnapshot(doc(db, "settings", "app"), (d) => {
    if (d.exists()) cb(d.data() as AppSettings);
    else cb(null);
  });
}
