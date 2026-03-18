import type { SessionState } from "../session/state.js";

export interface HelperService {
  suggest: (line: string, state: SessionState) => string;
}

export function createHelperService(): HelperService {
  return {
    suggest: (_line: string, state: SessionState): string => {
      if (!state.currentProblemId) {
        return "Use /problem <id> to start. Example: /problem 1004A";
      }

      if (!state.currentFile) {
        return "Use /problem <id> to scaffold a solution file.";
      }

      return "Try /test to run samples, or /lang <py|cpp> to switch language.";
    },
  };
}
