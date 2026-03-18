import readline from "node:readline";

interface ShellConfig {
  prompt: string;
  welcome: string;
  onLine: (line: string) => Promise<ShellResponse>;
}

interface ShellResponse {
  output: string;
  shouldExit: boolean;
}

export interface Shell {
  run: () => Promise<void>;
}

export function createShell(config: ShellConfig): Shell {
  return {
    run: async () => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
      });

      process.stdout.write(`${config.welcome}\n`);
      rl.setPrompt(config.prompt);
      rl.prompt();

      rl.on("line", async (line: string) => {
        try {
          const response = await config.onLine(line.trim());
          if (response.output) {
            process.stdout.write(`${response.output}\n`);
          }
          if (response.shouldExit) {
            rl.close();
            return;
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          process.stdout.write(`[error] ${message}\n`);
        }
        rl.prompt();
      });

      await new Promise<void>((resolve) => {
        rl.on("close", () => {
          process.stdout.write("bye\n");
          resolve();
        });
      });
    },
  };
}
