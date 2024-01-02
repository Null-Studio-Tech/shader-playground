import * as THREE from 'three';
import TouchTexture from './TouchTexture';
import VertexShader from '../../shaders/ground.vert';
import FragmentShader from '../../shaders/ground.frag';
import gsap from 'gsap';
import type WebGLViewer from '../viewer';

export default class GroundParticles {

	private webgl: WebGLViewer
	// private texture?: THREE.Texture
	private width: number = 0
	private height: number = 0
	private touch?: TouchTexture
	private shaderMaterial?: THREE.ShaderMaterial
	private object3D?: THREE.Mesh

	public container: THREE.Object3D


	constructor(webgl: WebGLViewer) {
		this.webgl = webgl;
		this.container = new THREE.Object3D();
	}

	// 加载图片纹理
	init() {
		this.initPoints();
		this.initTouch();
		this.resize();
		this.show();
	}

	initPoints() {

		const uniforms = {
			uTime: { value: 0 },
			uRandom: { value: 1.0 },
			uDepth: { value: 2.0 },
			uSize: { value: 0.0 },
			uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
			// uTexture: { value: this.texture },
			uTouch: { value: null },
		};

		this.shaderMaterial = new THREE.ShaderMaterial({
			uniforms,
			vertexShader: VertexShader,
			fragmentShader: FragmentShader,
			depthTest: false,
			transparent: true,
			wireframe: true
			// blending: THREE.AdditiveBlending
		});

		
		const geometry = new THREE.PlaneGeometry(600, 600, 200, 200);
		// const geometry = new THREE.InstancedBufferGeometry();
		// geometry.setAttribute("positions", groundGeometry.attributes.positions);
		// geometry.setAttribute("index", groundGeometry.getAttribute("index"));
		// geometry.attributes = groundGeometry.attributes;

		this.object3D = new THREE.Mesh(geometry, this.shaderMaterial);
		this.container.add(this.object3D);
	}

	initTouch() {
		// create only once
		if (!this.touch) this.touch = new TouchTexture();
		if (this.shaderMaterial) this.shaderMaterial.uniforms.uTouch.value = this.touch.texture;
	}

	addListeners() {
		if (!this.webgl) return;
		this.webgl.interactive?.addListener('interactive-move', (e) => this.onInteractiveMove(e));
		this.webgl.interactive?.enable();
	}

	removeListeners() {
		if (!this.webgl) return;
		this.webgl.interactive?.removeListener('interactive-move');
		this.webgl.interactive?.disable();
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update(delta: number) {
		if (!this.object3D) return;
		if (this.touch) this.touch.update();

		if (this.shaderMaterial) this.shaderMaterial.uniforms.uTime.value += delta;
	}

	show(time = 1) {
		// reset
		if (!this.shaderMaterial) return;
		gsap.fromTo(this.shaderMaterial.uniforms.uSize, { value: 0.5 }, { value: 1., duration: time });
		gsap.to(this.shaderMaterial.uniforms.uRandom, { value: 2.0, duration: time });
		gsap.fromTo(this.shaderMaterial.uniforms.uDepth, { value: 40.0 }, { value: 4.0, duration: time * 1.5 });
		this.addListeners();
	}

	hide(_destroy: boolean, time = 0.8) {
		return new Promise((resolve, reject) => {
			if (!this.shaderMaterial) {
				reject();
				return;
			}
			gsap.to(this.shaderMaterial.uniforms.uRandom, {
				duration: time,
				value: 5.0,
				onComplete: () => {
					if (_destroy) this.destroy();
					resolve(true);
				}
			});
			gsap.to(this.shaderMaterial.uniforms.uDepth, { value: -20.0, ease: "power2.in", duration: time });
			gsap.to(this.shaderMaterial.uniforms.uSize, { value: 0.0, duration: time * 0.8 });
			this.removeListeners();
		});
	}

	destroy() {
		if (!this.object3D) return;

		this.object3D.parent?.remove(this.object3D);
		this.object3D.geometry.dispose();
		this.shaderMaterial?.dispose();
		this.object3D = undefined;
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	resize() {
		const scale = this.webgl.fovHeight / this.height;
		this.object3D?.scale.set(scale, scale, 1);
	}

	onInteractiveMove(e: { intersectionData: THREE.Intersection }) {
		const uv = e.intersectionData.uv;
		if (this.touch && uv) this.touch.addTouch({ x: uv.x, y: uv.y, age: 0, force: 0 });
	}
}
