import React from "react";

export default function StageCard({ stage }) {
  return (
    <section className="stage-card">
      <span>Current stage</span>
      <h2>{stage.title}</h2>
      <p>{stage.summary}</p>
    </section>
  );
}
