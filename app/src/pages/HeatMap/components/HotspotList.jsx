import React from "react";

export default function HotspotList({ label, items, selectedCountry, onSelect, className = "hotspot-list" }) {
  return (
    <section className={className}>
      <span>{label}</span>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={item.name === selectedCountry ? "selected" : ""}
          onClick={() => onSelect(item.name)}
        >
          <i style={{ backgroundColor: item.color, opacity: item.opacity }} />
          <span>
            <b>{item.name}</b>
            <em>{item.heat}</em>
          </span>
        </button>
      ))}
    </section>
  );
}
