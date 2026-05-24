import { useState, useEffect } from "react";

const WINNING_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function calculateWinner(squares) {
  for (let [a, b, c] of WINNING_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
      return { winner: squares[a], line: [a, b, c] };
  }
  return null;
}

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

const globalStyle = document.createElement("style");
globalStyle.textContent = `
  @keyframes popIn {
    0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
    70%  { transform: scale(1.15) rotate(2deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes winPulse {
    0%,100% { transform: scale(1); }
    40%     { transform: scale(1.2); }
  }
  @keyframes slideUp {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .pop-in   { animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .win-cell { animation: winPulse 0.5s ease 0.1s forwards; }
  .slide-up { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .shimmer-text {
    background: linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b, #ef4444);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 2s linear infinite;
  }
  .syne { font-family: 'Syne', sans-serif; }
  .jbmono { font-family: 'JetBrains Mono', monospace; }
`;
document.head.appendChild(globalStyle);

function Cell({ value, onClick, isWinning, gameOver, currentPlayer }) {
  const isEmpty = !value;
  const isX = value === "X";
  const isO = value === "O";

  return (
    <button
      onClick={onClick}
      disabled={!isEmpty || gameOver}
      className={[
        "relative flex items-center justify-center w-full aspect-square rounded-2xl transition-all duration-150 outline-none group",
        isEmpty && !gameOver
          ? "cursor-pointer hover:bg-white/5 active:scale-95"
          : "cursor-default",
        isWinning
          ? isX
            ? "bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
            : "bg-sky-500/10 shadow-[0_0_30px_rgba(14,165,233,0.3)]"
          : "bg-white/[0.03]",
        "border border-white/[0.06]",
      ].join(" ")}
    >
      {value && (
        <span
          className={[
            "syne text-5xl font-extrabold select-none pop-in",
            isWinning ? "win-cell" : "",
            isX
              ? "text-rose-400 drop-shadow-[0_0_16px_rgba(244,63,94,0.7)]"
              : "text-sky-400 drop-shadow-[0_0_16px_rgba(14,165,233,0.7)]",
          ].join(" ")}
        >
          {value}
        </span>
      )}
      {isEmpty && !gameOver && (
        <span
          className={[
            "syne text-5xl font-extrabold select-none absolute opacity-0 group-hover:opacity-15 transition-opacity",
            currentPlayer === "X" ? "text-rose-400" : "text-sky-400",
          ].join(" ")}
        >
          {currentPlayer}
        </span>
      )}
    </button>
  );
}

function ScoreCard({ label, score, color, active }) {
  return (
    <div
      className={[
        "flex-1 rounded-2xl p-4 text-center border transition-all duration-300",
        active
          ? color === "x"
            ? "bg-rose-500/10 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
            : "bg-sky-500/10 border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.15)]"
          : "bg-white/[0.03] border-white/[0.06]",
      ].join(" ")}
    >
      <div
        className={[
          "jbmono text-xs tracking-widest uppercase mb-1 font-medium",
          color === "x" ? "text-rose-400" : color === "o" ? "text-sky-400" : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </div>
      <div
        className={[
          "syne text-4xl font-extrabold",
          color === "x"
            ? "text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]"
            : color === "o"
            ? "text-sky-400 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]"
            : "text-slate-500",
        ].join(" ")}
      >
        {score}
      </div>
    </div>
  );
}

export default function TicTacToe() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });
  const [recorded, setRecorded] = useState(false);

  const result = calculateWinner(squares);
  const winner = result?.winner;
  const winLine = result?.line ?? [];
  const isDraw = !winner && squares.every(Boolean);
  const gameOver = !!winner || isDraw;
  const currentPlayer = xIsNext ? "X" : "O";

  useEffect(() => {
    if (gameOver && !recorded) {
      setRecorded(true);
      setScores(s => ({
        ...s,
        ...(winner ? { [winner]: s[winner] + 1 } : { D: s.D + 1 }),
      }));
    }
  }, [gameOver, winner, recorded]);

  function handleClick(i) {
    if (gameOver || squares[i]) return;
    const next = squares.slice();
    next[i] = currentPlayer;
    setSquares(next);
    setXIsNext(!xIsNext);
  }

  function reset() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setRecorded(false);
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6"
      style={{ backgroundImage: "radial-gradient(ellipse 55% 45% at 15% 25%, rgba(244,63,94,0.07) 0%, transparent 70%), radial-gradient(ellipse 55% 45% at 85% 75%, rgba(14,165,233,0.07) 0%, transparent 70%)" }}>
      <div className="flex flex-col items-center w-full max-w-sm">

        {/* Title */}
        <div className="mb-1 text-center">
          <h1 className="syne text-6xl font-extrabold tracking-tight text-white">
            TIC<span className="text-rose-400">·</span>TAC<span className="text-sky-400">·</span>TOE
          </h1>
          <p className="jbmono text-xs tracking-[0.3em] text-slate-600 uppercase mt-1">Two Player Classic</p>
        </div>

        {/* Scores */}
        <div className="flex gap-3 w-full mt-8 mb-6">
          <ScoreCard label="Player X" score={scores.X} color="x" active={!gameOver && xIsNext} />
          <ScoreCard label="Draws" score={scores.D} color="draw" active={false} />
          <ScoreCard label="Player O" score={scores.O} color="o" active={!gameOver && !xIsNext} />
        </div>

        {/* Turn indicator */}
        <div className="jbmono text-xs tracking-[0.2em] uppercase text-slate-500 h-5 mb-5">
          {!gameOver && (
            <span>
              Turn:{" "}
              <span className={xIsNext ? "text-rose-400 font-medium" : "text-sky-400 font-medium"}>
                Player {currentPlayer}
              </span>
            </span>
          )}
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          {squares.map((val, i) => (
            <Cell
              key={i}
              value={val}
              onClick={() => handleClick(i)}
              isWinning={winLine.includes(i)}
              gameOver={gameOver}
              currentPlayer={currentPlayer}
            />
          ))}
        </div>

        {/* Result */}
        <div className="h-14 flex items-center justify-center mb-5">
          {winner && (
            <div
              className={[
                "slide-up syne text-2xl font-extrabold px-8 py-3 rounded-full border tracking-wider",
                winner === "X"
                  ? "text-rose-400 bg-rose-500/10 border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.2)]"
                  : "text-sky-400 bg-sky-500/10 border-sky-500/40 shadow-[0_0_30px_rgba(14,165,233,0.2)]",
              ].join(" ")}
            >
              Player {winner} Wins! 🎉
            </div>
          )}
          {isDraw && (
            <div className="slide-up syne text-2xl font-extrabold px-8 py-3 rounded-full border border-white/10 text-slate-400 bg-white/[0.04] tracking-wider">
              It's a Draw
            </div>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={reset}
          className="jbmono text-xs tracking-[0.3em] uppercase text-slate-400 border border-white/[0.08] rounded-full px-10 py-3.5 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200 active:scale-95"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
