import * as THREE from 'three';
import TouchTexture from './TouchTexture';
import VertexShader from '../../shaders/particle.vert';
import FragmentShader from '../../shaders/particle.frag';
import gsap from 'gsap';
import type WebGLViewer from '../viewer';

export default class Particles {

	private webgl: WebGLViewer
	private texture?: THREE.Texture
	private width: number = 0
	private height: number = 0
	private numPoints: number = 0
	private touch?: TouchTexture
	private hitArea?: THREE.Mesh
	private shaderMaterial?: THREE.RawShaderMaterial
	private object3D?: THREE.Mesh

	public container: THREE.Object3D


	constructor(webgl: WebGLViewer) {
		this.webgl = webgl;
		this.container = new THREE.Object3D();
	}

	// 加载图片纹理
	init(src: string) {
		const loader = new THREE.TextureLoader();

		loader.load(src, (texture) => {
			this.texture = texture;
			this.texture.minFilter = THREE.LinearFilter;
			this.texture.magFilter = THREE.LinearFilter;
			this.texture.format = THREE.RGBAFormat;

			this.width = texture.image.width;
			this.height = texture.image.height;

			this.initPoints(true);
			this.initHitArea();
			this.initTouch();
			this.resize();
			this.show();
		});
	}

	initPoints(discard: boolean) {
		if (!this.texture) return

		this.numPoints = this.width * this.height;

		let numVisible = this.numPoints;
		let threshold = 0;
		let originalColors: Float32Array = new Float32Array(0);

		if (discard) {
			// discard pixels darker than threshold #22
			numVisible = 0;
			threshold = 34;

			const img = this.texture.image;
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			if (!ctx) return;

			canvas.width = this.width;
			canvas.height = this.height;
			ctx.scale(1, -1);
			ctx.drawImage(img, 0, 0, this.width, this.height * -1);

			const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			originalColors = Float32Array.from(imgData.data);

			for (let i = 0; i < this.numPoints; i++) {
				if (originalColors[i * 4 + 0] > threshold) numVisible++;
			}

			// console.log('numVisible', numVisible, this.numPoints);
		}

		const uniforms = {
			uTime: { value: 0 },
			uRandom: { value: 1.0 },
			uDepth: { value: 2.0 },
			uSize: { value: 0.0 },
			uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
			uTexture: { value: this.texture },
			uTouch: { value: null },
		};

		this.shaderMaterial = new THREE.RawShaderMaterial({
			uniforms,
			vertexShader: VertexShader,
			fragmentShader: FragmentShader,
			depthTest: false,
			transparent: true,
			// wireframe:true
			// blending: THREE.AdditiveBlending
		});

		const geometry = new THREE.InstancedBufferGeometry();

		// positions
		const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
		positions.setXYZ(0, -0.5, 0.5, 0.0);
		positions.setXYZ(1, 0.5, 0.5, 0.0);
		positions.setXYZ(2, -0.5, -0.5, 0.0);
		positions.setXYZ(3, 0.5, -0.5, 0.0);
		geometry.setAttribute('position', positions);


		// uvs
		const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
		uvs.setXYZ(0, 0.0, 0.0, 1);
		uvs.setXYZ(1, 1.0, 0.0, 1);
		uvs.setXYZ(2, 0.0, 1.0, 1);
		uvs.setXYZ(3, 1.0, 1.0, 1);
		geometry.setAttribute('uv', uvs);

		// index
		geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1));

		const indices = new Uint16Array(numVisible);
		const offsets = new Float32Array(numVisible * 3);
		const angles = new Float32Array(numVisible);

		for (let i = 0, j = 0; i < this.numPoints; i++) {
			if (discard && originalColors[i * 4 + 0] <= threshold) continue;

			offsets[j * 3 + 0] = i % this.width;
			offsets[j * 3 + 1] = Math.floor(i / this.width);

			indices[j] = i;

			angles[j] = Math.random() * Math.PI;

			j++;
		}

		geometry.setAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
		geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
		geometry.setAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false));

		this.object3D = new THREE.Mesh(geometry, this.shaderMaterial);
		this.container.add(this.object3D);
	}

	initTouch() {
		// create only once
		if (!this.touch) this.touch = new TouchTexture();
		if (this.shaderMaterial) this.shaderMaterial.uniforms.uTouch.value = this.touch.texture;
	}

	initHitArea() {
		const geometry = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, depthTest: false });
		material.visible = false;
		this.hitArea = new THREE.Mesh(geometry, material);
		// this.container.add(this.hitArea);
	}

	addListeners() {
		if (!this.webgl) return;
		this.webgl.interactive?.addListener('interactive-move', (e) => this.onInteractiveMove(e));
		if (this.hitArea) this.webgl.interactive?.objects.push(this.hitArea);
		this.webgl.interactive?.enable();
	}

	removeListeners() {
		if (!this.webgl) return;
		this.webgl.interactive?.removeListener('interactive-move');
		const index = this.webgl.interactive?.objects.findIndex(obj => obj === this.hitArea);
		if (index) this.webgl.interactive?.objects.splice(index, 1);
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

		if (!this.hitArea) return;

		this.hitArea.parent?.remove(this.hitArea);
		this.hitArea.geometry.dispose();
		(this.hitArea.material as THREE.MeshBasicMaterial).dispose();
		this.hitArea = undefined;
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	resize() {
		const scale = this.webgl.fovHeight / this.height;
		this.object3D?.scale.set(scale, scale, 1);
		this.hitArea?.scale.set(scale, scale, 1);
	}

	onInteractiveMove(e: { intersectionData: THREE.Intersection }) {
		const uv = e.intersectionData.uv;
		if (this.touch && uv) this.touch.addTouch({ x: uv.x, y: uv.y, age: 0, force: 0 });
	}
}
