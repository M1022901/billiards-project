import React from "react";

export default function StageTimeline({ stages, activeStage, activeStageIndex, onSelect }) {
  return (
    <nav className="stage-timeline" aria-label="Billiards development stages">
      {stages.map((stage, index) => (
        <button
          key={stage.id}
          type="button"
          className={`stage-button ${stage.id === activeStage.id ? "active" : ""} ${
            index < activeStageIndex ? "past" : ""
          }`}
          onClick={() => onSelect(stage.id)}
          style={{ "--stage-color": stage.color }}
        >
          <span className="stage-number">{index + 1}</span>
          <b>{stage.period}</b>
          <em>{stage.title}</em>
        </button>
      ))}
    </nav>
  );
}
