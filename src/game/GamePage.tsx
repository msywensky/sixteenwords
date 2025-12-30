import { useEffect, useState, useCallback } from "react";
import GameHeader from "./GameHeader";
import Keyboard from "./Keyboard";
import "./game.css";

type GameProps = {
  onBack?: () => void;
  onShowDirections?: () => void;
};

const PUZZLE_COUNT = 16;
const TILES_PER_ROW = 5;
const ROWS_PER_PUZZLE = 21; // number of rows per puzzle (21 guesses)

// Solutions/answers will be generated per-day from `public/answers.txt`.

const ANIM_MS = 450;
const STAGGER_MS = 80;

export default function GamePage({ onBack, onShowDirections }: GameProps) {
  const [solutions, setSolutions] = useState<string[]>([]);
  const puzzles = Array.from({ length: PUZZLE_COUNT });
  const [perPuzzleRows, setPerPuzzleRows] = useState<number[]>(
    Array(PUZZLE_COUNT).fill(0)
  );
  const [perPuzzleResults, setPerPuzzleResults] = useState<
    Array<
      Array<{ guess: string; result: ("correct" | "present" | "absent")[] }>
    >
  >(Array.from({ length: PUZZLE_COUNT }, () => []));

  // placeholder solutions for each puzzle (use real puzzle data later)

  const [activePuzzle] = useState(0);
  const [guessesLeft, setGuessesLeft] = useState(21);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyStates, setKeyStates] = useState<
    Record<string, "absent" | "present" | "correct" | undefined>
  >({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [allowedWords, setAllowedWords] = useState<Set<string> | null>(null);
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);
  const [revealingRows, setRevealingRows] = useState<number[]>(
    Array(PUZZLE_COUNT).fill(-1)
  );
  const onKey = useCallback(
    (key: string) => {
      if (key === "BACKSPACE") {
        setCurrentGuess((g) => g.slice(0, -1));
        return;
      }
      if (key === "ENTER") {
        try {
          if (
            currentGuess.length === TILES_PER_ROW &&
            guessesLeft > 0 &&
            !isAnimating
          ) {
            const guess = currentGuess.toUpperCase();

            // validate against fetched word list if available
            if (allowedWords === null) {
              setInvalidMessage("Word list loading...");
              setTimeout(() => setInvalidMessage(null), 900);
              return;
            }
            if (allowedWords && !allowedWords.has(guess)) {
              setInvalidMessage("Not in word list");
              setTimeout(() => setInvalidMessage(null), 900);
              return;
            }

            // store results for every unsolved puzzle (those with remaining rows)
            setPerPuzzleResults((prev) => {
              const next = prev.map((arr) => (arr ? arr.slice() : []));
              for (let p = 0; p < PUZZLE_COUNT; p++) {
                // skip if out of rows or already solved
                const solved = (next[p] || []).some((row) =>
                  row?.result?.every((x) => x === "correct")
                );
                if (perPuzzleRows[p] >= ROWS_PER_PUZZLE || solved) continue;
                const solution = (solutions[p] || "").toUpperCase();
                const result: ("correct" | "present" | "absent")[] =
                  Array(TILES_PER_ROW).fill("absent");
                const solArr = solution.split("");
                // pass 1: correct
                for (let i = 0; i < TILES_PER_ROW; i++) {
                  if (guess[i] === solArr[i]) {
                    result[i] = "correct";
                    solArr[i] = "";
                  }
                }
                // pass 2: present
                for (let i = 0; i < TILES_PER_ROW; i++) {
                  if (result[i] === "correct") continue;
                  const idx = solArr.indexOf(guess[i]);
                  if (idx !== -1) {
                    result[i] = "present";
                    solArr[idx] = "";
                  }
                }

                if (!next[p]) next[p] = [];
                next[p][perPuzzleRows[p]] = { guess, result };

                // priorities will be aggregated after this state update
              }
              return next;
            });

            // Simpler: compute aggregated priorities here synchronously
            const agg: Record<string, number> = {};
            for (let p = 0; p < PUZZLE_COUNT; p++) {
              const solved = (perPuzzleResults[p] || [])
                .slice(0, perPuzzleRows[p])
                .some((row) => row?.result?.every((x) => x === "correct"));
              if (perPuzzleRows[p] >= ROWS_PER_PUZZLE || solved) continue;
              const solution = (solutions[p] || "").toUpperCase();
              const solArr = solution.split("");
              const resArr: ("correct" | "present" | "absent")[] =
                Array(TILES_PER_ROW).fill("absent");
              for (let i = 0; i < TILES_PER_ROW; i++) {
                if (guess[i] === solArr[i]) {
                  resArr[i] = "correct";
                  solArr[i] = "";
                }
              }
              for (let i = 0; i < TILES_PER_ROW; i++) {
                if (resArr[i] === "correct") continue;
                const idx = solArr.indexOf(guess[i]);
                if (idx !== -1) {
                  resArr[i] = "present";
                  solArr[idx] = "";
                }
              }
              for (let i = 0; i < TILES_PER_ROW; i++) {
                const ch = guess[i];
                const pr =
                  resArr[i] === "correct" ? 3 : resArr[i] === "present" ? 2 : 1;
                agg[ch] = Math.max(agg[ch] || 0, pr);
              }
            }

            setKeyStates((prev) => {
              const next = { ...prev } as Record<
                string,
                "absent" | "present" | "correct" | undefined
              >;
              for (const ch of Object.keys(agg)) {
                const pr = agg[ch];
                const cur = next[ch];
                const curPr =
                  cur === "correct"
                    ? 3
                    : cur === "present"
                    ? 2
                    : cur === "absent"
                    ? 1
                    : 0;
                if (pr > curPr)
                  next[ch] =
                    pr === 3 ? "correct" : pr === 2 ? "present" : "absent";
              }
              return next;
            });

            // mark revealing rows so the current submission animates
            setRevealingRows((prev) => {
              const next = prev.slice();
              for (let p = 0; p < PUZZLE_COUNT; p++) {
                const solved = (perPuzzleResults[p] || [])
                  .slice(0, perPuzzleRows[p])
                  .some((row) => row?.result?.every((x) => x === "correct"));
                if (perPuzzleRows[p] >= ROWS_PER_PUZZLE || solved) continue;
                next[p] = perPuzzleRows[p];
              }
              return next;
            });

            // lock input while tiles flip and decrement guesses
            setIsAnimating(true);
            setGuessesLeft((n) => Math.max(0, n - 1));

            const totalDelay = ANIM_MS + STAGGER_MS * (TILES_PER_ROW - 1);

            setTimeout(() => {
              setPerPuzzleRows((prev) => {
                const next = [...prev];
                for (let p = 0; p < PUZZLE_COUNT; p++) {
                  if (prev[p] < ROWS_PER_PUZZLE) {
                    next[p] = Math.min(ROWS_PER_PUZZLE - 1, prev[p] + 1);
                  }
                }
                return next;
              });
              // clear revealing rows
              setRevealingRows(Array(PUZZLE_COUNT).fill(-1));
              setCurrentGuess("");
              setIsAnimating(false);
            }, totalDelay);
          }
        } catch (err) {
          // log and recover so UI doesn't go blank
          // eslint-disable-next-line no-console
          console.error("Error handling ENTER in GamePage:", err);
          setIsAnimating(false);
        }
        // allow early return from ENTER handling
        return;
      }
      const up = key.toUpperCase();
      if (/^[A-Z]$/.test(up) && currentGuess.length < 5) {
        setCurrentGuess((g) => (g + up).slice(0, 5));
      }
    },
    [
      currentGuess,
      guessesLeft,
      activePuzzle,
      isAnimating,
      perPuzzleRows,
      perPuzzleResults,
      allowedWords,
      solutions,
    ]
  );

  // wire physical keyboard
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      const k = e.key.toUpperCase();
      if (isAnimating) return;
      if (k === "BACKSPACE") {
        e.preventDefault();
        onKey("BACKSPACE");
        return;
      }
      if (k === "ENTER") {
        e.preventDefault();
        onKey("ENTER");
        return;
      }
      if (/^[A-Z]$/.test(k)) {
        onKey(k);
      }
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onKey]);

  // fetch allowed words from public/words.txt once
  useEffect(() => {
    let mounted = true;
    fetch(`${import.meta.env.BASE_URL}guesses.txt`)
      .then((r) => r.text())
      .then((txt) => {
        if (!mounted) return;
        const set = new Set<string>();
        txt
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((w) => set.add(w.toUpperCase()));
        setAllowedWords(set);
      })
      .catch((err) => {
        // don't block the game if fetch fails
        // eslint-disable-next-line no-console
        console.error("Failed to load words.txt", err);
        setAllowedWords(new Set());
      });
    return () => {
      mounted = false;
    };
  }, []);

  // fetch answers list and compute deterministic daily solutions
  useEffect(() => {
    let mounted = true;
    fetch(`${import.meta.env.BASE_URL}answers.txt`)
      .then((r) => r.text())
      .then((txt) => {
        if (!mounted) return;
        const pool = txt
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((w) => w.toUpperCase());
        if (pool.length === 0) {
          setSolutions([]);
          return;
        }

        // compute day-of-year and include year in seed
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const day = Math.floor(diff / 86400000); // day of year
        const year = now.getFullYear();

        // seeded shuffle (deterministic per calendar day including year)
        function mulberry32(a: number) {
          return function () {
            let t = (a += 0x6d2b79f5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
          };
        }

        function seededShuffle<T>(arr: T[], seed: number) {
          const a = arr.slice();
          const rand = mulberry32(seed);
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            const tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
          }
          return a;
        }

        // include year in seed so each calendar date+year produces a unique set
        const seed = year * 1000 + day + 1;
        const shuffled = seededShuffle(pool, seed);
        const chosen = shuffled.slice(0, PUZZLE_COUNT);
        setSolutions(chosen);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to load answers.txt", err);
        setSolutions([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="game-root">
      <GameHeader onBack={onBack} onShowDirections={onShowDirections} />

      <div className="game-tracker">
        <div className="puzzle-track">
          {puzzles.map((_, i) => {
            const solved = (perPuzzleResults[i] || [])
              .slice(0, perPuzzleRows[i])
              .some((row) => row?.result?.every((x) => x === "correct"));
            return (
              <div
                key={i}
                className={`track-dot ${i === activePuzzle ? "active" : ""} ${
                  solved ? "solved" : ""
                }`}
                aria-label={`Puzzle ${i + 1}`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
        <div className="guesses">
          <span className="guesses-count">{guessesLeft}/21</span>
        </div>
      </div>

      <section className="puzzles-grid">
        {puzzles.map((_, i) => (
          <article
            className="puzzle-card"
            key={i}
            aria-label={`Puzzle ${i + 1}`}
          >
            <div className="puzzle-index">{i + 1}</div>
            <div className="puzzle-rows">
              {Array.from({ length: ROWS_PER_PUZZLE }).map((_, r) => {
                const submitted = r < perPuzzleRows[i];
                const rowData = perPuzzleResults[i] && perPuzzleResults[i][r];
                // consider a puzzle solved only if a previously submitted row (index < current row) is all-correct
                const solved = (perPuzzleResults[i] || [])
                  .slice(0, perPuzzleRows[i])
                  .some((row) => row?.result?.every((x) => x === "correct"));
                const revealing = revealingRows[i];
                return (
                  <div
                    className={`puzzle-tiles ${
                      invalidMessage && r === perPuzzleRows[i] ? "invalid" : ""
                    }`}
                    key={r}
                  >
                    {Array.from({ length: TILES_PER_ROW }).map((__, j) => {
                      const ch = submitted
                        ? rowData?.guess?.[j] || ""
                        : solved
                        ? ""
                        : r === perPuzzleRows[i]
                        ? currentGuess[j] || ""
                        : "";
                      const stateClass = submitted
                        ? rowData?.result?.[j] || ""
                        : "";
                      const delay = `${j * STAGGER_MS}ms`;
                      const willAnimate =
                        (submitted && !solved) || revealing === r;
                      return (
                        <div
                          key={j}
                          className={`tile ${
                            willAnimate ? "revealed" : ""
                          } ${stateClass}`}
                          style={
                            willAnimate ? { animationDelay: delay } : undefined
                          }
                        >
                          {ch}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      {invalidMessage && <div className="toast">{invalidMessage}</div>}
      <Keyboard onKey={onKey} keyStates={keyStates} isAnimating={isAnimating} />
    </div>
  );
}
