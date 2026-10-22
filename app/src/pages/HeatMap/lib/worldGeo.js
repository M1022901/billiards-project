import * as echarts from "echarts";
import worldGeoJson from "../../../data/world-geojson.json";

export const MAP_NAME = "billiards-world";

function ringStats(ring) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let maxSegment = 0;

  ring.forEach(([x, y], index) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    if (index > 0) maxSegment = Math.max(maxSegment, Math.abs(x - ring[index - 1][0]));
  });

  return { minX, maxX, minY, maxY, maxSegment };
}

function keepRing(countryName, ring) {
  const stats = ringStats(ring);
  if (stats.maxSegment > 180) return false;
  if (countryName === "France") {
    return stats.minX > -10 && stats.maxX < 12 && stats.minY > 40 && stats.maxY < 53;
  }
  return true;
}

function sanitizeGeometry(countryName, geometry) {
  if (geometry.type === "Polygon") {
    const coordinates = geometry.coordinates.filter((ring) => keepRing(countryName, ring));
    return coordinates.length ? { ...geometry, coordinates } : geometry;
  }

  if (geometry.type === "MultiPolygon") {
    const coordinates = geometry.coordinates
      .map((polygon) => polygon.filter((ring) => keepRing(countryName, ring)))
      .filter((polygon) => polygon.length);
    return coordinates.length ? { ...geometry, coordinates } : geometry;
  }

  return geometry;
}

export function sanitizeGeoJson(geoJson) {
  return {
    ...geoJson,
    features: geoJson.features.map((feature) => ({
      ...feature,
      geometry: sanitizeGeometry(feature.properties?.name, feature.geometry),
    })),
  };
}

export function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export const sanitizedWorldGeoJson = sanitizeGeoJson(worldGeoJson);
echarts.registerMap(MAP_NAME, sanitizedWorldGeoJson);

export const countries = sanitizedWorldGeoJson.features
  .map((feature) => feature.properties?.name)
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b));
