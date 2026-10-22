import React from "react";
import AboutHero from "./components/AboutHero.jsx";
import AboutPhotoGrid from "./components/AboutPhotoGrid.jsx";
import AboutStoryGrid from "./components/AboutStoryGrid.jsx";
import { aboutIntro, aboutPhotos, aboutStoryCards } from "./data/aboutContent.js";

export default function AboutPage() {
  return (
    <section className="about-page">
      <AboutHero
        eyebrow={aboutIntro.eyebrow}
        title={aboutIntro.title}
        paragraph={aboutIntro.paragraph}
        portrait={aboutIntro.portrait}
      />
      <AboutStoryGrid cards={aboutStoryCards} />
      <AboutPhotoGrid photos={aboutPhotos} />
    </section>
  );
}
