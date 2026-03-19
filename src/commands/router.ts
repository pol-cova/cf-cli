import path from "node:path";
import { access, writeFile } from "node:fs/promises";
import type { SessionState, SupportedLanguage } from "../session/state.js";
import type { ProblemService } from "../codeforces/problemService.js";
import type { TestService } from "../tester/testService.js";
import type { HelperService } from "../chat/helperService.js";

export interface CommandRouter {
  dispatch: (line: string) => Promise<CommandResult>;
}

interface RouterDeps {
  state: SessionState;
  problemService: ProblemService;
  testService: TestService;
  helperService: HelperService;
}

export interface CommandResult {
  output: string;
  shouldExit: boolean;
}

const HELP_TEXT = [
  "Commands:",
  "  /help                     Show command help",
  "  /status                   Show active session state",
  "  /problem <id>             Fetch problem metadata and scaffold files",
  "  /lang <py|cpp>            Set active language",
  "  /test                     Run stored samples for active problem",
  "  /quit                     Exit session",
].join("\n");

function createTemplate(problemId: string, language: SupportedLanguage): string {
  if (language === "py") {
    return [
      "import sys",
      "",
      "def solve() -> None:",
      "    data = sys.stdin.read().strip().split()",
      "    # TODO: implement",
      "    pass",
      "",
      "if __name__ == \"__main__\":",
      "    solve()",
      "",
    ].join("\n");
  }

  return [
    "#include <bits/stdc++.h>",
    "using namespace std;",
    "",
    "int main() {",
    "    ios::sync_with_stdio(false);",
    "    cin.tie(nullptr);",
    "",
    "    // TODO: implement",
    "    return 0;",
    "}",
    "",
  ].join("\n");
}

async function scaffoldSolution(problemId: string, language: SupportedLanguage): Promise<string> {
  const filename = `${problemId}.${language}`;
  const fullPath = path.resolve(process.cwd(), filename);
  try {
    await access(fullPath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    await writeFile(fullPath, createTemplate(problemId, language), "utf-8");
  }
  return filename;
}

export function createCommandRouter(deps: RouterDeps): CommandRouter {
  return {
    dispatch: async (line: string): Promise<CommandResult> => {
      if (!line) {
        return { output: "", shouldExit: false };
      }

      if (!line.startsWith("/")) {
        const suggestion = deps.helperService.suggest(line, deps.state);
        return { output: suggestion, shouldExit: false };
      }

      const [command, ...args] = line.split(/\s+/);

      if (command === "/help") {
        return { output: HELP_TEXT, shouldExit: false };
      }

      if (command === "/status") {
        const details = [
          `problem: ${deps.state.currentProblemId ?? "none"}`,
          `language: ${deps.state.currentLanguage}`,
          `file: ${deps.state.currentFile ?? "none"}`,
        ].join("\n");
        return { output: details, shouldExit: false };
      }

      if (command === "/lang") {
        const value = args[0];
        if (value !== "py" && value !== "cpp") {
          return { output: "usage: /lang <py|cpp>", shouldExit: false };
        }
        deps.state.currentLanguage = value;
        if (deps.state.currentProblemId) {
          deps.state.currentFile = await scaffoldSolution(deps.state.currentProblemId, value);
          return { output: `language set to ${value}\nfile: ${deps.state.currentFile}`, shouldExit: false };
        }
        return { output: `language set to ${value}`, shouldExit: false };
      }

      if (command === "/problem") {
        const problemId = args[0];
        if (!problemId || !/^\d+[A-Za-z]\d?$/.test(problemId)) {
          return { output: "usage: /problem <id> (example: 1004A)", shouldExit: false };
        }

        const problem = await deps.problemService.fetch(problemId);
        deps.state.currentProblemId = problemId;
        deps.state.currentFile = await scaffoldSolution(problemId, deps.state.currentLanguage);
        await deps.testService.storeSamples(problemId, problem.samples);

        return {
          output: `ready ${problem.id}: ${problem.title}\nfile: ${deps.state.currentFile}\nsamples: ${problem.samples.length}`,
          shouldExit: false,
        };
      }

      if (command === "/test") {
        if (!deps.state.currentProblemId) {
          return { output: "no active problem, run /problem <id> first", shouldExit: false };
        }
        const result = await deps.testService.run({
          problemId: deps.state.currentProblemId,
          language: deps.state.currentLanguage,
          filePath: deps.state.currentFile,
        });
        return { output: result.summary, shouldExit: false };
      }

      if (command === "/quit") {
        return { output: "session ended", shouldExit: true };
      }

      return { output: `unknown command: ${command}. try /help`, shouldExit: false };
    },
  };
}
