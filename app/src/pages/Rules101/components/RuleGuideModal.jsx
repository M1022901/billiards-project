import React, { useEffect } from "react";

export default function RuleGuideModal({ game, step, stepIndex, onClose, onSelectStep, onPrevious, onNext }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/72 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="rules-modal-panel max-h-[92vh] w-full max-w-6xl overflow-hidden border border-white/20 bg-white shadow-2xl">
        <div className="grid max-h-[92vh] grid-rows-[auto_minmax(0,1fr)_auto]">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
            <div>
              <span className="block text-xs font-black uppercase tracking-[0.1em] text-slate-500">
                {game.country} · {game.shortName}
              </span>
              <h3 id="rules-modal-title" className="mt-1 text-2xl font-black leading-tight text-slate-950">
                {step.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center border border-slate-300 bg-white text-xl font-black text-slate-700 hover:bg-slate-100"
              aria-label="Close guide"
            >
              ×
            </button>
          </header>

          <div className="rules-modal-body overflow-y-auto p-4 sm:p-5">
            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.6fr)_minmax(300px,0.4fr)]">
              <div className="min-w-0 overflow-hidden bg-slate-100">
                <div className="rule-step-visual" style={{ "--game-color": game.accent }}>
                  <img
                    src={step.image}
                    alt={`${game.name}: ${step.title}`}
                    className={`rule-step-image h-[300px] w-full sm:h-[430px] ${
                      step.imageFit === "contain" ? "bg-slate-900 object-contain" : "object-cover"
                    }`}
                  />
                  <div className="rule-step-badge">
                    <i aria-hidden="true">{step.visualIcon}</i>
                    <span>{step.visualLabel}</span>
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex flex-col justify-between gap-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    {game.steps.map((gameStep, index) => (
                      <button
                        key={gameStep.title}
                        type="button"
                        onClick={() => onSelectStep(index)}
                        className={`h-9 min-w-9 border px-3 text-xs font-black ${
                          index === stepIndex
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                        }`}
                        aria-label={`Go to ${gameStep.title}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 break-words text-base font-semibold leading-6 text-slate-900 xl:text-lg xl:leading-7">
                    {step.body}
                  </p>
                  <ul className="mt-4 grid gap-2">
                    {step.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="min-w-0 break-words border-l-4 border-slate-900 bg-slate-50 py-2 pl-3 pr-2 text-sm leading-5 text-slate-600"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="break-words text-xs leading-5 text-slate-500">{game.imageCredit}</p>
              </div>
            </div>
          </div>

          <footer className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <span className="text-sm font-bold text-slate-500">
              Step {stepIndex + 1} of {game.steps.length}
            </span>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={onPrevious}
                disabled={stepIndex === 0}
                className="border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={stepIndex === game.steps.length - 1}
                className="border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
