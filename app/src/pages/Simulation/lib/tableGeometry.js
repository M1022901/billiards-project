export const SNOOKER_TABLE = {
  lengthMm: 3569,
  widthMm: 1778,
  baulkLineFromBaulkCushionMm: 737,
  dRadiusMm: 292,
  blackFromTopCushionMm: 324,
  ballDiameterMm: 52.5,
  pinkRedGapMm: 4,
  sceneScale: 1 / 520,
};

export const snookerLength = SNOOKER_TABLE.lengthMm * SNOOKER_TABLE.sceneScale;
export const snookerWidth = SNOOKER_TABLE.widthMm * SNOOKER_TABLE.sceneScale;
export const snookerHalfLength = snookerLength / 2;
export const snookerHalfWidth = snookerWidth / 2;
export const snookerBallRadius = (SNOOKER_TABLE.ballDiameterMm / 2) * SNOOKER_TABLE.sceneScale;
export const snookerFeltTopY = 0.06;
export const snookerBallY = snookerFeltTopY + snookerBallRadius;
export const snookerBaulkX = -snookerHalfLength + SNOOKER_TABLE.baulkLineFromBaulkCushionMm * SNOOKER_TABLE.sceneScale;
export const snookerDRadius = SNOOKER_TABLE.dRadiusMm * SNOOKER_TABLE.sceneScale;
export const snookerPinkX = snookerHalfLength / 2;
export const snookerRedApexX =
  snookerPinkX + (SNOOKER_TABLE.ballDiameterMm + SNOOKER_TABLE.pinkRedGapMm) * SNOOKER_TABLE.sceneScale;
export const snookerRedRowGap = Math.sqrt(3) * snookerBallRadius;
export const snookerBlackX = snookerHalfLength - SNOOKER_TABLE.blackFromTopCushionMm * SNOOKER_TABLE.sceneScale;

export const POOL_TABLE = {
  length: 5.2,
  width: 2.6,
  ballRadius: 0.075,
  headStringX: -1.55,
  footSpotX: 1.18,
};

export function snookerBallPosition(x, z = 0) {
  return [x, snookerBallY, z];
}

export function poolBallPosition(x, z = 0) {
  return [x, snookerFeltTopY + POOL_TABLE.ballRadius, z];
}

export function layoutMetrics(layoutId) {
  if (layoutId === "snooker") {
    return {
      length: snookerLength,
      width: snookerWidth,
      halfLength: snookerHalfLength,
      halfWidth: snookerHalfWidth,
      ballRadius: snookerBallRadius,
      ballY: snookerBallY,
      headLineX: snookerBaulkX,
    };
  }

  return {
    length: POOL_TABLE.length,
    width: POOL_TABLE.width,
    halfLength: POOL_TABLE.length / 2,
    halfWidth: POOL_TABLE.width / 2,
    ballRadius: POOL_TABLE.ballRadius,
    ballY: snookerFeltTopY + POOL_TABLE.ballRadius,
    headLineX: POOL_TABLE.headStringX,
  };
}

export function getSnookerRedPositions() {
  return Array.from({ length: 5 }).flatMap((_, row) =>
    Array.from({ length: row + 1 }).map((__, index) => [
      snookerRedApexX + row * snookerRedRowGap,
      snookerBallY,
      (index - row / 2) * SNOOKER_TABLE.ballDiameterMm * SNOOKER_TABLE.sceneScale,
    ])
  );
}

export const snookerRedPositions = getSnookerRedPositions();

export function makeTriangleRack({ apexX, z = 0, rows = 5, ballRadius = snookerBallRadius, ballDiameter = snookerBallRadius * 2 }) {
  return Array.from({ length: rows }).flatMap((_, row) =>
    Array.from({ length: row + 1 }).map((__, index) => [
      apexX + row * Math.sqrt(3) * ballRadius,
      snookerBallY,
      z + (index - row / 2) * ballDiameter,
    ])
  );
}

export function makeDiamondRack({ centerX, z = 0, ballRadius = snookerBallRadius, ballDiameter = snookerBallRadius * 2 }) {
  const rows = [1, 2, 3, 2, 1];
  const startX = centerX - 2 * Math.sqrt(3) * ballRadius;
  return rows.flatMap((count, row) =>
    Array.from({ length: count }).map((__, index) => [
      startX + row * Math.sqrt(3) * ballRadius,
      snookerBallY,
      z + (index - (count - 1) / 2) * ballDiameter,
    ])
  );
}

export const poolBallColors = {
  1: "#facc15",
  2: "#2563eb",
  3: "#dc2626",
  4: "#7c3aed",
  5: "#f97316",
  6: "#16a34a",
  7: "#7f1d1d",
  8: "#111827",
  9: "#facc15",
  10: "#2563eb",
  11: "#dc2626",
  12: "#7c3aed",
  13: "#f97316",
  14: "#16a34a",
  15: "#7f1d1d",
};

export const eightBallRackPositions = makeTriangleRack({
  apexX: POOL_TABLE.footSpotX,
  rows: 5,
  ballRadius: POOL_TABLE.ballRadius,
  ballDiameter: POOL_TABLE.ballRadius * 2,
}).map(([x, , z]) => poolBallPosition(x, z));
export const nineBallRackPositions = makeDiamondRack({
  centerX: POOL_TABLE.footSpotX + 2 * Math.sqrt(3) * POOL_TABLE.ballRadius,
  ballRadius: POOL_TABLE.ballRadius,
  ballDiameter: POOL_TABLE.ballRadius * 2,
}).map(([x, , z]) => poolBallPosition(x, z));
