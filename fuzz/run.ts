/*
Long-run robustness fuzzer.

Runs every property in fuzz/properties.ts in repeated batches until a time
budget expires, saving any failing seed and shrunk counterexample to
fuzz/corpus/ so it can be replayed and promoted into the committed Vitest
suite as a regression test.

bun run fuzz                  # default 24 hours
bun run fuzz -- --hours 0.05  # 3 minutes
bun run fuzz -- --minutes 30
bun run fuzz -- --batch 5000  # cases per property per batch
*/
import fc from "fast-check";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { properties } from "./properties";

const CORPUS_DIR = join(import.meta.dirname ?? __dirname, "corpus");

function arg(flag: string): number | undefined {
  const i = process.argv.indexOf(flag);
  if (i === -1) return undefined;
  const v = Number(process.argv[i + 1]);
  return Number.isFinite(v) ? v : undefined;
}

const hours = arg("--hours");
const minutes = arg("--minutes");
const batchSize = arg("--batch") ?? 1000;
const budgetMs =
  hours !== undefined ? hours * 3_600_000 : minutes !== undefined ? minutes * 60_000 : 86_400_000;

type Failure = {
  target: string;
  name: string;
  seed: number;
  path: string;
  counterexample: string;
  message: string;
  foundAt: string;
};

type Stat = {
  target: string;
  name: string;
  cases: number;
  batches: number;
  failures: number;
};

const stats = new Map<string, Stat>();
const failures: Failure[] = [];
const seen = new Set<string>();

let stopping = false;
process.on("SIGINT", () => {
  if (stopping) process.exit(1);
  stopping = true;
  console.log("\nStopping after the current batch...");
});

function fmtDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
}

function recordFailure(target: string, name: string, result: fc.RunDetails<unknown>) {
  // fc.stringify preserves Infinity, NaN, undefined and symbols, which JSON.stringify loses.
  const counterexample = fc.stringify(result.counterexample);
  const key = `${target}::${name}::${counterexample}`;
  if (seen.has(key)) return;
  seen.add(key);

  const failure: Failure = {
    target,
    name,
    seed: result.seed,
    path: result.counterexamplePath ?? "",
    counterexample,
    message: String(result.errorInstance ?? "").split("\n")[0],
    foundAt: new Date().toISOString(),
  };
  failures.push(failure);

  const safe = `${target}-${name}`.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase().slice(0, 80);
  writeFileSync(
    join(CORPUS_DIR, `${safe}-${result.seed}.json`),
    JSON.stringify(failure, null, 2),
    "utf8",
  );

  console.log(`\n  FAIL  ${target} :: ${name}`);
  console.log(`        seed=${result.seed} path=${failure.path}`);
  console.log(`        counterexample=${counterexample}`);
  console.log(`        saved to fuzz/corpus/${safe}-${result.seed}.json`);
}

async function main() {
  mkdirSync(CORPUS_DIR, { recursive: true });

  const startedAt = Date.now();
  const deadline = startedAt + budgetMs;

  for (const p of properties) {
    stats.set(`${p.target}::${p.name}`, {
      target: p.target,
      name: p.name,
      cases: 0,
      batches: 0,
      failures: 0,
    });
  }

  console.log(`Robustness fuzzer starting`);
  console.log(`  properties : ${properties.length}`);
  console.log(`  budget     : ${fmtDuration(budgetMs)}`);
  console.log(`  batch size : ${batchSize} cases per property per batch`);
  console.log(`  corpus     : fuzz/corpus/\n`);

  let totalCases = 0;
  let round = 0;
  let lastLog = Date.now();

  while (Date.now() < deadline && !stopping) {
    round += 1;
    for (const p of properties) {
      if (Date.now() >= deadline || stopping) break;
      const key = `${p.target}::${p.name}`;
      const stat = stats.get(key)!;
      const seed = (Math.random() * 2 ** 31) | 0;

      const result = fc.check(p.prop, { numRuns: batchSize, seed });
      stat.batches += 1;
      stat.cases += result.numRuns;
      totalCases += result.numRuns;

      if (result.failed) {
        stat.failures += 1;
        recordFailure(p.target, p.name, result);
      }
    }

    if (Date.now() - lastLog > 30_000) {
      const elapsed = Date.now() - startedAt;
      const rate = Math.round(totalCases / (elapsed / 1000));
      console.log(
        `[${fmtDuration(elapsed)}] rounds=${round} cases=${totalCases.toLocaleString()} ` +
          `rate=${rate.toLocaleString()}/s unique failures=${failures.length}`,
      );
      lastLog = Date.now();
    }
  }

  const elapsed = Date.now() - startedAt;
  const summary = {
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date().toISOString(),
    elapsedMs: elapsed,
    elapsedHuman: fmtDuration(elapsed),
    propertyCount: properties.length,
    rounds: round,
    totalCases,
    casesPerSecond: Math.round(totalCases / (elapsed / 1000)),
    uniqueFailures: failures.length,
    failures,
    perProperty: [...stats.values()].sort((a, b) => b.cases - a.cases),
  };

  writeFileSync(join(CORPUS_DIR, "summary.json"), JSON.stringify(summary, null, 2), "utf8");

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Run complete`);
  console.log(`  duration        : ${summary.elapsedHuman}`);
  console.log(`  properties      : ${summary.propertyCount}`);
  console.log(`  rounds          : ${summary.rounds.toLocaleString()}`);
  console.log(`  cases generated : ${summary.totalCases.toLocaleString()}`);
  console.log(`  throughput      : ${summary.casesPerSecond.toLocaleString()} cases/s`);
  console.log(`  unique failures : ${summary.uniqueFailures}`);
  console.log(`  summary written : fuzz/corpus/summary.json`);
  console.log(`${"=".repeat(60)}`);

  if (failures.length > 0) {
    console.log(`\nFailures:`);
    for (const f of failures) {
      console.log(`  ${f.target} :: ${f.name}`);
      console.log(`    seed=${f.seed} counterexample=${f.counterexample}`);
    }
    process.exit(1);
  }
}

main();
