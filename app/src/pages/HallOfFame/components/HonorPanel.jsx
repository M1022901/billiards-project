import React from "react";
import { statIconLabels } from "../lib/playerCardUtils.js";

export default function HonorPanel({ panel }) {
  return (
    <section className="honor-panel">
      <span>
        <i aria-hidden="true">{statIconLabels[panel.icon] || "•"}</i>
        {panel.label}
        {panel.tooltip ? (
          <button type="button" className="honor-info" aria-label={panel.tooltip} title={panel.tooltip}>
            i
          </button>
        ) : null}
      </span>
      <strong>{panel.value}</strong>
      {panel.detail ? <em>{panel.detail}</em> : null}
    </section>
  );
}
