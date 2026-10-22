import React from "react";

export default function SelectedCountryCard({ country, research }) {
  return (
    <section className="selected-card">
      <span>Selected country</span>
      <h2>{country}</h2>
      <div
        className="selected-color"
        style={{ backgroundColor: research ? research.stage.color : "#edf3f0" }}
      />
      <p>{research?.note || "This country is not highlighted as a major center in the selected stage."}</p>
    </section>
  );
}
