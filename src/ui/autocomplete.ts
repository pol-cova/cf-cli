const COMMANDS = [
  { full: "/help" },
  { full: "/status" },
  { full: "/problem " },
  { full: "/lang py" },
  { full: "/lang cpp" },
  { full: "/test" },
  { full: "/quit" },
];

export function getGhostText(input: string): string {
  if (!input || !input.startsWith("/")) return "";
  const match = COMMANDS.find((c) => c.full.startsWith(input));
  return match ? match.full : "";
}

export function acceptGhost(input: string): string {
  return getGhostText(input) || input;
}
