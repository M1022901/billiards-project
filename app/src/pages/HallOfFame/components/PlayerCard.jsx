import React, { useState } from "react";
import HonorPanel from "./HonorPanel.jsx";
import PlayerSourceList from "./PlayerSourceList.jsx";
import {
  buildCareerStats,
  buildPlayerHonorPanels,
  buildResolvedSources,
  playerSourceKey,
} from "../lib/playerCardUtils.js";

export default function PlayerCard({ player, accent }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = player.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const honorPanels = buildPlayerHonorPanels(player);
  const careerStats = buildCareerStats(player);
  const sources = buildResolvedSources(playerSourceKey(player.name));

  return (
    <article className="player-card" tabIndex="0" style={{ "--card-color": accent }}>
      <div className="player-photo">
        {player.image && !imageFailed ? (
          <img
            src={player.image}
            alt={`${player.name} portrait`}
            loading="lazy"
            style={{
              objectFit: player.imageFit || "cover",
              objectPosition: player.imageFocus || "center 28%",
              transform: player.imageZoom ? `scale(${player.imageZoom})` : undefined,
            }}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="photo-fallback" aria-hidden="true">
            {initials}
          </div>
        )}
      </div>

      <div className="player-card-body">
        <div className="player-meta">
          <span>{player.country}</span>
          <b>{player.discipline}</b>
        </div>
        <h4>{player.name}</h4>
        <p>{player.eraRole}</p>
        <div className="honor-grid" aria-label={`${player.name} key honors`}>
          {honorPanels.map((panel) => (
            <HonorPanel key={panel.label} panel={panel} />
          ))}
        </div>

        <p className="player-style">{player.traits.slice(0, 3).join(" · ")}</p>

        <details className="player-card-detail">
          <summary>Details</summary>
          <div>
            <span>Career stats</span>
            <div className="career-fact-grid">
              {careerStats.map((fact) => (
                <section key={fact.label} className="career-fact">
                  <b>{fact.label}</b>
                  <em>{fact.value}</em>
                </section>
              ))}
            </div>
          </div>
          <div>
            <span>Honours</span>
            {player.honors.map((honor) => (
              <p key={honor}>{honor}</p>
            ))}
          </div>
          <div>
            <span>Style</span>
            <p>{player.traits.join(" · ")}</p>
          </div>
          {player.anecdotes?.[0] ? (
            <div>
              <span>Anecdote</span>
              {player.anecdotes.map((anecdote) => (
                <p key={anecdote}>{anecdote}</p>
              ))}
            </div>
          ) : null}
          {sources ? <PlayerSourceList sources={sources} /> : null}
        </details>
      </div>
    </article>
  );
}
