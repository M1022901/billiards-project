import React from "react";

export default function SiteHeader({ activeView, views, onViewChange }) {
  return (
    <header className="site-header">
      <div>
        <h1>Beginner Guide of Billiard</h1>
        <p>Make billiard fun, universal and accessible.</p>
      </div>
      <nav className="view-switch" aria-label="Primary views">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            className={activeView === view.id ? "active" : ""}
            onClick={() => onViewChange(view.id)}
          >
            {view.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
