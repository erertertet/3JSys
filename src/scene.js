import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function initScene() {
  const canvas = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa); // light grey bg

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(2, 2, 5);

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Resize handling
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  // Load GLTF model
  const loader = new GLTFLoader();
  loader.load('/model/test-building.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(1, 1, 1); // Optional: scale if too big/small
    scene.add(model);
  }, undefined, (error) => {
    console.error('Error loading model:', error);
  });

  // Animate
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
