import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  eightBallRackPositions,
  layoutMetrics,
  nineBallRackPositions,
  poolBallColors,
  snookerBaulkX,
  snookerBlackX,
  snookerDRadius,
  snookerFeltTopY,
  snookerHalfLength,
  snookerPinkX,
  snookerRedApexX,
  snookerRedPositions,
} from "../lib/tableGeometry.js";
import { createPoolBallTexture } from "../lib/threeHelpers.js";
import { tableTourLayouts } from "../data/tableTourData.js";

export default function TableTourDemo() {
  const mountRef = useRef(null);
  const selectionApiRef = useRef(null);
  const [activeLayoutId, setActiveLayoutId] = useState(tableTourLayouts[0].id);
  const activeLayout = tableTourLayouts.find((layout) => layout.id === activeLayoutId) || tableTourLayouts[0];
  const [activeItem, setActiveItem] = useState(activeLayout.defaultItem);

  useEffect(() => {
    setActiveItem(activeLayout.defaultItem);
  }, [activeLayout]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b1713");

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 5.2, 5.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 0.035;
    const pointer = new THREE.Vector2();
    const interactiveObjects = [];
    const activeMaterials = new Map();
    const hoverTargets = new Map();
    const selectableTargets = new Map();
    let hoveredObject = null;
    const selectedObjects = new Set();

    const tableGroup = new THREE.Group();
    scene.add(tableGroup);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.15;
    controls.maxDistance = 9.4;
    controls.minPolarAngle = 0.32;
    controls.maxPolarAngle = 1.18;
    controls.target.set(0, 0.05, 0);
    controls.update();

    scene.add(new THREE.HemisphereLight("#ffffff", "#10342d", 1.25));
    const keyLight = new THREE.DirectionalLight("#ffffff", 1.35);
    keyLight.position.set(-3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const hoverMaterials = [];
    const hoverGeometries = [];
    const tableGeometries = [];
    const generatedTextures = [];
    const metrics = layoutMetrics(activeLayout.id);
    const trackGeometry = (geometry) => {
      tableGeometries.push(geometry);
      return geometry;
    };

    const felt = new THREE.Mesh(
      new THREE.BoxGeometry(metrics.length, 0.12, metrics.width),
      new THREE.MeshStandardMaterial({ color: activeLayout.feltColor, roughness: 0.86 })
    );
    felt.receiveShadow = true;
    tableGroup.add(felt);

    const railMaterial = new THREE.MeshStandardMaterial({ color: "#4a2415", roughness: 0.6 });
    const cushionMaterial = new THREE.MeshStandardMaterial({ color: "#0f7a2e", roughness: 0.82 });
    const railThickness = 0.22;
    [
      { position: [0, 0.14, -metrics.halfWidth - railThickness / 2], scale: [metrics.length + railThickness, 0.22, railThickness] },
      { position: [0, 0.14, metrics.halfWidth + railThickness / 2], scale: [metrics.length + railThickness, 0.22, railThickness] },
      { position: [-metrics.halfLength - railThickness / 2, 0.14, 0], scale: [railThickness, 0.22, metrics.width] },
      { position: [metrics.halfLength + railThickness / 2, 0.14, 0], scale: [railThickness, 0.22, metrics.width] },
    ].forEach((rail) => {
      const mesh = new THREE.Mesh(trackGeometry(new THREE.BoxGeometry(...rail.scale)), railMaterial);
      mesh.position.set(...rail.position);
      mesh.castShadow = true;
      tableGroup.add(mesh);
    });
    [
      [-metrics.halfLength - railThickness / 2, -metrics.halfWidth - railThickness / 2],
      [metrics.halfLength + railThickness / 2, -metrics.halfWidth - railThickness / 2],
      [-metrics.halfLength - railThickness / 2, metrics.halfWidth + railThickness / 2],
      [metrics.halfLength + railThickness / 2, metrics.halfWidth + railThickness / 2],
    ].forEach(([x, z]) => {
      const cap = new THREE.Mesh(trackGeometry(new THREE.CylinderGeometry(railThickness / 2, railThickness / 2, 0.22, 32)), railMaterial);
      cap.rotation.x = Math.PI / 2;
      cap.position.set(x, 0.14, z);
      cap.castShadow = true;
      tableGroup.add(cap);
    });

    const cushionWidth = activeLayout.id === "snooker" ? 0.25 : 0.22;
    const cushionHeight = activeLayout.id === "snooker" ? 0.16 : 0.14;
    const pocketRadius = activeLayout.id === "snooker" ? 0.22 : 0.21;
    const cornerPocketGap = pocketRadius * 1.7;
    const middlePocketGap = pocketRadius * 1.84;
    const longSegment = (metrics.length - cornerPocketGap * 2 - middlePocketGap) / 2;
    const shortSegment = metrics.width - cornerPocketGap * 2;
    const makeRoundedCushionGeometry = (length, width, radius) => {
      const halfLength = length / 2;
      const halfWidth = width / 2;
      const endRadius = Math.min(radius, halfWidth, halfLength);
      const shape = new THREE.Shape();
      shape.moveTo(-halfLength + endRadius, -halfWidth);
      shape.lineTo(halfLength - endRadius, -halfWidth);
      shape.quadraticCurveTo(halfLength, -halfWidth, halfLength, -halfWidth + endRadius);
      shape.lineTo(halfLength, halfWidth - endRadius);
      shape.quadraticCurveTo(halfLength, halfWidth, halfLength - endRadius, halfWidth);
      shape.lineTo(-halfLength + endRadius, halfWidth);
      shape.quadraticCurveTo(-halfLength, halfWidth, -halfLength, halfWidth - endRadius);
      shape.lineTo(-halfLength, -halfWidth + endRadius);
      shape.quadraticCurveTo(-halfLength, -halfWidth, -halfLength + endRadius, -halfWidth);
      return trackGeometry(
        new THREE.ExtrudeGeometry(shape, {
          depth: cushionHeight,
          bevelEnabled: true,
          bevelThickness: 0.018,
          bevelSize: 0.018,
          bevelSegments: 5,
          curveSegments: 24,
        })
      );
    };
    const addCushion = ({ position, length, width, rotation = 0 }) => {
      const mesh = new THREE.Mesh(makeRoundedCushionGeometry(length, width, width / 2), cushionMaterial);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = rotation;
      mesh.position.set(...position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      tableGroup.add(mesh);
    };
    const cushionY = snookerFeltTopY + 0.025;
    const longLeftCenter = -metrics.halfLength + cornerPocketGap + longSegment / 2;
    const longRightCenter = metrics.halfLength - cornerPocketGap - longSegment / 2;
    [
      { position: [longLeftCenter, cushionY, -metrics.halfWidth + cushionWidth / 2], length: longSegment, width: cushionWidth },
      { position: [longRightCenter, cushionY, -metrics.halfWidth + cushionWidth / 2], length: longSegment, width: cushionWidth },
      { position: [longLeftCenter, cushionY, metrics.halfWidth - cushionWidth / 2], length: longSegment, width: cushionWidth },
      { position: [longRightCenter, cushionY, metrics.halfWidth - cushionWidth / 2], length: longSegment, width: cushionWidth },
      { position: [-metrics.halfLength + cushionWidth / 2, cushionY, 0], length: shortSegment, width: cushionWidth, rotation: Math.PI / 2 },
      { position: [metrics.halfLength - cushionWidth / 2, cushionY, 0], length: shortSegment, width: cushionWidth, rotation: Math.PI / 2 },
    ].forEach(addCushion);

    const pocketMaterial = new THREE.MeshBasicMaterial({
      color: "#050608",
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true,
    });
    const pocketGeometry = trackGeometry(new THREE.CircleGeometry(pocketRadius, 64));
    const pocketPositions = [
      { center: [-metrics.halfLength, -metrics.halfWidth] },
      { center: [0, -metrics.halfWidth] },
      { center: [metrics.halfLength, -metrics.halfWidth] },
      { center: [-metrics.halfLength, metrics.halfWidth] },
      { center: [0, metrics.halfWidth] },
      { center: [metrics.halfLength, metrics.halfWidth] },
    ];
    pocketPositions.forEach(({ center }) => {
      const [pocketX, pocketZ] = center;
      const pocket = new THREE.Mesh(pocketGeometry, pocketMaterial);
      pocket.rotation.x = -Math.PI / 2;
      pocket.position.set(pocketX, snookerFeltTopY + 0.014, pocketZ);
      pocket.renderOrder = 8;
      pocket.userData = activeLayout.items.find((item) => item.id === "pockets");
      tableGroup.add(pocket);

      interactiveObjects.push(pocket);
      hoverTargets.set(pocket.uuid, {
        object: pocket,
        originalScale: pocket.scale.clone(),
        apply: () => pocket.scale.setScalar(1.18),
        reset: () => pocket.scale.copy(hoverTargets.get(pocket.uuid).originalScale),
      });
      selectableTargets.set(pocket.uuid, {
        apply: () => pocket.scale.setScalar(1.3),
        reset: () => pocket.scale.copy(hoverTargets.get(pocket.uuid).originalScale),
      });
    });

    const lineMaterial = new THREE.LineBasicMaterial({ color: "#dbeafe", transparent: true, opacity: 0.95 });
    const guideMaterial = new THREE.LineBasicMaterial({ color: "#fef3c7", transparent: true, opacity: 0.82 });
    const pinkGuideMaterial = new THREE.LineBasicMaterial({ color: "#f9a8d4", transparent: true, opacity: 0.92 });
    const redTriangleMaterial = new THREE.LineBasicMaterial({ color: "#fecaca", transparent: true, opacity: 0.88 });
    const makeGuideLine = (points, material = guideMaterial, item = null) => {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
      if (item) {
        line.userData = item;
        interactiveObjects.push(line);
      }
      tableGroup.add(line);
      return line;
    };

    const baulkLine = makeGuideLine(
      [
        new THREE.Vector3(metrics.headLineX, 0.24, -metrics.halfWidth * 0.92),
        new THREE.Vector3(metrics.headLineX, 0.24, metrics.halfWidth * 0.92),
      ],
      lineMaterial
    );
    baulkLine.userData = activeLayout.items.find((item) => item.id === "baulk-line" || item.id.endsWith("head-string"));
    interactiveObjects.push(baulkLine);

    const makeHoverZone = (shape, item, color = "#38bdf8") => {
      if (!item) return null;
      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const zone = new THREE.Mesh(geometry, material);
      zone.rotation.x = -Math.PI / 2;
      zone.position.y = 0.251;
      zone.userData = item;
      tableGroup.add(zone);
      interactiveObjects.push(zone);
      hoverGeometries.push(geometry);
      hoverMaterials.push(material);
      hoverTargets.set(zone.uuid, {
        object: zone,
        material,
        apply: () => {
          material.opacity = 0.28;
        },
        reset: () => {
          material.opacity = 0;
        },
      });
      selectableTargets.set(zone.uuid, {
        apply: () => {
          material.opacity = 0.38;
        },
        reset: () => {
          material.opacity = 0;
        },
      });
      return zone;
    };

    const isSelectedObject = (object) => selectedObjects.has(object.uuid);
    const resetSelectedObjects = () => {
      selectedObjects.forEach((uuid) => selectableTargets.get(uuid)?.reset());
      selectedObjects.clear();
    };
    const applySelectionById = (itemId) => {
      resetSelectedObjects();
      interactiveObjects
        .filter((object) => object.userData?.id === itemId)
        .forEach((object) => {
          selectedObjects.add(object.uuid);
          selectableTargets.get(object.uuid)?.apply();
        });
    };

    if (activeLayout.id === "snooker") {
      const dCurve = new THREE.EllipseCurve(snookerBaulkX, 0, snookerDRadius, snookerDRadius, Math.PI / 2, Math.PI * 1.5, false);
      const dPoints = dCurve.getPoints(48).map((point) => new THREE.Vector3(point.x, 0.245, point.y));
      const dLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(dPoints), lineMaterial);
      dLine.userData = activeLayout.items.find((item) => item.id === "d-zone");
      tableGroup.add(dLine);
      interactiveObjects.push(dLine);

      const dShape = new THREE.Shape();
      dShape.moveTo(snookerBaulkX, -snookerDRadius);
      for (let index = 0; index <= 48; index += 1) {
        const angle = -Math.PI / 2 - (Math.PI * index) / 48;
        dShape.lineTo(snookerBaulkX + Math.cos(angle) * snookerDRadius, Math.sin(angle) * snookerDRadius);
      }
      dShape.lineTo(snookerBaulkX, -snookerDRadius);
      makeHoverZone(dShape, activeLayout.items.find((item) => item.id === "d-zone"), "#38bdf8");
    }

    const baulkShape = new THREE.Shape();
    baulkShape.moveTo(metrics.headLineX - 0.035, -metrics.halfWidth * 0.92);
    baulkShape.lineTo(metrics.headLineX + 0.035, -metrics.halfWidth * 0.92);
    baulkShape.lineTo(metrics.headLineX + 0.035, metrics.halfWidth * 0.92);
    baulkShape.lineTo(metrics.headLineX - 0.035, metrics.halfWidth * 0.92);
    baulkShape.lineTo(metrics.headLineX - 0.035, -metrics.halfWidth * 0.92);
    makeHoverZone(baulkShape, activeLayout.items.find((item) => item.id === "baulk-line" || item.id.endsWith("head-string")), "#e5e7eb");

    makeGuideLine([
      new THREE.Vector3(-metrics.halfLength * 0.96, 0.235, 0),
      new THREE.Vector3(metrics.halfLength * 0.96, 0.235, 0),
    ]);

    if (activeLayout.id === "snooker") {
      makeGuideLine([
        new THREE.Vector3(0, 0.255, 0),
        new THREE.Vector3(snookerHalfLength, 0.255, 0),
      ], pinkGuideMaterial, activeLayout.items.find((item) => item.id === "pink-guide"));
      makeGuideLine([
        new THREE.Vector3(snookerPinkX, 0.27, 0),
        new THREE.Vector3(snookerRedApexX, 0.27, 0),
      ], pinkGuideMaterial, activeLayout.items.find((item) => item.id === "pink-guide"));
      makeGuideLine([
        new THREE.Vector3(snookerRedApexX, 0.265, 0),
        new THREE.Vector3(snookerRedPositions[10][0], 0.265, snookerRedPositions[10][2]),
        new THREE.Vector3(snookerRedPositions[14][0], 0.265, snookerRedPositions[14][2]),
        new THREE.Vector3(snookerRedApexX, 0.265, 0),
      ], redTriangleMaterial, activeLayout.items.find((item) => item.id === "red-pack"));
    } else if (activeLayout.id === "eight-ball") {
      makeGuideLine([
        new THREE.Vector3(eightBallRackPositions[0][0], 0.265, 0),
        new THREE.Vector3(eightBallRackPositions[10][0], 0.265, eightBallRackPositions[10][2]),
        new THREE.Vector3(eightBallRackPositions[14][0], 0.265, eightBallRackPositions[14][2]),
        new THREE.Vector3(eightBallRackPositions[0][0], 0.265, 0),
      ], redTriangleMaterial, activeLayout.items.find((item) => item.id === "eight-rack"));
    } else {
      makeGuideLine([
        new THREE.Vector3(nineBallRackPositions[0][0], 0.265, 0),
        new THREE.Vector3(nineBallRackPositions[4][0], 0.265, nineBallRackPositions[4][2]),
        new THREE.Vector3(nineBallRackPositions[8][0], 0.265, 0),
        new THREE.Vector3(nineBallRackPositions[4][0], 0.265, nineBallRackPositions[4][2] * -1),
        new THREE.Vector3(nineBallRackPositions[0][0], 0.265, 0),
      ], pinkGuideMaterial, activeLayout.items.find((item) => item.id === "nine-rack"));
    }

    const spotGeometry = new THREE.RingGeometry(metrics.ballRadius * 1.2, metrics.ballRadius * 1.42, 36);
    const spotMaterial = new THREE.MeshBasicMaterial({ color: "#f8fafc", transparent: true, opacity: 0.78, side: THREE.DoubleSide });
    [
      [metrics.headLineX, 0],
      ...(activeLayout.id === "snooker" ? [[0, 0]] : []),
      [activeLayout.id === "nine-ball" ? nineBallRackPositions[0][0] : activeLayout.id === "eight-ball" ? eightBallRackPositions[0][0] : snookerPinkX, 0],
      ...(activeLayout.id === "snooker" ? [[snookerBlackX, 0]] : []),
    ].forEach(([x, z]) => {
      const spot = new THREE.Mesh(spotGeometry, spotMaterial);
      spot.rotation.x = -Math.PI / 2;
      spot.position.set(x, 0.231, z);
      tableGroup.add(spot);
    });

    const ballGeometry = new THREE.SphereGeometry(metrics.ballRadius, 32, 16);
    const makeBall = (item, positionOffset = [0, 0, 0]) => {
      const texture = item.textureNumber ? createPoolBallTexture(item.textureNumber) : null;
      if (texture) generatedTextures.push(texture);
      const material = new THREE.MeshStandardMaterial({
        color: texture ? "#ffffff" : item.color,
        map: texture,
        roughness: 0.42,
        metalness: 0.02,
      });
      const ball = new THREE.Mesh(ballGeometry, material);
      ball.position.set(
        item.position[0] + positionOffset[0],
        item.position[1] + positionOffset[1],
        item.position[2] + positionOffset[2]
      );
      ball.castShadow = true;
      ball.userData = item;
      tableGroup.add(ball);
      interactiveObjects.push(ball);
      activeMaterials.set(ball.uuid, material);
      hoverTargets.set(ball.uuid, {
        object: ball,
        originalEmissive: material.emissive.clone(),
        originalScale: ball.scale.clone(),
        apply: () => {
          material.emissive.set("#ffffff");
          material.emissiveIntensity = 0.18;
          ball.scale.setScalar(1.16);
        },
        reset: () => {
          material.emissive.copy(hoverTargets.get(ball.uuid).originalEmissive);
          material.emissiveIntensity = 0;
          ball.scale.copy(hoverTargets.get(ball.uuid).originalScale);
        },
      });
      selectableTargets.set(ball.uuid, {
        apply: () => {
          material.emissive.set("#facc15");
          material.emissiveIntensity = 0.65;
          ball.scale.setScalar(1.22);
        },
        reset: () => {
          material.emissive.copy(hoverTargets.get(ball.uuid).originalEmissive);
          material.emissiveIntensity = 0;
          ball.scale.copy(hoverTargets.get(ball.uuid).originalScale);
        },
      });
      return ball;
    };

    const drawNumberedBall = (item, number, position, options = {}) =>
      makeBall(
        {
          ...item,
          label: options.label || `${number} ball`,
          value: options.value || (number === 8 ? "8 ball" : number >= 9 ? "Stripe ball" : "Solid ball"),
          detail: options.detail || item.detail,
          color: poolBallColors[number],
          textureNumber: number,
        },
        [position[0] - item.position[0], 0, position[2] - item.position[2]]
      );

    if (activeLayout.id === "snooker") {
      activeLayout.items.filter((item) => item.type === "ball" && item.id !== "red-pack").forEach((item) => makeBall(item));

      const redItem = activeLayout.items.find((item) => item.id === "red-pack");
      snookerRedPositions.forEach((position, index) => makeBall({ ...redItem, label: `Red ${index + 1}` }, [
        position[0] - redItem.position[0],
        0,
        position[2] - redItem.position[2],
      ]));
    } else if (activeLayout.id === "eight-ball") {
      activeLayout.items.filter((item) => item.type === "ball" && item.id !== "eight-rack").forEach((item) => makeBall(item));
      const rackItem = activeLayout.items.find((item) => item.id === "eight-rack");
      const rackNumbers = [1, 11, 4, 14, 8, 6, 10, 3, 13, 2, 7, 12, 5, 9, 15];
      eightBallRackPositions.forEach((position, index) =>
        drawNumberedBall(rackItem, rackNumbers[index], position, {
          label: rackNumbers[index] === 8 ? "8 ball" : rackNumbers[index] >= 9 ? `Stripe ${rackNumbers[index]}` : `Solid ${rackNumbers[index]}`,
        })
      );
    } else {
      activeLayout.items.filter((item) => item.type === "ball" && item.id !== "nine-rack").forEach((item) => makeBall(item));
      const rackItem = activeLayout.items.find((item) => item.id === "nine-rack");
      const rackNumbers = [1, 2, 3, 4, 9, 5, 6, 7, 8];
      nineBallRackPositions.forEach((position, index) =>
        drawNumberedBall(rackItem, rackNumbers[index], position, {
          label: rackNumbers[index] === 9 ? "9 ball" : `${rackNumbers[index]} ball`,
          value: rackNumbers[index] === 9 ? "Winning ball" : "Numbered object ball",
        })
      );
    }

    applySelectionById(activeItem.id);
    const selectionApi = { applySelectionById };
    selectionApiRef.current = selectionApi;

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const setPointerFromEvent = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pick = (event, commit = false) => {
      setPointerFromEvent(event);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactiveObjects, false);
      const nextHover = hits[0]?.object || null;
      if (hoveredObject && hoveredObject !== nextHover) {
        if (!isSelectedObject(hoveredObject)) hoverTargets.get(hoveredObject.uuid)?.reset();
      }
      if (nextHover && hoveredObject !== nextHover && !isSelectedObject(nextHover)) {
        hoverTargets.get(nextHover.uuid)?.apply();
      }
      hoveredObject = nextHover;
      renderer.domElement.style.cursor = nextHover ? "pointer" : "default";
      if (commit && hits[0]?.object?.userData?.label) {
        if (hoveredObject && hoveredObject !== hits[0].object && !isSelectedObject(hoveredObject)) {
          hoverTargets.get(hoveredObject.uuid)?.reset();
        }
        applySelectionById(hits[0].object.userData.id);
        setActiveItem(hits[0].object.userData);
      }
    };

    const handleClick = (event) => pick(event, true);
    const handlePointerMove = (event) => pick(event, false);
    const handlePointerLeave = () => {
      if (hoveredObject) {
        if (!isSelectedObject(hoveredObject)) hoverTargets.get(hoveredObject.uuid)?.reset();
        hoveredObject = null;
      }
      renderer.domElement.style.cursor = "default";
    };
    renderer.domElement.addEventListener("click", handleClick);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", resize);
    resize();

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (selectionApiRef.current === selectionApi) {
        selectionApiRef.current = null;
      }
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      activeMaterials.forEach((material) => material.dispose());
      generatedTextures.forEach((texture) => texture.dispose());
      hoverGeometries.forEach((geometry) => geometry.dispose());
      tableGeometries.forEach((geometry) => geometry.dispose());
      hoverMaterials.forEach((material) => material.dispose());
      ballGeometry.dispose();
      felt.geometry.dispose();
      felt.material.dispose();
      spotGeometry.dispose();
      spotMaterial.dispose();
      railMaterial.dispose();
      cushionMaterial.dispose();
      pocketMaterial.dispose();
      lineMaterial.dispose();
      guideMaterial.dispose();
      pinkGuideMaterial.dispose();
      redTriangleMaterial.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, [activeLayout]);

  useEffect(() => {
    selectionApiRef.current?.applySelectionById(activeItem.id);
  }, [activeItem.id]);

  return (
    <div className="table-tour-demo">
      <div ref={mountRef} className="table-tour-canvas" aria-label="Interactive 3D snooker table" />
      <aside className="table-tour-info">
        <div className="table-layout-switch" aria-label="Choose table layout">
          {tableTourLayouts.map((layout) => (
            <button
              key={layout.id}
              type="button"
              className={layout.id === activeLayout.id ? "active" : ""}
              onClick={() => setActiveLayoutId(layout.id)}
            >
              {layout.label}
            </button>
          ))}
        </div>
        <span>{activeItem.value}</span>
        <h4>{activeItem.label}</h4>
        <p>{activeItem.detail}</p>
        {activeItem.facts?.length ? (
          <div className="table-tour-facts">
            {activeItem.facts.map(([label, value]) => (
              <section key={`${activeItem.id || activeItem.label}-${label}`}>
                <b>{label}</b>
                <em>{value}</em>
              </section>
            ))}
          </div>
        ) : null}
        <p className="table-tour-control-note">Drag to rotate. Scroll or pinch to zoom. Click a ball or marked area for details.</p>
        <div className="table-tour-hints">
          {activeLayout.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeItem.id ? "active" : ""}
              aria-pressed={item.id === activeItem.id}
              onClick={() => setActiveItem(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
