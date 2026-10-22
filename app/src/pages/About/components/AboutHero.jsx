import React from "react";

export default function AboutHero({ eyebrow, title, paragraph, portrait }) {
  return (
    <div className="about-hero">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{paragraph}</p>
      </div>
      <img src={portrait.src} alt={portrait.alt} />
    </div>
  );
}
