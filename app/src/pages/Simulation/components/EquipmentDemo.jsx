import React, { useState } from "react";
import { equipmentItems } from "../data/equipmentData.js";

export default function EquipmentDemo() {
  const [activeEquipmentId, setActiveEquipmentId] = useState(equipmentItems[0].id);
  const activeEquipment = equipmentItems.find((item) => item.id === activeEquipmentId) || equipmentItems[0];

  return (
    <div className="equipment-demo">
      <div className="equipment-bag" aria-label="Billiards equipment bag">
        <div className="equipment-photo-viewer">
          <figure className="equipment-photo-main">
            <img src={activeEquipment.image} alt={activeEquipment.label} />
            <figcaption>{activeEquipment.label}</figcaption>
          </figure>
          <div className="equipment-photo-strip" aria-label="Choose equipment photo">
            {equipmentItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === activeEquipment.id ? "active" : ""}
                aria-pressed={item.id === activeEquipment.id}
                onClick={() => setActiveEquipmentId(item.id)}
              >
                <img src={item.image} alt="" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="equipment-info">
        <span>{activeEquipment.value}</span>
        <h4>{activeEquipment.label}</h4>
        <p>{activeEquipment.detail}</p>
        <div className="table-tour-facts">
          {activeEquipment.facts.map(([label, value]) => (
            <section key={`${activeEquipment.id}-${label}`}>
              <b>{label}</b>
              <em>{value}</em>
            </section>
          ))}
        </div>
        {activeEquipment.imageSource ? (
          <a className="equipment-source" href={activeEquipment.imageSource.url} target="_blank" rel="noreferrer">
            Photo: {activeEquipment.imageSource.label}
            {activeEquipment.imageSource.author ? ` · ${activeEquipment.imageSource.author}` : ""}
            {activeEquipment.imageSource.license ? ` · ${activeEquipment.imageSource.license}` : ""}
          </a>
        ) : null}
        <div className="equipment-selector">
          {equipmentItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeEquipment.id ? "active" : ""}
              onClick={() => setActiveEquipmentId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
