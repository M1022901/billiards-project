import React, { useState } from "react";
import CueControlDemo from "./components/CueControlDemo.jsx";
import EquipmentDemo from "./components/EquipmentDemo.jsx";
import GhostBallAimingDemo from "./components/GhostBallAimingDemo.jsx";
import SimulationCaseMenu from "./components/SimulationCaseMenu.jsx";
import TableTourDemo from "./components/TableTourDemo.jsx";
import { simulationCases } from "./data/simulationCases.js";

const caseComponents = {
  "case-01-table-tour": TableTourDemo,
  "case-02-ghost-ball": GhostBallAimingDemo,
  "case-03-cue-control": CueControlDemo,
  "case-04-equipment": EquipmentDemo,
};

export default function SimulationPage() {
  const [activeCaseId, setActiveCaseId] = useState(simulationCases.find((item) => item.enabled)?.id);
  const activeCase = simulationCases.find((item) => item.id === activeCaseId) || simulationCases[0];
  const ActiveDemo = caseComponents[activeCase.id];

  return (
    <section className="simulation-page">
      <div className="simulation-intro">
        <span>Interactive handbook</span>
        <h2>Teaching Simulations</h2>
        <p>
          Phase 1 focuses on learning to play: table literacy, aiming, cue-tip position and equipment first.
          The first four cases are playable now; the remaining cases are planned lessons with distinct simulation goals.
        </p>
      </div>

      <div className="simulation-stage">
        <div className="three-case-panel">{ActiveDemo ? <ActiveDemo /> : null}</div>
      </div>

      <SimulationCaseMenu cases={simulationCases} activeCaseId={activeCase.id} onSelect={setActiveCaseId} />
    </section>
  );
}
