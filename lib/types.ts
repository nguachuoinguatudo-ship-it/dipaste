export interface Profile {
  uid: string;
  username: string;
  name: string;
  email: string;
  photoURL: string;
  bio: string;
  verified: boolean;
  starred: string[];
  following: string[];
  followers: number;
  createdAt: number;
}

export interface Repo {
  uid: string;
  slug: string;
  ownerUsername: string;
  ownerName: string;
  ownerPhotoURL: string;
  ownerVerified: boolean;
  title: string;
  description: string;
  tags: string[];
  filesCount: number;
  views: number;
  stars: number;
  createdAt: number;
  updatedAt: number;
}

export interface RepoFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  isReadme: boolean;
  order: number;
}

export interface AppSettings {
  maintenance: boolean;
  maintenanceMessage: string;
  announcement: string;
}
