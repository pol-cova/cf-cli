# Contributing

Thanks for helping improve this project.

## Prerequisites

- Node.js 20+
- npm 10+
- Git

## Setup

1. Clone the repository.
2. Install dependencies:
   npm install
3. Start development mode:
   npm run dev

## Style conventions

- Keep modules focused and small.
- Prefer clear names over abbreviations.
- Avoid adding dependencies unless necessary.
- Keep user-facing command output concise.

## Tests

Current baseline validation:

1. Build TypeScript:
   npm run build
2. Start interactive shell:
   npm run dev
3. Smoke workflow manually:
   /help
   /problem 1004A
   /status
   /test
   /quit

As automated tests are added, run:

- npm test

## Pull requests

- Keep PRs focused.
- Include a short summary of behavior changes.
- Add or update docs when command behavior changes.
