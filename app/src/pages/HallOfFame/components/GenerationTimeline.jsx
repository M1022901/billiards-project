import React from "react";
import PlayerCard from "./PlayerCard.jsx";
import { mergePlayerOverride } from "../lib/playerCardUtils.js";

export default function GenerationTimeline({ region, generations }) {
  return (
    <div className="timeline-panel">
      <div className="timeline-title" style={{ "--region-color": region.color }}>
        <span>{region.label}</span>
        <h3>{region.title} Timeline</h3>
        <p>{region.summary}</p>
      </div>

      <div className="generation-timeline">
        {generations.map((generation) => (
          <section className="timeline-item" key={generation.id} style={{ "--generation-color": generation.accent }}>
            <div className="timeline-marker" aria-hidden="true" />
            <div className="generation-heading">
              <span>{generation.period}</span>
              <h3>{generation.title}</h3>
              <p>{generation.context}</p>
            </div>

            <div className="player-grid">
              {generation.players.map((player) => (
                <PlayerCard key={player.name} player={mergePlayerOverride(player)} accent={generation.accent} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
