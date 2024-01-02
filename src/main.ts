import './style.css';
import * as THREE from 'three';
import VertexShader from './shaders/ground.vert';
import FragmentShader from './shaders/ground.frag';
import SkyVertexShader from './shaders/sky.vert';
import SkyFragmentShader from './shaders/sky.frag';
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

const createGroundParticle: () => [THREE.Points, THREE.ShaderMaterial] = () => {
  const width = 50;
  const height = 50;
  const groundGeometry = new THREE.PlaneGeometry(1, 1, width, height);
  const particleGeometry = new THREE.BufferGeometry();


  const total = groundGeometry.getAttribute("position").count;
  const indices = new Uint16Array(total);
  // const offsets = new Float32Array(total * 3);
  const size = new Float32Array(total);
  const angles = new Float32Array(total);

  for (let i = 0, j = 0; i < total; i++) {
    size[i] = i;
    // offsets[j * 3 + 0] = i % width;
    // offsets[j * 3 + 1] = Math.floor(i / width);

    indices[j] = i;

    angles[j] = j * Math.PI * 2 / total;

    j++;
  }

  particleGeometry.setAttribute('pindex', new THREE.BufferAttribute(indices, 1, false));
  // particleGeometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 3, false));
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(groundGeometry.getAttribute("position").array, 3));
  particleGeometry.setAttribute('a_size', new THREE.BufferAttribute(size, 1));
  particleGeometry.setAttribute('angle', new THREE.BufferAttribute(angles, 1));
  // particleGeometry.setAttribute('index', groundGeometry.getAttribute("index"));
  // particleGeometry.setAttribute('uv', new THREE.BufferAttribute(groundGeometry.getAttribute("uv").array, 1));

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      'uTotal': { value: total },
      'uTime': { value: 0 }
    },
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    depthTest: false,
    transparent: true,
    wireframe: false
  })
  return [new THREE.Points(particleGeometry, particleMaterial), particleMaterial];
}


const createSkyParticle: (radius: number) => [THREE.Points, THREE.ShaderMaterial] = (radius: number = 0.5) => {
  const width = 50;
  const height = 50;
  const skyGeometry = new THREE.SphereGeometry(radius, width, height);
  const particleGeometry = new THREE.BufferGeometry();

  const total = skyGeometry.getAttribute("position").count;
  const indices = new Uint16Array(total);
  // const offsets = new Float32Array(total * 3);
  const size = new Float32Array(total);
  // const angles = new Float32Array(numVisible);

  for (let i = 0, j = 0; i < total; i++) {
    size[i] = i;
    // offsets[j * 3 + 0] = i % width;
    // offsets[j * 3 + 1] = Math.floor(i / width);

    indices[j] = i;

    // angles[j] = Math.random() * Math.PI;

    j++;
  }

  particleGeometry.setAttribute('pindex', new THREE.BufferAttribute(indices, 1, false));
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(skyGeometry.getAttribute("position").array, 3));
  particleGeometry.setAttribute('a_size', new THREE.BufferAttribute(size, 1));

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      'uTotal': { value: total },
      'uTime': { value: 0 }
    },
    vertexShader: SkyVertexShader,
    fragmentShader: SkyFragmentShader,
    depthTest: false,
    transparent: true,
    wireframe: false
  })
  return [new THREE.Points(particleGeometry, particleMaterial), particleMaterial];
}


const init = () => {
  const renderer = createRender();
  document.body.appendChild(renderer.domElement);
  const scene = createScene();
  const camera = createCamera();
  const clock = new THREE.Clock();

  const [groundParticles, groundMaterial] = createGroundParticle();
  scene.add(groundParticles);
  groundParticles.position.set(0, 0, 0 - 0.5);
  const [outerSkyParticles, outerSkyMaterial] = createSkyParticle(0.5);
  scene.add(outerSkyParticles);
  outerSkyParticles.position.set(0, 0, 0.7 - 0.5);
  const [innerSkyParticles, innerSkyMaterial] = createSkyParticle(0.4);
  scene.add(innerSkyParticles);
  innerSkyParticles.position.set(0, 0, 0.7 - 0.5);
  camera.position.setX(0);
  camera.position.setZ(0);
  camera.position.setY(-5);
  camera.lookAt(0, 0, 0);


  const control = new OrbitControls(camera, renderer.domElement);
  control.addEventListener('change', () => {
    renderer.render(scene, camera)
  })

  renderer.render(scene, camera);

  const animate = () => {
    const delta = clock.getDelta()
    groundMaterial.uniforms.uTime.value += delta;
    outerSkyMaterial.uniforms.uTime.value += delta;
    innerSkyMaterial.uniforms.uTime.value += delta;
    renderer.render(scene, camera);
    requestAnimationFrame(animate)
  }

  animate();

}

init();