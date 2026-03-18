export type SupportedLanguage = "py" | "cpp";

export interface SessionState {
  currentProblemId: string | null;
  currentLanguage: SupportedLanguage;
  currentFile: string | null;
}

export function createSessionState(): SessionState {
  return {
    currentProblemId: null,
    currentLanguage: "py",
    currentFile: null,
  };
}
