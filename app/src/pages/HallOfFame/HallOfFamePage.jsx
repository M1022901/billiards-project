import React, { useState } from "react";
import playerGenerations from "../../data/player-generations.json";
import GenerationTimeline from "./components/GenerationTimeline.jsx";
import RegionRail from "./components/RegionRail.jsx";
import { regionTracks } from "./data/regionTracks.js";
import { filterPlayersForRegion } from "./lib/playerCardUtils.js";

export default function HallOfFamePage() {
  const [activeRegionId, setActiveRegionId] = useState(regionTracks[0].id);
  const activeRegion = regionTracks.find((region) => region.id === activeRegionId) || regionTracks[0];
  const cultureCards = playerGenerations.find((generation) => generation.id === "regional-cultures")?.players || [];
  const activeCultureCard = cultureCards.find((card) => card.name === activeRegion.label);
  const timelineGenerations = playerGenerations
    .filter((generation) => activeRegion.generationIds.includes(generation.id))
    .map((generation) => ({
      ...generation,
      players: filterPlayersForRegion(generation.players, activeRegion.id),
    }))
    .filter((generation) => generation.players.length);

  return (
    <section className="players-page">
      <div className="players-intro">
        <span>Television era onward</span>
        <h2>Cue Sport Player Generations</h2>
        <p>
          Cards are grouped by cultural role: British snooker, American 9-ball, Chinese heyball,
          television stars, globalisers and China's new championship wave.
        </p>
      </div>

      <div className="players-layout">
        <RegionRail
          regions={regionTracks}
          activeRegion={activeRegion}
          cultureCard={activeCultureCard}
          onSelect={setActiveRegionId}
        />
        <GenerationTimeline region={activeRegion} generations={timelineGenerations} />
      </div>
    </section>
  );
}
