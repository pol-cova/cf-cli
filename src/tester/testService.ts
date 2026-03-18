import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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

const DATA_DIR = path.resolve(process.cwd(), ".cf-cli");

function samplePath(problemId: string): string {
  return path.join(DATA_DIR, `${problemId}.samples.json`);
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

      return {
        summary: [
          `test runner scaffold`,
          `problem: ${request.problemId}`,
          `language: ${request.language}`,
          `file: ${request.filePath}`,
          `stored samples: ${stored.samples.length}`,
          "execution engine is pending in next step",
        ].join("\n"),
      };
    },
  };
}
