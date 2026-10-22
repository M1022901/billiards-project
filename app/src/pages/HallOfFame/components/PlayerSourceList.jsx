import React from "react";

const sourceGroups = [
  ["profile", "Sources"],
  ["image", "Image"],
];

export default function PlayerSourceList({ sources }) {
  return (
    <div className="player-source-list">
      <span>Sources</span>
      {sourceGroups.map(([key, label]) =>
        sources[key]?.length ? (
          <section key={key}>
            <b>{label}</b>
            <div>
              {sources[key].map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              ))}
            </div>
          </section>
        ) : null
      )}
    </div>
  );
}
