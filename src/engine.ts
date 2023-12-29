import WebGLViewer from './webgl/viewer';
// import GUIView from './gui/GUIView';

export default class Engine {

  private webgl?: WebGLViewer
  private raf?: number

  constructor() {

  }

  init() {
    this.initWebGL();
    this.initGUI();
    this.addListeners();
    this.animate();
    this.resize();
  }

  initWebGL() {
    this.webgl = new WebGLViewer(this);
    if (this.webgl.renderer) document.body.appendChild(this.webgl.renderer.domElement);
  }

  initGUI() {
    // this.gui = new GUIView(this);
  }

  addListeners() {
    window.addEventListener('resize', () => {
      if (this.webgl) this.webgl.resize();
    });
    window.addEventListener('keyup', (e) => {
      console.log(e.key);
      // if (e.key==="g") { if (this.gui) this.gui.toggle(); }
    });

    if (this.webgl?.renderer) {
      const el = this.webgl.renderer.domElement;
      el.addEventListener('click', () => {
        this.webgl?.next();
      });
    }

  }

  animate() {
    this.update();
    this.draw();
    this.raf = requestAnimationFrame(() => { this.animate() });
  }

  // ---------------------------------------------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------------------------------------------

  update() {
    // if (this.gui.stats) this.gui.stats.begin();
    if (this.webgl) this.webgl.update();
    // if (this.gui) this.gui.update();
  }

  draw() {
    if (this.webgl) this.webgl.draw();
    // if (this.gui.stats) this.gui.stats.end();
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  resize() {
    if (this.webgl) this.webgl.resize();
  }

}
