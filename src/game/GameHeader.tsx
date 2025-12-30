type Props = {
  onBack?: () => void;
  onShowDirections?: () => void;
};

export default function GameHeader({ onBack, onShowDirections }: Props) {
  return (
    <header className="game-header">
      <button className="btn back" onClick={onBack} aria-label="Back">
        ← Back
      </button>
      <div className="game-title">Today's Game</div>
      <button
        className="btn help"
        onClick={onShowDirections}
        aria-label="Directions"
      >
        ?
      </button>
    </header>
  );
}
