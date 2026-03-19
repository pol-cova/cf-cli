import React, { useState } from "react";
import { Box, Text, useApp } from "ink";
import type { SessionState } from "../session/state.js";
import type { CommandRouter } from "../commands/router.js";
import { OutputLog, type LogEntry } from "./components/OutputLog.js";
import { CommandBar } from "./components/CommandBar.js";

export interface AppProps {
  router: CommandRouter;
  state: SessionState;
}

let nextId = 1;

const WELCOME: LogEntry = {
  id: 0,
  command: "",
  output: "cf-cli  ·  type /help for commands",
  isError: false,
};

export function App({ router, state }: AppProps) {
  const { exit } = useApp();
  const [log, setLog] = useState<LogEntry[]>([WELCOME]);
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (line: string) => {
    setHistory((h) => [...h, line]);
    setIsLoading(true);
    try {
      const result = await router.dispatch(line);
      setLog((prev) => [
        ...prev,
        {
          id: nextId++,
          command: line,
          output: result.output,
          isError: false,
        },
      ]);
      if (result.shouldExit) {
        exit();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setLog((prev) => [
        ...prev,
        {
          id: nextId++,
          command: line,
          output: message,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          cf-cli
        </Text>
        <Text dimColor>  codeforces interactive session</Text>
      </Box>
      <OutputLog entries={log} />
      <CommandBar
        state={state}
        onSubmit={handleSubmit}
        history={history}
        isLoading={isLoading}
      />
    </Box>
  );
}
