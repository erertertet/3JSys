import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json';

let scene, camera, renderer, controls;
let composer, outlinePass;
let textMesh, cubeMesh;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isHovering = false;

export default function initScene() {
  const canvas = document.getElementById('three-canvas');

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x555555);

  // Camera
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Lighting
  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);

  // Font + initial text
  const font = new FontLoader().parse(helvetiker);
  createTextMesh(font, 'Hello');

  // Postprocessing pipeline
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
  outlinePass.edgeStrength = 10;               // crisp strength
  outlinePass.edgeGlow = 0;                    // no blur = sharp
  outlinePass.edgeThickness = 1.5;             // thickness of outline
  outlinePass.visibleEdgeColor.set('#FFFFFF'); // white outline
  outlinePass.hiddenEdgeColor.set('#000000');
  composer.addPass(outlinePass);

  // Events
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('click', onClick);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();

  // Expose for Vue binding
  window.update3DText = (newText) => {
    updateText(newText, font);
  };
}

function createTextMesh(font, text) {
  // Cleanup previous
  if (textMesh) {
    scene.remove(textMesh);
    outlinePass.selectedObjects = [];
  }
  if (cubeMesh) {
    scene.remove(cubeMesh);
  }

  const geometry = new TextGeometry(text, {
    font: font,
    size: 1,
    depth: 0.1,
    curveSegments: 12,
    bevelEnabled: false
  });

  geometry.computeBoundingBox();
  geometry.center();

  const material = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    roughness: 0.5,
    metalness: 0.3
  });

  textMesh = new THREE.Mesh(geometry, material);
  textMesh.position.z = 0.05; // slightly forward from cube

  // Cube behind the text
  const cubeGeo = new THREE.BoxGeometry(3.5, 2, 0.2);
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
  cubeMesh.position.set(0, 0, -0.15);

  scene.add(cubeMesh);
  scene.add(textMesh);
}

function updateText(newText, font) {
  createTextMesh(font, newText);
}

function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const firstHit = intersects[0]?.object;

  if (firstHit === textMesh) {
    window.dispatchEvent(new CustomEvent('three-clicked'));
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const firstHit = intersects[0]?.object;

  if (firstHit === textMesh) {
    if (!isHovering) {
      isHovering = true;
      outlinePass.selectedObjects = [textMesh];
    }
    renderer.domElement.style.cursor = 'pointer'; // show clickable cursor
  } else {
    if (isHovering) {
      isHovering = false;
      outlinePass.selectedObjects = [];
    }
    renderer.domElement.style.cursor = 'default';
  }

  composer.render();
}
