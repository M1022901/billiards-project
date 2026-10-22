import * as THREE from "three";
import { poolBallColors } from "./tableGeometry.js";

export function createPoolBallTexture(number) {
  const color = poolBallColors[number] || "#111827";
  const isStripe = number >= 9;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  context.fillStyle = "#f8fafc";
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (number === 8) {
    context.fillStyle = "#111827";
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else if (isStripe) {
    context.fillStyle = color;
    context.fillRect(0, 38, canvas.width, 52);
  } else {
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.fillStyle = "#f8fafc";
  context.beginPath();
  context.arc(128, 64, 32, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(15, 23, 42, 0.28)";
  context.lineWidth = 3;
  context.stroke();

  context.fillStyle = "#111827";
  context.font = "bold 34px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(number), 128, 66);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createTextSprite(text, color = "#f8fafc") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(15, 23, 42, 0.78)";
  context.strokeStyle = "rgba(255, 255, 255, 0.28)";
  context.lineWidth = 4;
  context.beginPath();
  if (context.roundRect) {
    context.roundRect(18, 28, 476, 92, 16);
  } else {
    context.rect(18, 28, 476, 92);
  }
  context.fill();
  context.stroke();
  context.fillStyle = color;
  context.font = "700 42px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 256, 76);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.52, 0.162, 1);
  sprite.userData.texture = texture;
  return sprite;
}
