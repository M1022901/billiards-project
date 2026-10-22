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
import { aimingSimulation, frameAimingView, vectorFromPoint } from "../lib/shotGeometry.js";
import { createTextSprite } from "../lib/threeHelpers.js";
import { ghostAimingShots } from "../data/aimingShots.js";

export default function GhostBallAimingDemo() {
  const mountRef = useRef(null);
  const [activeShotId, setActiveShotId] = useState(ghostAimingShots[0].id);
  const [playMode, setPlayMode] = useState("practice");
  const [viewMode, setViewMode] = useState("broadcast");
  const [angleOffset, setAngleOffset] = useState(0);
  const [shotRun, setShotRun] = useState(0);
  const [playbackMode, setPlaybackMode] = useState("idle");
  const [shotOutcome, setShotOutcome] = useState(null);
  const activeShot = ghostAimingShots.find((shot) => shot.id === activeShotId) || ghostAimingShots[0];
  const currentSimulation = aimingSimulation(activeShot, angleOffset);
  const showGuides = playMode === "practice";
  const isAnimating = playbackMode !== "idle";
  const contactText = currentSimulation.reachesObject
    ? `${Math.round(currentSimulation.fullness * 100)}% ball contact`
    : "Misses object ball";

  useEffect(() => {
    setAngleOffset(0);
    setShotRun(0);
    setPlayMode("practice");
    setViewMode("broadcast");
    setPlaybackMode("idle");
    setShotOutcome(null);
  }, [activeShotId]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const simulation = aimingSimulation(activeShot, angleOffset);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b1713");

    const camera = new THREE.PerspectiveCamera(viewMode === "player" ? 56 : 39, 1, 0.1, 100);
    const focus = frameAimingView(simulation);
    if (viewMode === "player") {
      const cameraOffset = simulation.cueDirection.clone().multiplyScalar(-1.34);
      const lookAhead = simulation.cue.clone().lerp(simulation.object, 0.42);
      camera.position.set(simulation.cue.x + cameraOffset.x, 0.48, simulation.cue.y + cameraOffset.y);
      camera.lookAt(vectorFromPoint([lookAhead.x, lookAhead.y], snookerBallY + 0.035));
    } else {
      camera.position.set(focus.center.x, focus.height, focus.center.y + focus.height * 0.08);
      camera.lookAt(vectorFromPoint([focus.center.x, focus.center.y], 0.04));
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controls.minDistance = 2.35;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI / 2.22;
    controls.enabled = viewMode === "broadcast";
    const playerTarget = simulation.cue.clone().lerp(simulation.object, 0.36);
    controls.target.copy(viewMode === "broadcast" || shotRun > 0 ? vectorFromPoint([focus.center.x, focus.center.y], 0.04) : vectorFromPoint([playerTarget.x, playerTarget.y], snookerBallY + 0.035));

    const disposable = [];
    const remember = (item) => {
      disposable.push(item);
      return item;
    };

    scene.add(new THREE.HemisphereLight("#f8fafc", "#10241f", 1.6));
    const keyLight = new THREE.DirectionalLight("#ffffff", 2.2);
    keyLight.position.set(-2.6, 4.4, 3.2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const tableGroup = new THREE.Group();
    tableGroup.rotation.x = -0.01;
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
    pocketPositions.forEach(([x, z]) => {
      const pocket = new THREE.Mesh(pocketGeometry, pocketMaterial);
      pocket.position.set(x, snookerFeltTopY + 0.01, z);
      tableGroup.add(pocket);
    });

    const addSegment = (from, to, color, radius, opacity = 1, y = snookerFeltTopY + 0.034) => {
      const start = new THREE.Vector3(from.x, snookerFeltTopY + 0.034, from.y);
      start.y = y;
      const end = new THREE.Vector3(to.x, y, to.y);
      const delta = end.clone().sub(start);
      const length = delta.length();
      const material = remember(new THREE.MeshBasicMaterial({ color, transparent: true, opacity }));
      const segment = new THREE.Mesh(remember(new THREE.CylinderGeometry(radius, radius, length, 16)), material);
      segment.position.copy(start).add(delta.multiplyScalar(0.5));
      segment.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
      tableGroup.add(segment);
      return segment;
    };

    const addTargetDot = (point, color, radius = 0.052, opacity = 0.92) => {
      const dot = new THREE.Mesh(
        remember(new THREE.CylinderGeometry(radius, radius, 0.02, 28)),
        remember(new THREE.MeshBasicMaterial({ color, transparent: true, opacity }))
      );
      dot.position.set(point.x, snookerFeltTopY + 0.055, point.y);
      tableGroup.add(dot);
      return dot;
    };

    const aimEnd = simulation.reachesObject
      ? simulation.projectedGhost
      : simulation.cue.clone().add(simulation.cueDirection.clone().multiplyScalar(2.2));
    const resultEnd = simulation.objectDirection
      ? simulation.object.clone().add(simulation.objectDirection.clone().multiplyScalar(simulation.object.distanceTo(simulation.firstTarget)))
      : simulation.object.clone();
    const cueBackDistance = viewMode === "player" ? 1.34 : 0.78;
    const cueBack = simulation.cue.clone().sub(simulation.cueDirection.clone().multiplyScalar(cueBackDistance));
    const cueTip = simulation.cue.clone().sub(simulation.cueDirection.clone().multiplyScalar(0.09));
    const cueStick = addSegment(cueBack, cueTip, "#c08457", 0.018, 0.95, viewMode === "player" ? snookerBallY - 0.018 : snookerBallY + 0.015);
    if (showGuides) {
      addSegment(simulation.cue, aimEnd, "#f8fafc", 0.012, 0.46, snookerFeltTopY + 0.052);
      addSegment(simulation.object, simulation.firstTarget, activeShot.pathColor, 0.014, 0.58, snookerFeltTopY + 0.062);
      if (shotRun > 0 && simulation.objectDirection && !simulation.isPotted) {
        addSegment(simulation.object, resultEnd, "#ef4444", 0.014, 0.64, snookerFeltTopY + 0.072);
      }
      addTargetDot(simulation.ghost, "#f8fafc", 0.058, 0.26);
      addTargetDot(simulation.projectedGhost, simulation.isPotted ? "#22c55e" : simulation.reachesObject ? "#f59e0b" : "#ef4444", 0.046, 0.9);
    }

    const ballGeometry = remember(new THREE.SphereGeometry(snookerBallRadius, 36, 18));
    const addBall = (point, color, options = {}) => {
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
      ball.position.copy(vectorFromPoint([point.x, point.y]));
      ball.castShadow = true;
      tableGroup.add(ball);
      return ball;
    };

    const objectBall = addBall(simulation.object, activeShot.ballColor);
    const cueBall = addBall(simulation.cue, "#f8fafc");
    if (showGuides) {
      addBall(simulation.ghost, "#f8fafc", { opacity: 0.2 });
      addBall(simulation.projectedGhost, simulation.isPotted ? "#bbf7d0" : simulation.reachesObject ? "#fde68a" : "#fecaca", {
        opacity: 0.42,
      });
    }

    if (showGuides) {
      const labelSide = new THREE.Vector2(-simulation.cueDirection.y, simulation.cueDirection.x);
      const labelPoint = (point, side = 0, forward = 0, height = snookerBallY + 0.3) => {
        const shifted = point
          .clone()
          .add(labelSide.clone().multiplyScalar(side))
          .add(simulation.cueDirection.clone().multiplyScalar(forward));
        return vectorFromPoint([shifted.x, shifted.y], height);
      };

      const ghostRing = new THREE.Mesh(
        remember(new THREE.TorusGeometry(snookerBallRadius * 1.14, 0.009, 12, 40)),
        remember(new THREE.MeshBasicMaterial({ color: "#f8fafc", transparent: true, opacity: 0.92 }))
      );
      ghostRing.position.copy(vectorFromPoint([simulation.ghost.x, simulation.ghost.y], snookerBallY + 0.005));
      ghostRing.rotation.x = Math.PI / 2;
      tableGroup.add(ghostRing);

      const cueLabel = createTextSprite("Cue ball");
      cueLabel.position.copy(labelPoint(simulation.cue, 0.2, -0.18, snookerBallY + 0.29));
      scene.add(cueLabel);

      const ghostLabel = createTextSprite("Ghost ball", "#fde68a");
      ghostLabel.position.copy(labelPoint(simulation.ghost, -0.22, 0.1, snookerBallY + 0.3));
      scene.add(ghostLabel);

      const projectedLabel = createTextSprite("contact shadow", simulation.isPotted ? "#bbf7d0" : "#fecaca");
      projectedLabel.position.copy(labelPoint(simulation.projectedGhost, 0.24, 0.06, snookerBallY + 0.25));
      scene.add(projectedLabel);

      const objectLabel = createTextSprite(activeShot.ballLabel, activeShot.pathColor);
      objectLabel.position.copy(labelPoint(simulation.object, -0.18, 0.18, snookerBallY + 0.3));
      scene.add(objectLabel);
    }

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);
    resize();

    let frameId = 0;
    let resultTimeout = 0;
    const animationStart = performance.now();
    let previousTime = animationStart;
    const cueStickBasePosition = cueStick.position.clone();
    const bodies = [
      {
        mesh: cueBall,
        position: simulation.cue.clone(),
        velocity: new THREE.Vector2(),
        active: true,
      },
      {
        mesh: objectBall,
        position: simulation.object.clone(),
        velocity: new THREE.Vector2(),
        active: true,
      },
    ];
    const pocketVectors = pocketPositions.map(([x, z]) => new THREE.Vector2(x, z));
    const railRestitution = 0.72;
    const ballRestitution = 0.94;
    const clothFriction = 0.72;
    const stopSpeed = 0.035;
    const pocketRadius = 0.18;
    const shotStartDelay = playbackMode === "real-shot" ? 1250 : 0;
    let shotStarted = false;
    let completionReported = false;
    let objectPotted = false;

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
      if (body.position.x < minX) {
        body.position.x = minX;
        body.velocity.x = Math.abs(body.velocity.x) * railRestitution;
      } else if (body.position.x > maxX) {
        body.position.x = maxX;
        body.velocity.x = -Math.abs(body.velocity.x) * railRestitution;
      }
      if (body.position.y < minZ) {
        body.position.y = minZ;
        body.velocity.y = Math.abs(body.velocity.y) * railRestitution;
      } else if (body.position.y > maxZ) {
        body.position.y = maxZ;
        body.velocity.y = -Math.abs(body.velocity.y) * railRestitution;
      }
    };

    const handlePockets = (body) => {
      if (!body.active) return;
      const falls = pocketVectors.some((pocket) => body.position.distanceTo(pocket) < pocketRadius);
      if (falls) {
        body.active = false;
        body.velocity.set(0, 0);
        body.mesh.visible = false;
        if (body === bodies[1]) objectPotted = true;
      }
    };

    // Continuous collision detection between the two balls. Advances both bodies
    // for `dt`, but when the cue ball first reaches contact distance within this
    // frame, both are stopped at that exact first-touch geometry and the impact
    // impulse is applied there. This keeps the physical shot on the same line the
    // aiming overlay predicts; the previous coarse per-frame stepping let the cue
    // ball penetrate before detection and launched the object ball off line.
    const advanceBodies = (dt) => {
      const [cueBody, objectBody] = bodies;
      const minDistance = snookerBallRadius * 2;
      let remaining = dt;

      if (cueBody.active && objectBody.active) {
        const offset = cueBody.position.clone().sub(objectBody.position);
        const relativeVelocity = cueBody.velocity.clone().sub(objectBody.velocity);
        const a = relativeVelocity.lengthSq();
        const c = offset.lengthSq() - minDistance * minDistance;
        let contactTime = null;

        if (c <= 0) {
          contactTime = 0;
        } else if (a > 1e-12) {
          const b = 2 * offset.dot(relativeVelocity);
          const disc = b * b - 4 * a * c;
          if (disc >= 0) {
            const root = Math.sqrt(disc);
            const enter = (-b - root) / (2 * a);
            if (enter >= 0 && enter <= remaining) {
              contactTime = enter;
            }
          }
        }

        if (contactTime !== null) {
          cueBody.position.add(cueBody.velocity.clone().multiplyScalar(contactTime));
          objectBody.position.add(objectBody.velocity.clone().multiplyScalar(contactTime));
          const normal = objectBody.position.clone().sub(cueBody.position).normalize();
          const closingSpeed = cueBody.velocity.clone().sub(objectBody.velocity).dot(normal);
          if (closingSpeed > 0) {
            const impulse = ((1 + ballRestitution) * closingSpeed) / 2;
            cueBody.velocity.add(normal.clone().multiplyScalar(-impulse));
            objectBody.velocity.add(normal.clone().multiplyScalar(impulse));
          }
          remaining = dt - contactTime;
        }
      }

      bodies.forEach((body) => {
        if (!body.active) return;
        body.position.add(body.velocity.clone().multiplyScalar(remaining));
      });
    };

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      if (isAnimating) {
        const now = performance.now();
        const dt = Math.min((now - previousTime) / 1000, 1 / 30);
        previousTime = now;
        const wallElapsed = now - animationStart;

        if (playbackMode === "real-shot" && !shotStarted) {
          const warmup = Math.min(wallElapsed / shotStartDelay, 1);
          const pulse = Math.sin(warmup * Math.PI * 4) * 0.055;
          cueStick.position.copy(cueStickBasePosition);
          cueStick.position.x += simulation.cueDirection.x * pulse;
          cueStick.position.z += simulation.cueDirection.y * pulse;
        }

        if (!shotStarted && wallElapsed >= shotStartDelay) {
          shotStarted = true;
          cueStick.position.copy(cueStickBasePosition);
          bodies[0].velocity.copy(simulation.cueDirection).multiplyScalar(3.15);
        }

        if (shotStarted) {
          advanceBodies(dt);
          bodies.forEach((body) => {
            if (!body.active) return;
            slowBody(body, dt);
            handleRailBounce(body);
            handlePockets(body);
            body.mesh.position.copy(vectorFromPoint([body.position.x, body.position.y]));
            if (body.velocity.lengthSq() > 0) {
              body.mesh.rotation.z -= body.velocity.x * dt * 10;
              body.mesh.rotation.x += body.velocity.y * dt * 10;
            }
          });
        }

        const moving = bodies.some((body) => body.active && body.velocity.length() > stopSpeed);
        if (!completionReported && shotStarted && (!moving || wallElapsed > 5200)) {
          completionReported = true;
          const success = objectPotted || simulation.isPotted;
          resultTimeout = window.setTimeout(() => {
            if (playbackMode === "real-shot") {
              setViewMode("broadcast");
              setPlaybackMode("real-replay");
              setShotRun((value) => value + 1);
            } else if (playbackMode === "practice-shot") {
              setPlaybackMode("idle");
            } else {
              setPlaybackMode("idle");
              setShotOutcome({
                success,
                title: success ? "Congratulations" : "Unlucky",
                detail: success ? "Your aim was precise." : "Try the angle again.",
              });
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
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
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
  }, [activeShot, angleOffset, shotRun, viewMode, showGuides, playbackMode, isAnimating, playMode]);

  return (
    <div className="ghost-aim-demo">
      <div className="ghost-aim-stage">
        <div ref={mountRef} className="ghost-aim-canvas" aria-label="Interactive ghost ball aiming simulation" />
        {shotOutcome ? (
          <div className={`ghost-result-modal ${shotOutcome.success ? "success" : "miss"}`} role="status">
            <span>{shotOutcome.title}</span>
            <p>{shotOutcome.detail}</p>
            <div>
              <button
                type="button"
                onClick={() => {
                  setShotOutcome(null);
                  setPlaybackMode("idle");
                  setShotRun(0);
                  setPlayMode("practice");
                  setViewMode("broadcast");
                }}
              >
                Back to practice
              </button>
              <button
                type="button"
                onClick={() => {
                  setShotOutcome(null);
                  setPlaybackMode("idle");
                  setShotRun(0);
                  setPlayMode("real");
                  setAngleOffset(activeShot.challengeOffset);
                  setViewMode("player");
                }}
              >
                Challenge again
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <aside className="ghost-aim-info">
        <div className={`ghost-mode-badge ${playMode}`}>
          {playMode === "practice" ? "Practice mode" : "Real play"}
        </div>
        <div className="ghost-shot-switch" aria-label="Choose aiming route">
          {ghostAimingShots.map((shot) => (
            <button
              key={shot.id}
              type="button"
              className={shot.id === activeShot.id ? "active" : ""}
              style={{ "--shot-color": shot.pathColor }}
              disabled={isAnimating}
              onClick={() => {
                setActiveShotId(shot.id);
                setShotRun(0);
                setPlayMode("practice");
                setViewMode("broadcast");
                setPlaybackMode("idle");
                setShotOutcome(null);
              }}
            >
              <span />
              <b>{shot.label}</b>
              <em>{shot.value}</em>
            </button>
          ))}
        </div>
        <div className="ghost-view-switch" aria-label="Choose aiming view">
          <button
            type="button"
            className={viewMode === "broadcast" ? "active" : ""}
            disabled={isAnimating}
            onClick={() => setViewMode("broadcast")}
          >
            Broadcast
          </button>
          <button
            type="button"
            className={viewMode === "player" ? "active" : ""}
            disabled={isAnimating}
            onClick={() => {
              setViewMode("player");
              setShotRun(0);
              setPlaybackMode("idle");
              setShotOutcome(null);
            }}
          >
            Player
          </button>
        </div>
        <span>{activeShot.value}</span>
        <h4>{activeShot.label}</h4>
        <p>{activeShot.detail}</p>
        <div className="ghost-sim-controls">
          <label>
            <b>Aim angle</b>
            {playMode === "practice" ? (
              <em>{angleOffset > 0 ? "+" : ""}{angleOffset.toFixed(1)} deg</em>
            ) : null}
            <input
              aria-label="Aim angle"
              type="range"
              min="-18"
              max="18"
              step="0.1"
              value={angleOffset}
              disabled={isAnimating}
              onChange={(event) => {
                setAngleOffset(Number(event.target.value));
                setShotRun(0);
                setPlaybackMode("idle");
                setShotOutcome(null);
              }}
            />
          </label>
          {playMode === "practice" ? (
            <>
              <button
                type="button"
                disabled={isAnimating}
                onClick={() => {
                  setShotOutcome(null);
                  setPlaybackMode("practice-shot");
                  setShotRun((value) => value + 1);
                }}
              >
                {isAnimating ? "Shot in progress" : "Try shot with guides"}
              </button>
              <button
                type="button"
                disabled={isAnimating}
                onClick={() => {
                  setShotOutcome(null);
                  setPlayMode("real");
                  setViewMode("player");
                  setAngleOffset(activeShot.challengeOffset);
                  setPlaybackMode("idle");
                  setShotRun(0);
                }}
              >
                Enter real play
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={isAnimating}
                onClick={() => {
                  setShotOutcome(null);
                  setPlayMode("practice");
                  setPlaybackMode("idle");
                  setShotRun(0);
                }}
              >
                Back to practice
              </button>
              <button
                type="button"
                disabled={isAnimating}
                onClick={() => {
                  setShotOutcome(null);
                  setPlayMode("real");
                  setPlaybackMode("real-shot");
                  setShotRun((value) => value + 1);
                }}
              >
                {isAnimating ? "Shot in progress" : "Take shot"}
              </button>
            </>
          )}
        </div>
        <div className="table-tour-facts">
          {playMode === "practice" ? (
            <>
              <section>
                <b>Current contact</b>
                <em>{contactText}</em>
              </section>
              <section>
                <b>Result</b>
                <em>{currentSimulation.isPotted ? "Pot line is on" : currentSimulation.reachesObject ? "Hit, but not on the pocket line" : "No object-ball contact"}</em>
              </section>
            </>
          ) : (
            <section>
              <b>Challenge feedback</b>
              <em>Take the shot to reveal the result.</em>
            </section>
          )}
          {activeShot.facts.map(([label, value]) => (
            <section key={`${activeShot.id}-${label}`}>
              <b>{label}</b>
              <em>{value}</em>
            </section>
          ))}
        </div>
        <div className="ghost-legend">
          <i className="cue" />
          <b>Cue ball</b>
          <i className="ghost" />
          <b>Ghost ball</b>
          <i className="route" style={{ "--shot-color": activeShot.pathColor }} />
          <b>Object path</b>
        </div>
      </aside>
    </div>
  );
}
