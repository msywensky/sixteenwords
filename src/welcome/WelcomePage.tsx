import { useState } from "react";
import "./WelcomePage.css";
import DirectionsPage from "./directions";
import GamePage from "../game/GamePage";

export default function WelcomePage() {
  const [view, setView] = useState<"home" | "directions" | "game">("home");

  if (view === "directions") {
    return <DirectionsPage onBack={() => setView("home")} />;
  }

  if (view === "game") {
    return (
      <GamePage
        onBack={() => setView("home")}
        onShowDirections={() => setView("directions")}
      />
    );
  }

  return (
    <div className="welcome-header">
      <h1 className="title">Welcome to SixteenWords</h1>
      <nav className="links">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("directions");
          }}
        >
          Directions
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("game");
          }}
        >
          Start Today's Game
        </a>
        <a href="./practice.tsx">Practice</a>
      </nav>
    </div>
  );
}
