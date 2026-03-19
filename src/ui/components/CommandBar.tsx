import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { SessionState } from "../../session/state.js";
import { getGhostText, acceptGhost } from "../autocomplete.js";

interface CommandBarProps {
  state: SessionState;
  onSubmit: (value: string) => void;
  history: string[];
  isLoading: boolean;
}

export function CommandBar({ state, onSubmit, history, isLoading }: CommandBarProps) {
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);

  useInput(
    (input, key) => {
      if (key.return) {
        const trimmed = value.trim();
        if (trimmed) onSubmit(trimmed);
        setValue("");
        setHistoryIndex(-1);
        return;
      }

      if (key.tab) {
        setValue(acceptGhost(value));
        return;
      }

      if (key.upArrow) {
        const next = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(next);
        setValue(history[history.length - 1 - next] ?? "");
        return;
      }

      if (key.downArrow) {
        const next = historyIndex - 1;
        if (next < 0) {
          setHistoryIndex(-1);
          setValue("");
        } else {
          setHistoryIndex(next);
          setValue(history[history.length - 1 - next] ?? "");
        }
        return;
      }

      if (key.backspace || key.delete) {
        setValue((v) => v.slice(0, -1));
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        setValue((v) => v + input);
      }
    },
    { isActive: !isLoading },
  );

  const ghost = getGhostText(value);
  const ghostSuffix = ghost ? ghost.slice(value.length) : "";

  const contextLabel =
    state.currentProblemId
      ? `[${state.currentProblemId} · ${state.currentLanguage.toUpperCase()}] `
      : "";

  return (
    <Box flexDirection="column">
      <Box>
        <Text dimColor>{"─".repeat(40)}</Text>
      </Box>
      <Box>
        {contextLabel ? (
          <Text color="cyan" dimColor>
            {contextLabel}
          </Text>
        ) : null}
        {isLoading ? (
          <Text color="cyan">⠋ </Text>
        ) : (
          <Text color="cyan" bold>
            ❯{" "}
          </Text>
        )}
        <Text>{value}</Text>
        {ghostSuffix && <Text dimColor>{ghostSuffix}</Text>}
      </Box>
    </Box>
  );
}
