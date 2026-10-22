import React from "react";

export default function RegionRail({ regions, activeRegion, cultureCard, onSelect }) {
  return (
    <aside className="region-rail" aria-label="Cue sport regions">
      {regions.map((region) => (
        <button
          key={region.id}
          type="button"
          className={region.id === activeRegion.id ? "active" : ""}
          onClick={() => onSelect(region.id)}
          style={{ "--region-color": region.color }}
        >
          <span>{region.label}</span>
          <strong>{region.title}</strong>
          <em>{region.summary}</em>
        </button>
      ))}

      {cultureCard ? (
        <div className="region-note" style={{ "--region-color": activeRegion.color }}>
          <span>{cultureCard.discipline}</span>
          <p>{cultureCard.note}</p>
        </div>
      ) : null}
    </aside>
  );
}
