import * as THREE from "three";
import { snookerBallRadius, snookerBallY } from "./tableGeometry.js";

export function vectorFromPoint([x, z], y = snookerBallY) {
  return new THREE.Vector3(x, y, z);
}

export function shotGeometry(shot) {
  const object = new THREE.Vector2(...shot.object);
  const firstTarget = new THREE.Vector2(...(shot.bankPoint || shot.pocket));
  const pocket = new THREE.Vector2(...shot.pocket);
  const direction = firstTarget.clone().sub(object).normalize();
  const ghost = object.clone().sub(direction.clone().multiplyScalar(snookerBallRadius * 2));
  const cue = new THREE.Vector2(...shot.cue);

  return { object, firstTarget, pocket, ghost, cue, direction };
}

export function rotateVector(vector, radians) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return new THREE.Vector2(vector.x * cos - vector.y * sin, vector.x * sin + vector.y * cos).normalize();
}

export function lineDistanceToPoint(origin, direction, point) {
  const toPoint = point.clone().sub(origin);
  const projected = toPoint.dot(direction);
  const closest = origin.clone().add(direction.clone().multiplyScalar(projected));
  return { projected, distance: closest.distanceTo(point), closest };
}

export function aimingSimulation(shot, angleOffsetDegrees) {
  const geometry = shotGeometry(shot);
  const centerBallAim = geometry.object.clone().sub(geometry.cue).normalize();
  const cueDirection = rotateVector(centerBallAim, THREE.MathUtils.degToRad(angleOffsetDegrees));
  const impactTest = lineDistanceToPoint(geometry.cue, cueDirection, geometry.object);
  const collisionDistance = snookerBallRadius * 2;
  const reachesObject = impactTest.projected > 0 && impactTest.distance <= collisionDistance;
  const contactTravel = reachesObject
    ? impactTest.projected - Math.sqrt(Math.max(collisionDistance ** 2 - impactTest.distance ** 2, 0))
    : Math.max(0.45, Math.min(impactTest.projected, 1.8));
  const projectedGhost = geometry.cue.clone().add(cueDirection.clone().multiplyScalar(contactTravel));
  const objectDirection = reachesObject ? geometry.object.clone().sub(projectedGhost).normalize() : null;
  const targetDirection = geometry.direction;
  const angleError = objectDirection
    ? THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(objectDirection.dot(targetDirection), -1, 1)))
    : 99;
  const pocketError = objectDirection ? Math.sin(THREE.MathUtils.degToRad(angleError)) * geometry.object.distanceTo(geometry.firstTarget) : Infinity;
  // pocketError is the lateral offset of the object-ball path at the pocket. Mark a
  // shot as a pot when that path clips the pocket's capture circle (radius 0.18 in
  // the physics), so the pre-shot overlay agrees with what actually drops.
  const isPotted = reachesObject && angleError < (shot.bankPoint ? 2.8 : 3.5) && pocketError < 0.18;
  const fullness = reachesObject ? Math.max(0, 1 - impactTest.distance / collisionDistance) : 0;

  return {
    ...geometry,
    cueDirection,
    projectedGhost,
    objectDirection,
    reachesObject,
    angleError,
    isPotted,
    fullness,
  };
}

export function frameAimingView(simulation) {
  const points = [simulation.cue, simulation.object, simulation.ghost, simulation.firstTarget, simulation.pocket];
  const min = points.reduce(
    (acc, point) => new THREE.Vector2(Math.min(acc.x, point.x), Math.min(acc.y, point.y)),
    new THREE.Vector2(Infinity, Infinity)
  );
  const max = points.reduce(
    (acc, point) => new THREE.Vector2(Math.max(acc.x, point.x), Math.max(acc.y, point.y)),
    new THREE.Vector2(-Infinity, -Infinity)
  );
  const center = min.clone().add(max).multiplyScalar(0.5);
  const span = Math.max(max.x - min.x, (max.y - min.y) * 1.55);
  const height = THREE.MathUtils.clamp(span * 1.45, 3.35, 4.85);

  return { center, height };
}
