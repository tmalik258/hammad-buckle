import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".next", ".git"]);
const SKIP_PATH = `${path.sep}lib${path.sep}generated${path.sep}prisma`;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || fullPath.includes(SKIP_PATH)) continue;
      walk(fullPath);
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) continue;

    const content = fs.readFileSync(fullPath, "utf8");
    if (!content.includes("@prisma/client")) continue;

    const isClient = /^['"]use client['"]/m.test(content);
    const nextPath = isClient
      ? "@/lib/generated/prisma/browser"
      : "@/lib/generated/prisma/client";
    const updated = content.replaceAll("@prisma/client", nextPath);

    if (updated !== content) {
      fs.writeFileSync(fullPath, updated);
      console.log(fullPath);
    }
  }
}

walk(ROOT);
