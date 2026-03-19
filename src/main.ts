import { createElement } from "react";
import { render } from "ink";
import { createSessionState } from "./session/state.js";
import { createCommandRouter } from "./commands/router.js";
import { createProblemService } from "./codeforces/problemService.js";
import { createTestService } from "./tester/testService.js";
import { createHelperService } from "./chat/helperService.js";
import { App } from "./ui/App.js";

async function main(): Promise<void> {
  const state = createSessionState();
  const router = createCommandRouter({
    state,
    problemService: createProblemService(),
    testService: createTestService(),
    helperService: createHelperService(),
  });

  const { waitUntilExit } = render(createElement(App, { router, state }));
  await waitUntilExit();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[fatal] ${message}`);
  process.exitCode = 1;
});
