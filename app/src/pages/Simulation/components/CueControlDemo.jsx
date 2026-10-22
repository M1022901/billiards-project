import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  snookerBallRadius,
  snookerBallY,
  snookerFeltTopY,
  snookerHalfLength,
  snookerHalfWidth,
  snookerLength,
  snookerWidth,
} from "../lib/tableGeometry.js";
import { rotateVector, vectorFromPoint } from "../lib/shotGeometry.js";
import { createTextSprite } from "../lib/threeHelpers.js";
import {
  cueControlPhysics,
  cueLessons,
  cueLineup,
  cueStrikeById,
  cueStrikePoints,
} from "../data/cueControlData.js";

export default function CueControlDemo() {
  const mountRef = useRef(null);
  const markersRef = useRef(null);

  const [mode, setMode] = useState("lessons");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [lineupIndex, setLineupIndex] = useState(0);
  const [selectedTipId, setSelectedTipId] = useState(null);
  const [viewMode, setViewMode] = useState("broadcast");
  const [playbackMode, setPlaybackMode] = useState("idle");
  const [shotRun, setShotRun] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [lineupDone, setLineupDone] = useState(false);
  const [lineupCuePosition, setLineupCuePosition] = useState(null);
  const [zoneTint, setZoneTint] = useState("#a7f3d0");

  const currentLesson = cueLessons[lessonIndex];
  const currentLine = cueLineup[lineupIndex];
  const shot =
    mode === "lessons"
      ? currentLesson
      : {
          ...currentLine,
          cue: lineupCuePosition || currentLine.cue,
        };
  const isAnimating = playbackMode !== "idle";
  const selected = selectedTipId ? cueStrikeById[selectedTipId] : null;
  const reveal = Boolean(outcome?.success) || wrongAttempts > 0;

  // Resetting to a clean idle broadcast whenever the scenario changes.
  useEffect(() => {
    setShotRun(0);
    setPlaybackMode("idle");
    setViewMode("broadcast");
    setOutcome(null);
    setLineupDone(false);
    setZoneTint("#a7f3d0");
  }, [mode, lessonIndex, lineupIndex]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const chosenTipId = selectedTipId;

    const objectV2 = new THREE.Vector2(...shot.object);
    const cueV2 = new THREE.Vector2(...shot.cue);
    const pocketV2 = new THREE.Vector2(...shot.pocket);
    const zoneV2 = new THREE.Vector2(...shot.zone);
    const direction = pocketV2.clone().sub(objectV2).normalize();
    const ghostV2 = objectV2.clone().sub(direction.clone().multiplyScalar(snookerBallRadius * 2));
    const aimV2 = ghostV2.clone().sub(cueV2).normalize();
    const aim3D = new THREE.Vector3(aimV2.x, 0, aimV2.y);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b1713");
    const camera = new THREE.PerspectiveCamera(viewMode === "player" ? 50 : 39, 1, 0.1, 100);

    const remainingLineupBalls =
      mode === "lineup"
        ? cueLineup.slice(lineupIndex).map((item) => new THREE.Vector2(...item.object))
        : [];
    const aimPoints = [cueV2, objectV2, pocketV2, zoneV2, ...remainingLineupBalls];
    const min = aimPoints.reduce(
      (acc, p) => new THREE.Vector2(Math.min(acc.x, p.x), Math.min(acc.y, p.y)),
      new THREE.Vector2(Infinity, Infinity)
    );
    const max = aimPoints.reduce(
      (acc, p) => new THREE.Vector2(Math.max(acc.x, p.x), Math.max(acc.y, p.y)),
      new THREE.Vector2(-Infinity, -Infinity)
    );
    const center = min.clone().add(max).multiplyScalar(0.5);
    const span = Math.max(max.x - min.x, (max.y - min.y) * 1.45);
    const camHeight = THREE.MathUtils.clamp(span * 1.5, 3.2, 4.9);

    if (viewMode === "player") {
      // Low, close vantage behind the cue ball so all five strike dots sit on
      // the near hemisphere and read clearly (higher angles hide the low dot).
      const cue3 = vectorFromPoint([cueV2.x, cueV2.y]);
      camera.position.copy(cue3).addScaledVector(aim3D, -0.5);
      camera.position.y = snookerBallY + 0.1;
      camera.lookAt(cue3);
    } else {
      camera.position.set(center.x, camHeight, center.y + camHeight * 0.07);
      camera.lookAt(vectorFromPoint([center.x, center.y], 0.03));
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.1;
    controls.maxDistance = 8.4;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.enabled = viewMode === "broadcast";
    controls.target.set(
      viewMode === "player" ? cueV2.x : center.x,
      viewMode === "player" ? snookerBallY + 0.03 : 0.03,
      viewMode === "player" ? cueV2.y : center.y
    );
    controls.update();

    const disposable = [];
    const remember = (item) => {
      disposable.push(item);
      return item;
    };

    scene.add(new THREE.HemisphereLight("#f8fafc", "#10241f", 1.5));
    const keyLight = new THREE.DirectionalLight("#ffffff", 2.1);
    keyLight.position.set(-2.6, 4.4, 3.2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const tableGroup = new THREE.Group();
    scene.add(tableGroup);

    const feltMaterial = remember(new THREE.MeshStandardMaterial({ color: "#176b43", roughness: 0.78 }));
    const felt = new THREE.Mesh(remember(new THREE.BoxGeometry(snookerLength, 0.11, snookerWidth)), feltMaterial);
    felt.position.y = snookerFeltTopY - 0.06;
    felt.receiveShadow = true;
    tableGroup.add(felt);

    const railWidth = 0.26;
    const railMaterial = remember(new THREE.MeshStandardMaterial({ color: "#5b341f", roughness: 0.58 }));
    [
      [0, snookerHalfWidth + railWidth / 2, snookerLength + railWidth * 2, railWidth],
      [0, -snookerHalfWidth - railWidth / 2, snookerLength + railWidth * 2, railWidth],
      [snookerHalfLength + railWidth / 2, 0, railWidth, snookerWidth],
      [-snookerHalfLength - railWidth / 2, 0, railWidth, snookerWidth],
    ].forEach(([x, z, width, depth]) => {
      const rail = new THREE.Mesh(remember(new THREE.BoxGeometry(width, 0.18, depth)), railMaterial);
      rail.position.set(x, snookerFeltTopY + 0.02, z);
      rail.castShadow = true;
      rail.receiveShadow = true;
      tableGroup.add(rail);
    });

    const pocketMaterial = remember(new THREE.MeshBasicMaterial({ color: "#020617" }));
    const pocketGeometry = remember(new THREE.CylinderGeometry(0.15, 0.19, 0.025, 40));
    const pocketPositions = [
      [-snookerHalfLength, -snookerHalfWidth],
      [0, -snookerHalfWidth],
      [snookerHalfLength, -snookerHalfWidth],
      [-snookerHalfLength, snookerHalfWidth],
      [0, snookerHalfWidth],
      [snookerHalfLength, snookerHalfWidth],
    ];
    const pocketVectors = pocketPositions.map(([x, z]) => new THREE.Vector2(x, z));
    pocketPositions.forEach(([x, z]) => {
      const pocket = new THREE.Mesh(pocketGeometry, pocketMaterial);
      pocket.position.set(x, snookerFeltTopY + 0.01, z);
      tableGroup.add(pocket);
    });

    const ballGeometry = remember(new THREE.SphereGeometry(snookerBallRadius, 36, 18));
    const addBall = (v2, color, options = {}) => {
      const material = remember(
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.4,
          metalness: 0.02,
          transparent: Boolean(options.opacity),
          opacity: options.opacity || 1,
          wireframe: Boolean(options.wireframe),
        })
      );
      const ball = new THREE.Mesh(ballGeometry, material);
      ball.position.copy(vectorFromPoint([v2.x, v2.y]));
      ball.castShadow = true;
      tableGroup.add(ball);
      return ball;
    };

    const objectBall = addBall(objectV2, shot.ballColor);
    const cueBall = addBall(cueV2, "#f8fafc");
    const futureBallEntries = [];
    if (mode === "lineup") {
      cueLineup.slice(lineupIndex + 1).forEach((lineupShot) => {
        const position = new THREE.Vector2(...lineupShot.object);
        const mesh = addBall(position, lineupShot.ballColor, { opacity: 0.64 });
        futureBallEntries.push({ shot: lineupShot, position, mesh });
      });
    }
    if (viewMode !== "player") {
      addBall(ghostV2, "#f8fafc", { opacity: 0.2 });
    }

    // Pot path + auto-aim guides (broadcast view) help show the pot is fixed.
    const addSegment = (from3, to3, color, radius, opacity, y = snookerFeltTopY + 0.034) => {
      const start = new THREE.Vector3(from3.x, y, from3.z);
      const end = new THREE.Vector3(to3.x, y, to3.z);
      const delta = end.clone().sub(start);
      const length = delta.length();
      const material = remember(new THREE.MeshBasicMaterial({ color, transparent: true, opacity }));
      const segment = new THREE.Mesh(remember(new THREE.CylinderGeometry(radius, radius, length, 16)), material);
      segment.position.copy(start).add(delta.multiplyScalar(0.5));
      segment.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
      tableGroup.add(segment);
      return segment;
    };

    const to3 = (v2, y = snookerFeltTopY + 0.032) => new THREE.Vector3(v2.x, y, v2.y);

    if (viewMode === "broadcast") {
      addSegment(to3(cueV2), to3(ghostV2), "#f8fafc", 0.011, 0.42, snookerFeltTopY + 0.052);
      addSegment(to3(objectV2), to3(pocketV2), shot.pathColor, 0.014, 0.6, snookerFeltTopY + 0.062);
    }

    // Leave-zone disc + ring. Recolours green/red after a settle (zoneTint state).
    const zoneMat = remember(new THREE.MeshBasicMaterial({ color: zoneTint, transparent: true, opacity: 0.34 }));
    const zoneDisc = new THREE.Mesh(remember(new THREE.CircleGeometry(shot.radius, 40)), zoneMat);
    zoneDisc.rotation.x = -Math.PI / 2;
    zoneDisc.position.set(zoneV2.x, snookerFeltTopY + 0.045, zoneV2.y);
    tableGroup.add(zoneDisc);
    const ringMat = remember(new THREE.MeshBasicMaterial({ color: "#d1fae5", transparent: true, opacity: 0.95 }));
    const zoneRing = new THREE.Mesh(remember(new THREE.TorusGeometry(shot.radius, 0.012, 10, 48)), ringMat);
    zoneRing.rotation.x = Math.PI / 2;
    zoneRing.position.set(zoneV2.x, snookerFeltTopY + 0.05, zoneV2.y);
    tableGroup.add(zoneRing);

    // Cue stick along the aim behind the cue ball. Broadcast only: in player
    // view its tip sits on the strike-dot axis and would hide the centre dot.
    const cueStickBack = 0.9;
    const stickFrom = new THREE.Vector3(cueV2.x, snookerBallY - 0.02, cueV2.y).addScaledVector(aim3D, -cueStickBack);
    const stickTo = new THREE.Vector3(cueV2.x, snookerBallY - 0.02, cueV2.y).addScaledVector(aim3D, -0.055);
    const cueStick = addSegment(stickFrom, stickTo, "#c08457", 0.017, 0.96, snookerBallY - 0.02);
    cueStick.visible = viewMode === "broadcast";
    const cueStickBasePosition = cueStick.position.clone();

    // 5 clickable strike points laid on the cue ball (player view only).
    const markersGroup = new THREE.Group();
    const markerList = [];
    const showMarkers = viewMode === "player" && playbackMode === "idle";
    if (showMarkers) {
      const back = aim3D.clone().negate().normalize(); // points toward the striker
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(up, back).normalize();
      const dotGeo = remember(new THREE.SphereGeometry(0.0145, 20, 14));
      const cueStart = vectorFromPoint([cueV2.x, cueV2.y]);
      cueStrikePoints.forEach((point) => {
        const [lx, ly, lz] = point.dotLocal;
        const dir = new THREE.Vector3().addScaledVector(right, lx).addScaledVector(up, ly).addScaledVector(back, lz).normalize();
        const material = remember(new THREE.MeshBasicMaterial({ color: point.color }));
        const mesh = new THREE.Mesh(dotGeo, material);
        mesh.position.copy(cueStart).addScaledVector(dir, snookerBallRadius + 0.013);
        mesh.userData.tipId = point.id;
        markersGroup.add(mesh);
        markerList.push({ id: point.id, mesh, color: point.color });
      });
    }
    markersGroup.visible = showMarkers;
    tableGroup.add(markersGroup);
    markersRef.current = { group: markersGroup, list: markerList };

    const objectLabel = createTextSprite(shot.ballLabel, shot.pathColor);
    objectLabel.position.copy(vectorFromPoint([objectV2.x, objectV2.y], snookerBallY + 0.32));
    scene.add(objectLabel);
    if (viewMode === "broadcast") {
      const zoneLabel = createTextSprite("leave the cue here", "#a7f3d0");
      zoneLabel.position.copy(vectorFromPoint([zoneV2.x, zoneV2.y], snookerBallY + 0.42));
      scene.add(zoneLabel);
    }

    // Clicking a strike dot picks it (player view, idle).
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onClick = (event) => {
      if (!showMarkers) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const py = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(px, py), camera);
      const hits = raycaster.intersectObjects(markerList.map((entry) => entry.mesh), false);
      if (hits.length) {
        const tipId = hits[0].object.userData.tipId;
        if (tipId) setSelectedTipId(tipId);
      }
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("click", onClick);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);
    resize();

    // --- physics (fine fixed substeps mirror the tuned Python model) ---------
    const railRestitution = 0.72;
    const ballRestitution = 0.94;
    const clothFriction = 0.72;
    const stopSpeed = 0.035;
    const pocketRadius = 0.18;
    const substep = 1 / 240;
    const { launchSpeed, followSpeed, drawSpeed, englishRailDeg } = cueControlPhysics;
    const tip = chosenTipId ? cueStrikeById[chosenTipId] : null;

    const bodies = [
      {
        mesh: cueBall,
        role: "cue",
        position: cueV2.clone(),
        velocity: new THREE.Vector2(),
        active: true,
        vertical: tip ? tip.vertical : 0,
        english: tip ? tip.english : 0,
        followApplied: false,
      },
      {
        mesh: objectBall,
        role: "target",
        position: objectV2.clone(),
        velocity: new THREE.Vector2(),
        active: true,
      },
      ...futureBallEntries.map((entry) => ({
        mesh: entry.mesh,
        role: "future",
        position: entry.position.clone(),
        velocity: new THREE.Vector2(),
        active: true,
      })),
    ];
    const minDistance = snookerBallRadius * 2;

    const slowBody = (body, dt) => {
      const speed = body.velocity.length();
      if (speed <= stopSpeed) {
        body.velocity.set(0, 0);
        return;
      }
      body.velocity.setLength(Math.max(0, speed - clothFriction * dt));
    };

    const handleRailBounce = (body) => {
      const minX = -snookerHalfLength + snookerBallRadius;
      const maxX = snookerHalfLength - snookerBallRadius;
      const minZ = -snookerHalfWidth + snookerBallRadius;
      const maxZ = snookerHalfWidth - snookerBallRadius;
      let hit = false;
      if (body.position.x < minX) {
        body.position.x = minX;
        body.velocity.x = Math.abs(body.velocity.x) * railRestitution;
        hit = true;
      } else if (body.position.x > maxX) {
        body.position.x = maxX;
        body.velocity.x = -Math.abs(body.velocity.x) * railRestitution;
        hit = true;
      }
      if (body.position.y < minZ) {
        body.position.y = minZ;
        body.velocity.y = Math.abs(body.velocity.y) * railRestitution;
        hit = true;
      } else if (body.position.y > maxZ) {
        body.position.y = maxZ;
        body.velocity.y = -Math.abs(body.velocity.y) * railRestitution;
        hit = true;
      }
      return hit;
    };

    const handlePockets = (body) => {
      if (!body.active) return;
      if (pocketVectors.some((pocket) => body.position.distanceTo(pocket) < pocketRadius)) {
        body.active = false;
        body.velocity.set(0, 0);
        body.mesh.visible = false;
        if (body === bodies[1]) objectPotted = true;
      }
    };

    let illegalLineupContact = false;

    const collisionTime = (bodyA, bodyB, dt) => {
      if (!bodyA.active || !bodyB.active) return null;
      const offset = bodyA.position.clone().sub(bodyB.position);
      const rel = bodyA.velocity.clone().sub(bodyB.velocity);
      const a = rel.lengthSq();
      const c = offset.lengthSq() - minDistance * minDistance;
      if (c <= 0) return 0;
      if (a <= 1e-12) return null;
      const b = 2 * offset.dot(rel);
      const disc = b * b - 4 * a * c;
      if (disc < 0) return null;
      const enter = (-b - Math.sqrt(disc)) / (2 * a);
      return enter >= 0 && enter <= dt ? enter : null;
    };

    const resolveCollision = (bodyA, bodyB) => {
      const normal = bodyB.position.clone().sub(bodyA.position).normalize();
      const closing = bodyA.velocity.clone().sub(bodyB.velocity).dot(normal);
      if (closing <= 0) return;
      let incomingDir = null;
      if (bodyA.role === "cue" && bodyB.role === "target" && bodyA.vertical && !bodyA.followApplied) {
        incomingDir = bodyA.velocity.clone().normalize();
      }
      const impulse = ((1 + ballRestitution) * closing) / 2;
      bodyA.velocity.addScaledVector(normal, -impulse);
      bodyB.velocity.addScaledVector(normal, impulse);
      if (incomingDir) {
        const addSpeed = bodyA.vertical > 0 ? followSpeed : drawSpeed;
        bodyA.velocity.addScaledVector(incomingDir, bodyA.vertical * addSpeed);
        bodyA.followApplied = true;
      }
      if (mode === "lineup" && (bodyA.role === "future" || bodyB.role === "future")) {
        illegalLineupContact = true;
      }
    };

    const stepBodies = (dt) => {
      let earliest = null;
      for (let i = 0; i < bodies.length; i += 1) {
        for (let j = i + 1; j < bodies.length; j += 1) {
          const time = collisionTime(bodies[i], bodies[j], dt);
          if (time !== null && (!earliest || time < earliest.time)) {
            earliest = { time, a: bodies[i], b: bodies[j] };
          }
        }
      }

      const travelTime = earliest ? earliest.time : dt;
      bodies.forEach((body) => {
        if (body.active) body.position.addScaledVector(body.velocity, travelTime);
      });

      if (earliest) {
        resolveCollision(earliest.a, earliest.b);
        const remaining = dt - travelTime;
        bodies.forEach((body) => {
          if (body.active) body.position.addScaledVector(body.velocity, remaining);
        });
      }
    };

    const updateMeshes = (dt) => {
      bodies.forEach((body) => {
        if (!body.active) return;
        slowBody(body, dt);
        const hit = handleRailBounce(body);
        if (hit && body.english && bodies[0] === body) {
          body.velocity.copy(rotateVector(body.velocity, body.english * THREE.MathUtils.degToRad(englishRailDeg)));
          body.english = 0;
        }
        handlePockets(body);
        body.mesh.position.copy(vectorFromPoint([body.position.x, body.position.y]));
        if (body.velocity.lengthSq() > 0) {
          body.mesh.rotation.z -= body.velocity.x * dt * 10;
          body.mesh.rotation.x += body.velocity.y * dt * 10;
        }
      });
    };

    let frameId = 0;
    let resultTimeout = 0;
    let shotStarted = false;
    let completionReported = false;
    let objectPotted = false;
    let accumulator = 0;
    const animationStart = performance.now();
    let previousTime = animationStart;
    const warmupDelay = playbackMode === "shot" ? 650 : 300;

    const cueRestDistance = () =>
      bodies[0].active ? bodies[0].position.distanceTo(zoneV2) : Infinity;

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const now = performance.now();
      const frameDt = Math.min((now - previousTime) / 1000, 1 / 30);
      previousTime = now;
      const wallElapsed = now - animationStart;

      if (isAnimating) {
        if (playbackMode === "shot" && !shotStarted) {
          const warmup = Math.min(wallElapsed / warmupDelay, 1);
          const pulse = Math.sin(warmup * Math.PI * 4) * 0.05;
          cueStick.position.copy(cueStickBasePosition);
          cueStick.position.addScaledVector(aim3D, pulse);
        }
        if (!shotStarted && wallElapsed >= warmupDelay) {
          shotStarted = true;
          cueStick.position.copy(cueStickBasePosition);
          bodies[0].velocity.copy(aimV2).multiplyScalar(launchSpeed);
        }
        if (shotStarted) {
          accumulator += frameDt;
          let guard = 0;
          while (accumulator >= substep && guard < 600) {
            stepBodies(substep);
            updateMeshes(substep);
            accumulator -= substep;
            guard += 1;
          }
        }
        const moving = bodies.some((body) => body.active && body.velocity.length() > stopSpeed);
        if (!completionReported && shotStarted && (!moving || wallElapsed > 8000)) {
          completionReported = true;
          const dist = cueRestDistance();
          const success = objectPotted && dist <= shot.radius && dist !== Infinity && !illegalLineupContact;
          const cueRest = bodies[0].active ? [bodies[0].position.x, bodies[0].position.y] : null;
          resultTimeout = window.setTimeout(() => {
            if (playbackMode === "shot") {
              setViewMode("broadcast");
              setPlaybackMode("replay");
              setShotRun((value) => value + 1);
            } else if (playbackMode === "replay") {
              setPlaybackMode("idle");
              setShotRun((value) => value + 1);
              setZoneTint(success ? "#34d399" : "#fb7185");
              setOutcome({
                success,
                chosen: chosenTipId,
                correct: shot.technique,
                dist,
                cueRest,
                illegalContact: illegalLineupContact,
              });
              if (mode === "lessons") {
                if (!success) setWrongAttempts((value) => value + 1);
              } else if (!success) {
                setWrongAttempts(0);
              }
            }
          }, 450);
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(resultTimeout);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object.material?.map) object.material.map.dispose();
        if (object.userData.texture) object.userData.texture.dispose();
        if (object.material) object.material.dispose();
        if (object.geometry) object.geometry.dispose();
      });
      disposable.forEach((item) => item.dispose?.());
      controls.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, lessonIndex, lineupIndex, viewMode, playbackMode, shotRun, zoneTint]);

  // Refresh strike-point highlight after a rebuild or a new selection.
  useEffect(() => {
    const markerRef = markersRef.current;
    if (markerRef) {
      markerRef.list.forEach(({ id, mesh, color }) => {
        const isSelected = selectedTipId === id;
        mesh.material.color.set(color);
        if (isSelected) {
          mesh.material.color.lerp(new THREE.Color("#ffffff"), 0.45);
          mesh.scale.setScalar(1.4);
        } else {
          mesh.scale.setScalar(1);
        }
      });
      markerRef.group.visible = viewMode === "player" && playbackMode === "idle";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTipId, viewMode, playbackMode, shotRun, mode, lessonIndex, lineupIndex]);

  const correctName = shot ? cueStrikeById[shot.technique]?.name : "";
  const lessonNumber = mode === "lessons" ? lessonIndex + 1 : lineupIndex + 1;
  const lessonCount = mode === "lessons" ? cueLessons.length : cueLineup.length;

  const resetScenarioState = (nextLesson, nextLine) => {
    if (mode === "lessons" && nextLesson != null) setLessonIndex(nextLesson);
    if (mode === "lineup" && nextLine != null) setLineupIndex(nextLine);
    setSelectedTipId(null);
    setWrongAttempts(0);
    setOutcome(null);
    setPlaybackMode("idle");
    setViewMode("broadcast");
    setShotRun((value) => value + 1);
  };

  const startShot = () => {
    if (!selectedTipId || isAnimating) return;
    setOutcome(null);
    setZoneTint("#a7f3d0");
    setPlaybackMode("shot");
    setViewMode("player");
    setShotRun((value) => value + 1);
  };

  const switchSituation = (index) => {
    setLessonIndex(index);
    setSelectedTipId(null);
    setWrongAttempts(0);
    setOutcome(null);
    setPlaybackMode("idle");
    setViewMode("broadcast");
    setShotRun((value) => value + 1);
  };

  const handleLessonSuccess = () => {
    if (lessonIndex < cueLessons.length - 1) {
      resetScenarioState(lessonIndex + 1, 0);
    } else {
      setMode("lineup");
      setLineupIndex(0);
      setSelectedTipId(null);
      setWrongAttempts(0);
      setOutcome(null);
      setPlaybackMode("idle");
      setViewMode("broadcast");
      setShotRun((value) => value + 1);
    }
  };

  const handleLineupSuccess = () => {
    if (lineupIndex < cueLineup.length - 1) {
      if (outcome?.cueRest) setLineupCuePosition(outcome.cueRest);
      resetScenarioState(null, lineupIndex + 1);
    } else {
      setOutcome(null);
      setLineupDone(true);
    }
  };

  const handleLineupFail = () => {
    setOutcome(null);
    setLineupDone(false);
    setLineupIndex(0);
    setLineupCuePosition(null);
    setSelectedTipId(null);
    setWrongAttempts(0);
    setPlaybackMode("idle");
    setViewMode("broadcast");
    setShotRun((value) => value + 1);
  };

  const backToLessons = () => {
    setLineupDone(false);
    setLineupCuePosition(null);
    setMode("lessons");
    setLessonIndex(0);
    setSelectedTipId(null);
    setWrongAttempts(0);
    setOutcome(null);
    setPlaybackMode("idle");
    setViewMode("broadcast");
    setShotRun((value) => value + 1);
  };

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    setLessonIndex(0);
    setLineupIndex(0);
    setLineupCuePosition(null);
    setSelectedTipId(null);
    setWrongAttempts(0);
    setOutcome(null);
    setPlaybackMode("idle");
    setViewMode("broadcast");
    setShotRun((value) => value + 1);
    setLineupDone(false);
  };

  const modalTitle = outcome
    ? outcome.success
      ? mode === "lessons"
        ? `Correct - ${cueStrikeById[outcome.correct]?.name}`
        : "On the spot"
      : mode === "lessons"
        ? "Not quite"
        : "Turn over"
    : "";
  const modalDetail = outcome
    ? mode === "lessons"
      ? outcome.success
        ? shot.why
        : `You played ${cueStrikeById[outcome.chosen]?.name ?? "nothing"}. This spot needs ${correctName}: ${shot.why}`
      : outcome.success
        ? `The cue is in position - ${correctName} sends you to the next ball in the line-up.`
        : outcome.illegalContact
          ? "The cue ball contacted another ball early. The run is over and the table passes to the opponent."
          : `${cueStrikeById[outcome.chosen]?.name ?? "That"} left the cue off the route. The run is over and the table passes to the opponent.`
    : "";

  return (
    <div className="cue-control-demo">
      <div className="cue-control-stage">
        <div ref={mountRef} className="cue-control-canvas" aria-label="Interactive cue ball control simulation" />
        {outcome ? (
          <div className={`cue-result-modal ${outcome.success ? "success" : "miss"}`} role="status">
            <span>{modalTitle}</span>
            <p>{modalDetail}</p>
            <div>
              {mode === "lessons" ? (
                outcome.success ? (
                  <>
                    <button type="button" onClick={() => setOutcome(null)}>
                      Close
                    </button>
                    <button type="button" onClick={handleLessonSuccess}>
                      {lessonIndex < cueLessons.length - 1 ? "Next situation" : "Start the line-up"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setOutcome(null);
                        setPlaybackMode("idle");
                        setViewMode("broadcast");
                        setShotRun((value) => value + 1);
                      }}
                    >
                      Review in broadcast
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOutcome(null);
                        setPlaybackMode("idle");
                        setViewMode("player");
                        setShotRun((value) => value + 1);
                      }}
                    >
                      Try again
                    </button>
                  </>
                )
              ) : outcome.success ? (
                <>
                  <button type="button" onClick={() => setOutcome(null)}>
                    Watch shot
                  </button>
                  <button type="button" onClick={handleLineupSuccess}>
                    {lineupIndex < cueLineup.length - 1 ? "Continue run" : "Finish line-up"}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setOutcome(null)}>
                    Review
                  </button>
                  <button type="button" onClick={handleLineupFail}>
                    Restart after turnover
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
        {lineupDone ? (
          <div className="cue-result-modal success" role="status">
            <span>Clean run!</span>
            <p>
              You potted all five balls and left the cue ball in every zone. That is position play - striking the
              same pot differently so the cue ends up where you need it next.
            </p>
            <div>
              <button type="button" onClick={backToLessons}>
                Back to situations
              </button>
              <button type="button" onClick={handleLineupFail}>
                Play the line-up again
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <aside className="cue-control-info">
        <div className="cue-mode-switch" aria-label="Choose cue-control mode">
          <button type="button" className={mode === "lessons" ? "active" : ""} onClick={() => switchMode("lessons")}>
            Lessons
          </button>
          <button type="button" className={mode === "lineup" ? "active" : ""} onClick={() => switchMode("lineup")}>
            Play - line-up
          </button>
        </div>

        {mode === "lessons" ? (
          <>
            <div className="cue-situation-switch" aria-label="Choose a lesson">
              {cueLessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  type="button"
                  className={index === lessonIndex ? "active" : ""}
                  style={{ "--shot-color": lesson.pathColor }}
                  disabled={isAnimating}
                  onClick={() => switchSituation(index)}
                >
                  <span />
                  <b>{lesson.situation}</b>
                  <em>Lesson {index + 1} of {cueLessons.length}</em>
                </button>
              ))}
            </div>
            <span>Situation {lessonNumber} of {lessonCount}</span>
            <h4>{shot.situation}</h4>
            <p>{shot.question}</p>
            {reveal ? (
              <div className="cue-reveal">
                <b style={{ color: cueStrikeById[shot.technique]?.color }}>
                  Play {correctName} - {cueStrikeById[shot.technique]?.tag}
                </b>
                <em>{shot.why}</em>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="cue-lineup-head">
              <span>Ball {lineupNumberLabel()}</span>
              <b>{lineupIndex + 1} of {cueLineup.length}</b>
            </div>
            <h4>Line-up position play</h4>
            <p>
              Pot the {shot.ballLabel.toLowerCase()} ball into the {shot.pocketName} and leave the cue ball on the
              green spot for the next ball. A wrong strike turns the table over.
            </p>
            {lineupCuePosition ? <p>The cue ball is playing from the previous shot's leave.</p> : null}
            {lineupDone ? <p>Clean run - you kept the cue in every zone.</p> : null}
          </>
        )}

        <div className="cue-view-switch" aria-label="Choose cue-control view">
          <button
            type="button"
            className={viewMode === "broadcast" ? "active" : ""}
            disabled={isAnimating}
            onClick={() => {
              setViewMode("broadcast");
              setOutcome(null);
              setShotRun((value) => value + 1);
            }}
          >
            Broadcast
          </button>
          <button
            type="button"
            className={viewMode === "player" ? "active" : ""}
            disabled={isAnimating}
            onClick={() => {
              setViewMode("player");
              setOutcome(null);
              setShotRun((value) => value + 1);
            }}
          >
            Player
          </button>
        </div>

        <div className="cue-choose-title">
          <b>Strike point</b>
          {selected ? (
            <em style={{ color: selected.color }}>{selected.name} - {selected.tag}</em>
          ) : (
            <em>Pick a strike point on the cue ball</em>
          )}
        </div>
        <div className="tip-pad" aria-label="Choose where to strike the cue ball">
          {cueStrikePoints.map((point) => (
            <button
              key={point.id}
              type="button"
              className={`tip-dot ${point.id}`}
              style={{ "--tip-color": point.color }}
              title={point.name}
              disabled={isAnimating}
              aria-pressed={selectedTipId === point.id}
              onClick={() => {
                setSelectedTipId(point.id);
                setOutcome(null);
              }}
            >
              <i />
            </button>
          ))}
        </div>
        <div className="tip-pad-key">
          {cueStrikePoints.map((point) => (
            <span key={point.id}>
              <i style={{ background: point.color }} />
              <b>{point.name}</b>
            </span>
          ))}
        </div>

        <div className="cue-sim-controls">
          <button type="button" disabled={!selectedTipId || isAnimating} onClick={startShot}>
            {isAnimating ? "Shot in progress" : "Strike the cue ball"}
          </button>
        </div>

        <div className="table-tour-facts">
          <section>
            <b>Ball</b>
            <em>{shot.ballLabel} - pot into the {shot.pocketName}</em>
          </section>
          <section>
            <b>Task</b>
            <em>Leave the cue ball inside the green zone after the pot</em>
          </section>
          <section>
            <b>Hint</b>
            <em>{selected ? `${selected.name}: ${selected.blurb}` : "High rolls on, centre stops, low draws back, side spin bends at the cushion."}</em>
          </section>
        </div>

        <div className="cue-legend">
          <i className="cue" />
          <b>Cue ball</b>
          <i className="ball" style={{ background: shot.ballColor }} />
          <b>{shot.ballLabel}</b>
          <i className="route" style={{ background: shot.pathColor }} />
          <b>Pot path</b>
          <i className="zone" />
          <b>Leave-zone</b>
        </div>
      </aside>
    </div>
  );

  function lineupNumberLabel() {
    return ["One", "Two", "Three", "Four", "Five"][lineupIndex] || `${lineupIndex + 1}`;
  }
}
