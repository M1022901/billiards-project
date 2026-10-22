import React, { useState } from "react";
import GameComparisonTable from "./components/GameComparisonTable.jsx";
import RuleGameCard from "./components/RuleGameCard.jsx";
import RuleGuideModal from "./components/RuleGuideModal.jsx";
import { comparisonRows } from "./data/comparisonRows.js";
import { ruleGames } from "./data/ruleGames.js";

export default function Rules101Page() {
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const selectedGame = ruleGames.find((game) => game.id === selectedGameId);
  const activeStep = selectedGame?.steps[activeStepIndex];

  const openGame = (gameId) => {
    setSelectedGameId(gameId);
    setActiveStepIndex(0);
  };

  return (
    <section className="mx-auto max-w-[1480px]">
      <div className="border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(17,24,39,0.08)]">
        <span className="block text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
          From national styles to modern games
        </span>
        <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">Three Cue Sports, One Beginner Map</h2>
        <p className="mt-2 max-w-4xl text-[15px] leading-6 text-slate-600">
          After the geographic timeline and the country-player view, this tab compares the three rule systems that
          emerged most clearly from the United Kingdom, the United States and China.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {ruleGames.map((game) => (
          <RuleGameCard key={game.id} game={game} onOpen={openGame} />
        ))}
      </div>

      <GameComparisonTable games={ruleGames} rows={comparisonRows} />

      {selectedGame && activeStep ? (
        <RuleGuideModal
          game={selectedGame}
          step={activeStep}
          stepIndex={activeStepIndex}
          onClose={() => setSelectedGameId(null)}
          onSelectStep={setActiveStepIndex}
          onPrevious={() => setActiveStepIndex((index) => Math.max(index - 1, 0))}
          onNext={() => setActiveStepIndex((index) => Math.min(index + 1, selectedGame.steps.length - 1))}
        />
      ) : null}
    </section>
  );
}
