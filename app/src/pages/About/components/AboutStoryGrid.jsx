import React from "react";

export default function AboutStoryGrid({ cards }) {
  return (
    <div className="about-story-grid">
      {cards.map((card) => (
        <article key={card.id}>
          <span>{card.id}</span>
          <h3>{card.title}</h3>
          <p>{card.body}</p>
        </article>
      ))}
    </div>
  );
}
