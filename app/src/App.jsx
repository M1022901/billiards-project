import React, { useState } from "react";
import HeatMapPage from "./pages/HeatMap/HeatMapPage";
import HallOfFamePage from "./pages/HallOfFame/HallOfFamePage";
import Rules101Page from "./pages/Rules101/Rules101Page";
import SimulationPage from "./pages/Simulation/SimulationPage";
import AboutPage from "./pages/About/AboutPage";
import SiteHeader from "./components/Layout/SiteHeader";

const views = [
  { id: "map", label: "Heat Map", Page: HeatMapPage },
  { id: "players", label: "Hall of Fame", Page: HallOfFamePage },
  { id: "rules", label: "Rules 101", Page: Rules101Page },
  { id: "simulation", label: "Simulation", Page: SimulationPage },
  { id: "about", label: "About", Page: AboutPage },
];

export default function App() {
  const [activeView, setActiveView] = useState("map");
  const ActivePage = views.find((view) => view.id === activeView)?.Page || HeatMapPage;

  return (
    <main className="app-root">
      <SiteHeader activeView={activeView} views={views} onViewChange={setActiveView} />
      <ActivePage />
    </main>
  );
}
