# cf-cli

A terminal session for Codeforces. Fetch a problem, write your solution, run the samples — without leaving the shell.

## Setup

Requires [Bun](https://bun.sh), `python3`, and `g++`.

```bash
bun install
bun run dev
```

## Commands

| Command | What it does |
|---|---|
| `/problem <id>` | Fetch problem from Codeforces, scaffold solution file, store samples |
| `/lang <py\|cpp>` | Switch language (scaffolds new file if needed, never overwrites existing code) |
| `/test` | Run stored samples against your solution |
| `/status` | Show current problem, language, and file |
| `/help` | List commands |
| `/quit` | Exit |

## Example session

```
❯ /problem 4A
  ready 4A: A. Watermelon
  file: 4A.py
  samples: 2

❯ /lang cpp
  language set to cpp
  file: 4A.cpp

❯ /test
  sample 1: PASS
  sample 2: PASS
  2/2 passed
```

The prompt shows your active context — `[4A · CPP] ❯` — and Tab completes commands.

## Contributing

Bug reports and pull requests are welcome at [pol-cova/cf-cli](https://github.com/pol-cova/cf-cli).

If you're adding a feature, open an issue first so we can agree on the direction before you spend time on it.

```bash
bun install
bun run dev   # run with file watching
bun test      # run tests
```

## How it works

- Problems are fetched live from `codeforces.com` and parsed from HTML
- Samples are stored under `.cf-cli/` and reused on `/test`
- Python runs via `python3`, C++ compiles with `g++ -O2` then runs the binary
- Solution files are created once and never overwritten on language switch

## License

MIT — see [LICENSE](./LICENSE)
