import React from "react";

export default function RuleGameCard({ game, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(game.id)}
      className="group relative min-h-[280px] overflow-hidden border border-slate-200 bg-slate-900 text-left shadow-[0_18px_40px_rgba(17,24,39,0.12)] outline-none transition duration-200 hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-teal-200"
    >
      <img
        src={game.heroImage}
        alt={`${game.name} table setup`}
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
      <div className="relative flex h-full min-h-[280px] flex-col justify-end p-5 text-white">
        <span className="text-xs font-black uppercase tracking-[0.12em] text-white/75">{game.country}</span>
        <h3 className="mt-2 text-3xl font-black leading-none">{game.name}</h3>
        <p className="mt-3 text-sm leading-5 text-white/82">{game.beginnerSummary}</p>
        <span className="mt-5 inline-flex w-fit items-center border border-white/45 bg-white/12 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-white">
          Open beginner guide
        </span>
      </div>
    </button>
  );
}
