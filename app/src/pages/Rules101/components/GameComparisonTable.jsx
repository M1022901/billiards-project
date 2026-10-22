import React from "react";

export default function GameComparisonTable({ games, rows }) {
  return (
    <div className="mt-5 border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(17,24,39,0.08)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="block text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
            Beginner comparison
          </span>
          <h3 className="mt-1 text-2xl font-black leading-tight text-slate-950">What changes when the game changes?</h3>
        </div>
        <p className="max-w-md text-sm leading-5 text-slate-500">
          Read each row left to right: the top cards define the three sport columns below.
        </p>
      </div>

      <div className="rules-comparison-scroll mt-4">
        <div className="rules-comparison-visual" role="table" aria-label="Cue sport beginner comparison">
          <div className="comparison-game-header" role="row">
            <span role="columnheader">Compare</span>
            {games.map((game) => (
              <b key={game.id} role="columnheader" style={{ "--game-color": game.accent }}>
                <i aria-hidden="true">{game.shortName === "Snooker" ? "S" : game.shortName === "Heyball" ? "8" : "9"}</i>
                <span>{game.name}</span>
              </b>
            ))}
          </div>
          {rows.map((row) => (
            <div className="comparison-visual-row" role="row" key={row.label}>
              <section className="comparison-row-label" role="rowheader">
                <i aria-hidden="true">{row.icon}</i>
                <span>{row.label}</span>
              </section>
              {games.map((game) => (
                <section
                  className="comparison-value-card"
                  role="cell"
                  key={`${row.label}-${game.id}`}
                  style={{ "--game-color": game.accent }}
                >
                  <strong>{row.values[game.id]}</strong>
                  <em>{row.notes[game.id]}</em>
                </section>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs leading-5 text-slate-500 sm:grid-cols-3">
        {games.map((game) => (
          <p key={game.id}>
            <b className="text-slate-700">{game.shortName} image:</b> {game.imageCredit}
          </p>
        ))}
      </div>
    </div>
  );
}
