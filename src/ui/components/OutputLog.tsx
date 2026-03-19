import React from "react";
import { Box, Text } from "ink";

export interface LogEntry {
  id: number;
  command: string;
  output: string;
  isError: boolean;
}

function EntryBlock({ entry }: { entry: LogEntry }) {
  const outputLines = entry.output.split("\n").filter((l) => l !== "");

  return (
    <Box flexDirection="column" marginBottom={1}>
      {entry.command && (
        <Box>
          <Text color="cyan" bold>
            ❯{" "}
          </Text>
          <Text>{entry.command}</Text>
        </Box>
      )}
      {outputLines.map((line, i) => (
        <Box key={i} paddingLeft={entry.command ? 2 : 0}>
          {entry.isError ? (
            <Text color="red">{line}</Text>
          ) : (
            <Text color="white">{line}</Text>
          )}
        </Box>
      ))}
    </Box>
  );
}

export function OutputLog({ entries }: { entries: LogEntry[] }) {
  return (
    <Box flexDirection="column">
      {entries.map((entry) => (
        <EntryBlock key={entry.id} entry={entry} />
      ))}
    </Box>
  );
}
