import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import type { SampleCase } from "../codeforces/problemService.js";
import type { SupportedLanguage } from "../session/state.js";

export interface TestRunRequest {
  problemId: string;
  language: SupportedLanguage;
  filePath: string | null;
}

export interface TestRunResult {
  summary: string;
}

export interface TestService {
  storeSamples: (problemId: string, samples: SampleCase[]) => Promise<void>;
  run: (request: TestRunRequest) => Promise<TestRunResult>;
}

interface StoredSamples {
  samples: SampleCase[];
}

interface RunOutcome {
  stdout: string;
  stderr: string;
  timedOut: boolean;
  exitCode: number | null;
}

const DATA_DIR = path.resolve(process.cwd(), ".cf-cli");
const TIMEOUT_MS = 5000;
const TMP_PREFIX = "/tmp/cf_";

function samplePath(problemId: string): string {
  return path.join(DATA_DIR, `${problemId}.samples.json`);
}

function compileCpp(problemId: string, filePath: string): { error: string } | null {
  const result = spawnSync("g++", ["-O2", "-o", `${TMP_PREFIX}${problemId}`, filePath], {
    timeout: TIMEOUT_MS, encoding: "utf-8",
  });
  if (result.signal === "SIGTERM" || result.status === null) return { error: "compile timeout" };
  if (result.status !== 0) return { error: `compile error:\n${(result.stderr ?? "").trim()}` };
  return null;
}

function runOnce(argv: string[], input: string): RunOutcome {
  const result = spawnSync(argv[0], argv.slice(1), {
    input, timeout: TIMEOUT_MS, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    timedOut: result.signal === "SIGTERM" || result.status === null,
    exitCode: result.status,
  };
}

function buildArgv(language: SupportedLanguage, filePath: string, problemId: string): string[] {
  return language === "py" ? ["python3", filePath] : [`${TMP_PREFIX}${problemId}`];
}

function buildSummary(
  results: Array<{ pass: boolean; expected: string; got: string; error?: string }>,
): string {
  let passed = 0;
  const lines = results.flatMap((r, i) => {
    if (r.pass) { passed++; return [`sample ${i + 1}: PASS`]; }
    if (r.error) return [`sample ${i + 1}: FAIL`, `  error: ${r.error}`];
    return [`sample ${i + 1}: FAIL`, `  expected: ${r.expected.trim()}`, `  got: ${r.got.trim()}`];
  });
  lines.push(`${passed}/${results.length} passed`);
  return lines.join("\n");
}

export function createTestService(): TestService {
  return {
    storeSamples: async (problemId: string, samples: SampleCase[]): Promise<void> => {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(samplePath(problemId), JSON.stringify({ samples }, null, 2), "utf-8");
    },

    run: async (request: TestRunRequest): Promise<TestRunResult> => {
      if (!request.filePath) {
        return { summary: "no solution file in session. run /problem <id> first" };
      }

      let stored: StoredSamples;
      try {
        const raw = await readFile(samplePath(request.problemId), "utf-8");
        stored = JSON.parse(raw) as StoredSamples;
      } catch {
        return { summary: "no stored samples. run /problem <id> first" };
      }

      if (request.language === "cpp") {
        const err = compileCpp(request.problemId, request.filePath);
        if (err) return { summary: err.error };
      }

      const argv = buildArgv(request.language, request.filePath, request.problemId);
      const results = stored.samples.map((sample) => {
        const outcome = runOnce(argv, sample.input);
        if (outcome.timedOut) return { pass: false, expected: sample.output, got: "", error: "timeout (5s)" };
        if (outcome.exitCode !== 0) {
          const msg = outcome.stderr.trim() || `exit code ${outcome.exitCode}`;
          return { pass: false, expected: sample.output, got: "", error: `runtime error: ${msg}` };
        }
        const pass = outcome.stdout.trim() === sample.output.trim();
        return { pass, expected: sample.output, got: outcome.stdout };
      });

      return { summary: buildSummary(results) };
    },
  };
}
