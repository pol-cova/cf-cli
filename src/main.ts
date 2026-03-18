import { createShell } from "./ui/shell.js";
import { createSessionState } from "./session/state.js";
import { createCommandRouter } from "./commands/router.js";
import { createProblemService } from "./codeforces/problemService.js";
import { createTestService } from "./tester/testService.js";
import { createHelperService } from "./chat/helperService.js";

async function main(): Promise<void> {
  const state = createSessionState();
  const problemService = createProblemService();
  const testService = createTestService();
  const helperService = createHelperService();

  const router = createCommandRouter({
    state,
    problemService,
    testService,
    helperService,
  });

  const shell = createShell({
    prompt: "cf> ",
    welcome: "cf interactive session. Type /help to see commands.",
    onLine: (line) => router.dispatch(line),
  });

  await shell.run();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[fatal] ${message}`);
  process.exitCode = 1;
});
