import './style.css';
import * as THREE from 'three';

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


const init = ()=>{
  const renderer = createRender();
  document.body.appendChild(renderer.domElement);
  const scene = createScene();
  const camera = createCamera();
  renderer.render(scene,camera);
}

init();