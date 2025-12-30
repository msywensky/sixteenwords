import React from "react";
import "./directions.css";

type DirectionsProps = {
  onBack?: () => void;
};

export default function DirectionsPage({ onBack }: DirectionsProps) {
  return (
    <div className="directions-root">
      <h1 className="directions-title">How to play</h1>

      <section className="step">
        <h2>Guess all sixteen words in 21 tries.</h2>
        <p>
          Each guess must be a valid five letter word. After each guess, the
          color of the tiles will change to show how close your guess was to the
          word.
        </p>
      </section>

      <section className="step">
        <h2>Examples</h2>

        <div className="example">
          <div className="row">
            <span className="tile tile--correct">W</span>
            <span className="tile">I</span>
            <span className="tile">N</span>
            <span className="tile">D</span>
            <span className="tile">Y</span>
          </div>
          <p>
            The letter <strong>W</strong> is in the word and in the correct
            spot.
          </p>
        </div>

        <div className="example">
          <div className="row">
            <span className="tile">T</span>
            <span className="tile tile--present">R</span>
            <span className="tile">A</span>
            <span className="tile">I</span>
            <span className="tile">N</span>
          </div>
          <p>
            The letter <strong>R</strong> is in the word but in a different
            spot.
          </p>
        </div>

        <div className="example">
          <div className="row">
            <span className="tile">C</span>
            <span className="tile">H</span>
            <span className="tile">I</span>
            <span className="tile">L</span>
            <span className="tile">L</span>
          </div>
          <p>
            The letterS <strong>C, H, I, L, L</strong> are not in the word in
            any spot.
          </p>
        </div>
      </section>

      <section>
        <p>
          Each guess attempts to solve all sixteen words simultaneously. After
          each guess, feedback is provided for each word individually, helping
          you deduce the correct words over multiple attempts.
        </p>
      </section>
      <section className="step">
        <h2>Tips</h2>
        <ul>
          <li>Use common starting words to narrow letters quickly.</li>
          <li>Pay attention to letters that change color across guesses.</li>
        </ul>
      </section>

      <p className="nav-link">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onBack && onBack();
          }}
        >
          Back to Home
        </a>
      </p>
    </div>
  );
}
