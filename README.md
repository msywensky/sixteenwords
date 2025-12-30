# SixteenWords

SixteenWords is a small React + TypeScript + Vite project that implements a multi-puzzle word-guessing game inspired by Sedecordle-style daily puzzles. Definite work in progress. It's not done by any means, I'm just tinkering to

Features

- 16 simultaneous puzzles per day
- 21 guesses per puzzle
- QWERTY on-screen keyboard and physical keyboard support
- Deterministic daily solutions from `public/answers.txt`
- Validation against `public/guesses.txt`

Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

Open http://localhost:5173 (or the port printed by Vite) in your browser.

Build for production

```bash
npm run build
```

Notes

- The project expects `public/guesses.txt` (allowed guesses) and `public/answers.txt` (pool of daily answers) to be present. For privacy or local testing you can omit these files (the app will handle missing lists), but daily solutions and validation will be limited.

Contributing

- Make changes on a feature branch and open a PR against `main`.
- Run linting/tests (if added) before opening a PR.
