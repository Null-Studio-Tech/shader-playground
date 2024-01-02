import * as THREE from 'three';
import InteractiveControls from './controls/InteractiveControls';
// import Particles from './particles/Particles';
import Particles from './particles/groundParticles';
import type Engine from '../engine';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default class WebGLViewer {

  private app: Engine
  private camera?: THREE.PerspectiveCamera
  private scene?: THREE.Scene
  private clock?: THREE.Clock
  private currSample: number | null = null

  public renderer?: THREE.WebGLRenderer
  public control?: OrbitControls
  public interactive?: InteractiveControls
  public particles?: Particles
  public samples: Array<string> = []
  public fovHeight: number = 1

  constructor(app: Engine) {
    this.app = app;

    this.samples = [
      'sample-01.png',
      'sample-02.png',
      'sample-03.png',
      'sample-04.png',
      'sample-05.png',
    ];

    this.initThree();
    this.initParticles();
    this.initControls();

    const rnd = ~~(Math.random() * this.samples.length);
    this.goto(rnd);
  }

  initThree() {
    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 300;

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    // clock
    this.clock = new THREE.Clock(true);

    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    this.control.addEventListener('change', () => {
      if (this.scene && this.camera) this.renderer?.render(this.scene, this.camera)
    })
    
  }

  initControls() {
    if (!this.camera) throw new Error('camera is null');
    if (!this.renderer?.domElement) throw new Error('renderer is null');
    this.interactive = new InteractiveControls(this.camera, this.renderer?.domElement);
  }

  initParticles() {
    debugger;
    this.particles = new Particles(this);
    this.scene?.add(this.particles.container);
  }

  // ---------------------------------------------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------------------------------------------

  update() {
    const delta = this.clock?.getDelta();
    if (this.particles) this.particles.update(delta || 0);
  }

  draw() {
    if (!this.renderer) return;
    if (!this.scene) return;
    if (!this.camera) return;
    this.renderer.render(this.scene, this.camera);
  }


  goto(index: number) {
    this.particles?.init();
    // // init next
    // if (this.currSample == null) this.particles?.init(this.samples[index]);
    // // hide curr then init next
    // else {
    //   this.particles?.hide(true).then(() => {
    //     this.particles?.init(this.samples[index]);
    //   });
    // }

    this.currSample = index;
  }

  next() {
    if (this.currSample !== null && this.currSample < this.samples.length - 1) this.goto(this.currSample + 1);
    else this.goto(0);
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  resize() {
    if (!this.renderer) return;
    if (!this.camera) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.fovHeight = 2 * Math.tan((this.camera.fov * Math.PI) / 180 / 2) * this.camera.position.z;

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.interactive) this.interactive.resize();
    if (this.particles) this.particles.resize();
  }
}
