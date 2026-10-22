import React from "react";

export default function SimulationCaseMenu({ cases, activeCaseId, onSelect }) {
  return (
    <div className="simulation-case-menu" aria-label="Simulation cases">
      {cases.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={!item.enabled}
          className={item.id === activeCaseId ? "active" : ""}
          onClick={() => onSelect(item.id)}
        >
          <span>
            {item.phase} · Case {item.caseNumber}
          </span>
          <strong>{item.title}</strong>
          <em>{item.description}</em>
        </button>
      ))}
    </div>
  );
}
