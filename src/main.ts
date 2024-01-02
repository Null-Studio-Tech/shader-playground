import './style.css';
import * as THREE from 'three';
import VertexShader from './shaders/ground.vert';
import FragmentShader from './shaders/ground.frag';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const renderConfig = {
  get RENDER_WIDTH() { return window.innerWidth },
  get RENDER_HEIGHT() { return window.innerHeight },
  get RENDER_ASPECT() { return this.RENDER_WIDTH / this.RENDER_HEIGHT }
}

const createRender = () => {
  const render = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  render.setPixelRatio(window.devicePixelRatio);
  render.setSize(renderConfig.RENDER_WIDTH, renderConfig.RENDER_HEIGHT);
  render.toneMapping = THREE.ACESFilmicToneMapping;
  render.toneMappingExposure = 1;
  window.addEventListener('resize', () => {
    console.log('render size', renderConfig.RENDER_WIDTH, renderConfig.RENDER_HEIGHT)
    render.setSize(renderConfig.RENDER_WIDTH, renderConfig.RENDER_HEIGHT)
    render.setPixelRatio(window.devicePixelRatio);
  });
  return render;
}

const createScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  return scene;
}

const createCamera = (camera?: THREE.PerspectiveCamera) => {
  const _camera = camera ? camera : new THREE.PerspectiveCamera(35, renderConfig.RENDER_ASPECT, 0.1, 2000);
  return _camera;
}


const init = () => {
  const renderer = createRender();
  document.body.appendChild(renderer.domElement);
  const scene = createScene();
  const camera = createCamera();
  const width = 20;
  const height = 20;
  const groundGeometry = new THREE.PlaneGeometry(1, 1, width, height);
  const particleGeometry = new THREE.BufferGeometry();
  const clock = new THREE.Clock();

  const total = groundGeometry.getAttribute("position").count;
  const indices = new Uint16Array(total);
  const offsets = new Float32Array(total * 3);
  const size = new Float32Array(total);
  // const angles = new Float32Array(numVisible);

  for (let i = 0, j = 0; i < total; i++) {
    size[i] = i;
    offsets[j * 3 + 0] = i % width;
    offsets[j * 3 + 1] = Math.floor(i / width);

    indices[j] = i;

    // angles[j] = Math.random() * Math.PI;

    j++;
  }

  particleGeometry.setAttribute('pindex', new THREE.BufferAttribute(indices, 1, false));
  // particleGeometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 3, false));
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(groundGeometry.getAttribute("position").array, 3));
  particleGeometry.setAttribute('a_size', new THREE.BufferAttribute(size, 1));
  // particleGeometry.setAttribute('index', groundGeometry.getAttribute("index"));
  // particleGeometry.setAttribute('uv', new THREE.BufferAttribute(groundGeometry.getAttribute("uv").array, 1));

  const pointMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      'uTotal': { value: total },
      'uTime': { value: clock.getDelta() }
    },
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    wireframe: false
  })
  const groundMesh = new THREE.Points(particleGeometry, particleMaterial);
  groundMesh.position.set(0, 0, 0);
  camera.position.setX(0);
  camera.position.setZ(2);
  camera.position.setY(0);
  // camera.lookAt(0, 0, 0);
  scene.add(groundMesh);

  const control = new OrbitControls(camera, renderer.domElement);
  control.addEventListener('change', () => {
    renderer.render(scene, camera)
  })

  renderer.render(scene, camera);

  const animate = () => {
    particleMaterial.uniforms.uTime.value += clock.getDelta();
    renderer.render(scene, camera);
    requestAnimationFrame(animate)
  }

  animate();

}

init();