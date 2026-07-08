// Supplier plain-text descriptions bundle three things into one blob: narrative
// prose, a "landmark - distance" proximity list, and a nearest-airports list.
// Rendered raw, the lists collapse into a wall of text. Parse them apart so the
// UI can present each as its own structured section. Descriptions that don't
// match the pattern degrade to plain paragraphs (nearby/airports come back empty).

export type Distance = { name: string; km: number; mi: number };

export type ParsedDescription = {
  paragraphs: string[];
  nearby: Distance[];
  airports: Distance[];
};

// e.g. "Bugis Street Shopping District - 0.3 km / 0.2 mi"
//      "Seletar Airport (XSP) - 16.3 km / 10.2 mi"
const DISTANCE_RE = /^(.+?)\s*[-–]\s*([\d.]+)\s*km\s*\/\s*([\d.]+)\s*mi\b/i;
const AIRPORT_HEADER_RE = /nearest airports?\s+(?:are|is)/i;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

// Descriptions are a mix: plain prose with newlines, often with an embedded HTML
// fragment (the distance list sits inside a <p> with <br /> separators). Convert
// block-level tags to line breaks, drop the rest, and decode common entities so
// the line-based parser sees one consistent shape. Stripping tags also means we
// never inject raw supplier HTML into the page.
function htmlToText(input: string): string {
  return input
    .replace(/<\s*(br|\/p|\/div|\/li)\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#?\w+;/g, (e) => ENTITIES[e.toLowerCase()] ?? " ")
    .replace(/[ \t]+/g, " ");
}

export function parseDescription(raw: string): ParsedDescription {
  const text = htmlToText(raw);
  const nearby: Distance[] = [];
  const airports: Distance[] = [];
  const proseLines: string[] = [];
  let inAirports = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      proseLines.push(""); // preserve blank lines as paragraph breaks
      continue;
    }
    if (AIRPORT_HEADER_RE.test(line)) {
      inAirports = true; // the list that follows conveys this; drop the header
      continue;
    }
    // Boilerplate that only made sense when distances were inline text.
    if (/^distances are displayed to the nearest/i.test(line)) continue;
    const m = line.match(DISTANCE_RE);
    if (m) {
      const entry = { name: m[1].trim(), km: Number(m[2]), mi: Number(m[3]) };
      const isAirport = inAirports || /airport/i.test(entry.name);
      (isAirport ? airports : nearby).push(entry);
      continue;
    }
    proseLines.push(line);
  }

  const paragraphs = proseLines
    .join("\n")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

  return { paragraphs, nearby, airports };
}
