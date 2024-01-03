import './style.css';
import * as THREE from 'three';
import VertexShader from './shaders/ground.vert';
import FragmentShader from './shaders/ground.frag';
import SkyVertexShader from './shaders/sky.vert';
import SkyFragmentShader from './shaders/sky.frag';
// import UpVertexShader from './shaders/up.vert';
// import UpFragmentShader from './shaders/up.frag';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { randomGaussian } from './utils/gaussian.utils';

const renderConfig = {
  get RENDER_WIDTH() { return window.innerWidth },
  get RENDER_HEIGHT() { return window.innerHeight },
  get RENDER_ASPECT() { return this.RENDER_WIDTH / this.RENDER_HEIGHT }
}

const createRender = () => {
  const render = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  render.setPixelRatio(window.devicePixelRatio);
  render.setSize(renderConfig.RENDER_WIDTH, renderConfig.RENDER_HEIGHT);

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
  const fov = THREE.MathUtils.radToDeg(2 * Math.atan(36 / 160));
  const _camera = camera ? camera : new THREE.PerspectiveCamera(fov, renderConfig.RENDER_ASPECT, 0.1, 2000);
  return _camera;
}

const createGroundParticle: () => [THREE.Points, THREE.ShaderMaterial] = () => {
  const width = 200;
  const height = 200;
  const groundGeometry = new THREE.PlaneGeometry(3, 3, width, height);
  groundGeometry.rotateX(Math.PI / 2);
  groundGeometry.rotateY(Math.PI / 4);
  const particleGeometry = new THREE.BufferGeometry();


  const total = groundGeometry.getAttribute("position").count;
  const indices = new Uint16Array(total);
  // const offsets = new Float32Array(total * 3);
  const size = new Float32Array(total);
  const angles = new Float32Array(total);
  const scales = new Float32Array(total);

  for (let i = 0, j = 0; i < total; i++) {
    size[i] = i;
    // offsets[j * 3 + 0] = i % width;
    // offsets[j * 3 + 1] = Math.floor(i / width);

    indices[j] = i;
    scales[i] = 1;
    angles[j] = j * Math.PI * 2 / total;

    j++;
  }

  particleGeometry.setAttribute('a_index', new THREE.BufferAttribute(indices, 1, false));
  // particleGeometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 3, false));
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(groundGeometry.getAttribute("position").array, 3));
  particleGeometry.setAttribute('a_size', new THREE.BufferAttribute(size, 1));
  particleGeometry.setAttribute('a_scale', new THREE.BufferAttribute(scales, 1));
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
    depthTest: true,
    transparent: true,
    wireframe: false
  })
  return [new THREE.Points(particleGeometry, particleMaterial), particleMaterial];
}

const createUpParticle: () => [THREE.Points, THREE.ShaderMaterial] = () => {
  const width = 30;
  const height = 30;
  const total = width * height;

  const points = new Float32Array(total * 3);
  const indices = new Uint16Array(total);
  const size = new Float32Array(total);
  const angles = new Float32Array(total);
  const scales = new Float32Array(total);

  for (let i = 0, j = 0; i < total; i++) {
    size[i] = i;
    points[j * 3] = randomGaussian(0, 1) * 0.1;
    points[j * 3 + 1] = 0;
    points[j * 3 + 2] = randomGaussian(0, 1) * 0.1;
    indices[j] = i;
    scales[i] = 1;
    angles[j] = j * Math.PI * 2 / total;
    j++;
  }


  const particleGeometry = new THREE.BufferGeometry();


  particleGeometry.setAttribute('a_index', new THREE.BufferAttribute(indices, 1, false));
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
  particleGeometry.setAttribute('a_size', new THREE.BufferAttribute(size, 1));
  particleGeometry.setAttribute('a_scale', new THREE.BufferAttribute(scales, 1));
  particleGeometry.setAttribute('angle', new THREE.BufferAttribute(angles, 1));


  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      'uTotal': { value: total },
      'uTime': { value: 0 }
    },
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    depthTest: true,
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
  groundParticles.position.set(0, 0, 0);
  const [upParticles, upMaterial] = createUpParticle();
  scene.add(upParticles);
  upParticles.position.set(0, 0, 0);
  const [outerSkyParticles, outerSkyMaterial] = createSkyParticle(0.5);
  scene.add(outerSkyParticles);
  outerSkyParticles.position.set(0.0, 1.2, 0.0);
  const [innerSkyParticles, innerSkyMaterial] = createSkyParticle(0.4);
  scene.add(innerSkyParticles);
  innerSkyParticles.position.set(0.0, 1.2, 0.0);
  camera.position.setX(0);
  camera.position.setZ(5.5);
  camera.position.setY(1.1);
  camera.lookAt(0, 1.1, 0);


  window.addEventListener("resize", () => {
    camera.aspect = renderConfig.RENDER_ASPECT;
    camera.updateProjectionMatrix();
    renderer.setSize(renderConfig.RENDER_WIDTH, renderConfig.RENDER_HEIGHT);
  })

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
    upMaterial.uniforms.uTime.value += delta;
    renderer.render(scene, camera);
    requestAnimationFrame(animate)
  }

  animate();

}

init();