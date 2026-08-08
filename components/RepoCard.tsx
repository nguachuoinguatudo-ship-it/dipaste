"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Star, Files, FolderGit2 } from "lucide-react";
import type { Repo } from "@/lib/types";
import { timeAgo, formatCount } from "@/lib/format";
import { Avatar } from "@/components/Avatar";

export function RepoCard({ repo, index = 0 }: { repo: Repo; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.35 }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={`/${repo.slug}`}
        className="card group flex h-full flex-col p-5 transition-all duration-300 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-900/20"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar src={repo.ownerPhotoURL} name={repo.ownerName} verified={repo.ownerVerified} size={34} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                <span className="text-muted transition-colors group-hover:text-violet-300">@</span>
                {repo.ownerUsername}
              </p>
              <p className="text-xs text-faint">{timeAgo(repo.createdAt)}</p>
            </div>
          </div>
          <FolderGit2 size={18} className="shrink-0 text-faint transition-colors group-hover:text-violet-400" />
        </div>

        <h3 className="mt-4 truncate text-lg font-bold text-white transition-colors group-hover:text-violet-200">
          {repo.title}
        </h3>
        {repo.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{repo.description}</p>
        )}

        {repo.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {repo.tags.slice(0, 4).map((t) => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-line/70 pt-3.5 text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Eye size={14} /> {formatCount(repo.views)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-300/80">
            <Star size={14} /> {formatCount(repo.stars)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Files size={14} /> {repo.filesCount}
          </span>
          <span className="ml-auto font-mono text-xs text-faint">/{repo.slug}</span>
        </div>
      </Link>
    </motion.div>
  );
}
