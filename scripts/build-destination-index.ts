import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { trimDestinations } from "../lib/search/destination";

const root = process.cwd();
const raw = JSON.parse(readFileSync(join(root, "destinations.json"), "utf-8"));
const trimmed = trimDestinations(raw);
mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(
  join(root, "public", "destinations-index.json"),
  JSON.stringify(trimmed),
);
console.log(`Wrote ${trimmed.length} destinations to public/destinations-index.json`);
