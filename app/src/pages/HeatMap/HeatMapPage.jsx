import React, { useEffect, useMemo, useState } from "react";
import HotspotList from "./components/HotspotList.jsx";
import SelectedCountryCard from "./components/SelectedCountryCard.jsx";
import StageCard from "./components/StageCard.jsx";
import StageTimeline from "./components/StageTimeline.jsx";
import WorldMapChart from "./components/WorldMapChart.jsx";
import { stages } from "./data/heatMapStages.js";

export default function HeatMapPage() {
  const [activeStageId, setActiveStageId] = useState(stages[0].id);
  const [selectedCountry, setSelectedCountry] = useState("France");

  const activeStageIndex = useMemo(
    () => Math.max(0, stages.findIndex((stage) => stage.id === activeStageId)),
    [activeStageId]
  );
  const activeStage = useMemo(() => stages.find((stage) => stage.id === activeStageId) || stages[0], [activeStageId]);
  const cumulativeCountryMap = useMemo(() => {
    const map = {};
    stages.slice(0, activeStageIndex + 1).forEach((stage, stageIndex) => {
      stage.countries.forEach((country) => {
        map[country.name] = {
          ...country,
          stage,
          stageIndex,
          isCurrent: stageIndex === activeStageIndex,
        };
      });
    });
    return map;
  }, [activeStageIndex]);
  const selectedResearch = cumulativeCountryMap[selectedCountry];

  useEffect(() => {
    if (!cumulativeCountryMap[selectedCountry]) {
      setSelectedCountry(activeStage.countries[0]?.name || "France");
    }
  }, [cumulativeCountryMap, activeStage, selectedCountry]);

  const currentStageCountries = activeStage.countries.map((country) => ({
    key: country.name,
    name: country.name,
    heat: country.heat,
    color: activeStage.color,
    opacity: 1,
  }));

  const previousLayerCountries = Object.values(cumulativeCountryMap)
    .filter((country) => !country.isCurrent)
    .map((country) => ({
      key: `${country.stage.id}-${country.name}`,
      name: country.name,
      heat: `${country.stage.period} · ${country.heat}`,
      color: country.stage.color,
      opacity: 0.35,
    }));

  return (
    <div className="app-shell">
      <section className="map-area">
        <div className="map-header">
          <div>
            <h2>Development Map</h2>
            <p>Development stages of billiards, pool and snooker across key countries.</p>
          </div>
          <strong>{activeStage.period}</strong>
        </div>

        <StageTimeline
          stages={stages}
          activeStage={activeStage}
          activeStageIndex={activeStageIndex}
          onSelect={setActiveStageId}
        />

        <div className="map-frame">
          <WorldMapChart
            cumulativeCountryMap={cumulativeCountryMap}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
          />
        </div>
      </section>

      <aside className="control-panel">
        <StageCard stage={activeStage} />

        <SelectedCountryCard country={selectedCountry} research={selectedResearch} />

        <HotspotList
          label="Current stage countries"
          items={currentStageCountries}
          selectedCountry={selectedCountry}
          onSelect={setSelectedCountry}
        />

        <HotspotList
          label="Previous layers still visible"
          items={previousLayerCountries}
          selectedCountry={selectedCountry}
          onSelect={setSelectedCountry}
          className="hotspot-list previous-list"
        />
      </aside>
    </div>
  );
}
