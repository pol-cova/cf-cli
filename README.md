# cf-cli

Interactive Codeforces helper focused on fast session-based workflows.

## Current status

This repository now includes the first implementation scaffold for an interactive session app:

- command shell loop
- slash command router
- session state
- solution file scaffolding for py/cpp
- sample persistence under `.cf-cli/`
- contributor/community baseline docs

The current problem fetcher and test executor are stubs and will be replaced with real Codeforces HTML parsing and execution in the next implementation steps.

## Quick start

Prerequisites:

- Node.js 20+
- npm 10+

Install and run:

```bash
npm install
npm run dev
```

You will see an interactive prompt:

```text
cf> 
```

## Session commands

- `/help` show available commands
- `/status` show current session state
- `/problem <id>` scaffold active problem and store sample data
- `/lang <py|cpp>` switch active language
- `/test` run sample test workflow (currently scaffold output)
- `/quit` exit session

Example session:

```text
/problem 1004A
/lang py
/status
/test
/quit
```

## Project structure

```text
src/
	chat/         local helper suggestions
	codeforces/   problem fetch + parse service (stub in v0)
	commands/     slash command parsing and dispatch
	session/      session state
	tester/       sample storage and test service scaffold
	ui/           interactive shell adapter
```

## Roadmap (next)

1. Replace problem service stub with Codeforces HTML retrieval and sample parser.
2. Implement real test execution for Python and C++ with output diffing.
3. Evolve shell adapter into full OpenTUI-driven layout (command panel, editor panel, output panel).
