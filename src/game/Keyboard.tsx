// JSX runtime handles React; no default import needed

type KeyState = "absent" | "present" | "correct" | undefined;

type Props = {
  onKey: (k: string) => void;
  keyStates: Record<string, KeyState>;
  isAnimating: boolean;
};

const QWERTY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export default function Keyboard({ onKey, keyStates, isAnimating }: Props) {
  return (
    <div className="keyboard keyboard--qwerty">
      <div className="row row--qwerty">
        {QWERTY_ROWS[0].split("").map((k) => (
          <button
            key={k}
            onClick={() => onKey(k)}
            className={`key ${keyStates[k] || ""} ${
              isAnimating ? "disabled" : ""
            }`}
            disabled={isAnimating}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="row row--qwerty row--offset">
        {QWERTY_ROWS[1].split("").map((k) => (
          <button
            key={k}
            onClick={() => onKey(k)}
            className={`key ${keyStates[k] || ""} ${
              isAnimating ? "disabled" : ""
            }`}
            disabled={isAnimating}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="row row--qwerty">
        <button onClick={() => onKey("BACKSPACE")} className="key wide">
          ⌫
        </button>
        {QWERTY_ROWS[2].split("").map((k) => (
          <button
            key={k}
            onClick={() => onKey(k)}
            className={`key ${keyStates[k] || ""} ${
              isAnimating ? "disabled" : ""
            }`}
            disabled={isAnimating}
          >
            {k}
          </button>
        ))}
        <button onClick={() => onKey("ENTER")} className="key wide">
          Enter
        </button>
      </div>
    </div>
  );
}
