export function timeAgo(ts: number | undefined): string {
  if (!ts) return "baru saja";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "baru saja";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}h lalu`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}bln lalu`;
  return `${Math.floor(mo / 12)}thn lalu`;
}

export function formatCount(n: number | undefined): string {
  if (!n || n === 0) return "0";
  if (n < 1000) return `${n}`;
  if (n < 1000000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}rb`;
  return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")}jt`;
}

export function formatDate(ts: number | undefined): string {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fileExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function langFromName(name: string): string {
  const ext = fileExt(name);
  const map: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    php: "php",
    html: "xml",
    htm: "xml",
    xml: "xml",
    svg: "xml",
    css: "css",
    scss: "scss",
    json: "json",
    md: "markdown",
    markdown: "markdown",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    yml: "yaml",
    yaml: "yaml",
    toml: "ini",
    ini: "ini",
    env: "ini",
    c: "c",
    h: "c",
    cpp: "cpp",
    cxx: "cpp",
    hpp: "cpp",
    cs: "csharp",
    dart: "dart",
    lua: "lua",
    r: "r",
    pl: "perl",
    vb: "vbnet",
    ps1: "powershell",
    bat: "dos",
    txt: "",
  };
  return map[ext] ?? "";
}

export function readmeOf(name: string): boolean {
  return /^readme\.(md|markdown|txt)$/i.test(name);
}
