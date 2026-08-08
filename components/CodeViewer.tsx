"use client";

import { useMemo, useState, useEffect } from "react";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github-dark.css";
import { Copy, Check, FileCode2, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function CodeViewer({ code, lang, name }: { code: string; lang: string; name: string }) {
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(() => {
    try {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      const auto = hljs.highlightAuto(code, [
        "javascript", "typescript", "python", "json", "bash", "css", "xml", "yaml", "go", "rust", "java", "cpp",
      ]);
      return auto.value;
    } catch {
      return escapeHtml(code);
    }
  }, [code, lang]);

  const lines = highlighted.split("\n").length;

  useEffect(() => {
    setCopied(false);
  }, [name]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#0b0b14]">
      <div className="flex items-center justify-between border-b border-line bg-raised/70 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileCode2 size={15} className="shrink-0 text-violet-400" />
          <span className="truncate font-mono text-xs font-semibold text-white">{name}</span>
          <span className="shrink-0 rounded-md bg-line/50 px-1.5 py-0.5 text-[10px] font-medium text-faint">
            {lines} baris
          </span>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-violet-500/50 hover:text-white"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <div className="code-lines overflow-x-auto">
        {highlighted.split("\n").map((line, i) => (
          <div key={i} className="line">
            <span className="line-num" />
            <span dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReadmeView({ markdown }: { markdown: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center gap-2 border-b border-line bg-raised/70 px-4 py-2.5">
        <FileText size={15} className="text-emerald-400" />
        <span className="font-mono text-xs font-semibold text-white">README.md</span>
      </div>
      <div className="md max-h-[70vh] overflow-y-auto p-5 sm:p-7">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
