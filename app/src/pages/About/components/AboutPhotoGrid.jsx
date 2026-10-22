import React from "react";

export default function AboutPhotoGrid({ photos }) {
  return (
    <div className="about-photo-grid">
      {photos.map((photo) => (
        <figure key={photo.src}>
          <img src={photo.src} alt={photo.alt} />
          <figcaption>{photo.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
