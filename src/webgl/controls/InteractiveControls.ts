import EventEmitter from 'eventemitter3';
import * as THREE from 'three';
import Browser from 'bowser';

export default class InteractiveControls extends EventEmitter {

	private camera: THREE.Camera
	private el: HTMLElement | Window
	private plane: THREE.Plane
	private raycaster: THREE.Raycaster
	private mouse: THREE.Vector2
	private offset: THREE.Vector3
	private intersection: THREE.Vector3
	private hovered: THREE.Object3D | null
	private selected: THREE.Object3D | null
	private intersectionData: THREE.Intersection | null
	private rect: { x: number, y: number, width: number, height: number } = { x: 0, y: 0, width: 0, height: 0 }
	private _enabled: boolean = false
	private isDown: boolean
	private handlerDown = this.onDown.bind(this);
	private handlerMove = this.onMove.bind(this);
	private handlerUp = this.onUp.bind(this);
	private handlerLeave = this.onLeave.bind(this);

	public browser: Browser.Parser.ParsedResult
	public objects: Array<THREE.Object3D>

	get enabled() { return this._enabled; }

	constructor(camera: THREE.Camera, el: HTMLElement) {
		super();

		this.camera = camera;
		this.el = el || window;

		this.plane = new THREE.Plane();
		this.raycaster = new THREE.Raycaster();

		this.mouse = new THREE.Vector2();
		this.offset = new THREE.Vector3();
		this.intersection = new THREE.Vector3();

		this.objects = [];
		this.hovered = null;
		this.selected = null;
		this.intersectionData = null;

		this.isDown = false;

		this.browser = Browser.parse(window.navigator.userAgent);

		this.enable();
	}

	enable() {
		if (this.enabled) return;
		this.addListeners();
		this._enabled = true;
	}

	disable() {
		if (!this.enabled) return;
		this.removeListeners();
		this._enabled = false;
	}

	addListeners() {
		// this.handlerDown = this.onDown.bind(this);
		// this.handlerMove = this.onMove.bind(this);
		// this.handlerUp = this.onUp.bind(this);
		// this.handlerLeave = this.onLeave.bind(this);

		if (this.browser.platform.type === "mobile") {
			this.el.addEventListener('touchstart', this.handlerDown, { passive: true });
			this.el.addEventListener('touchmove', this.handlerMove, { passive: true });
			this.el.addEventListener('touchend', this.handlerUp, { passive: true });
		}
		else {
			this.el.addEventListener('mousedown', this.handlerDown, { passive: true });
			this.el.addEventListener('mousemove', this.handlerMove, { passive: true });
			this.el.addEventListener('mouseup', this.handlerUp, { passive: true });
			this.el.addEventListener('mouseleave', this.handlerLeave, { passive: true });
		}
	}

	removeListeners() {
		if (this.browser.platform.type === "mobile") {
			this.el.removeEventListener('touchstart',this.handlerDown);
			this.el.removeEventListener('touchmove', this.handlerMove);
			this.el.removeEventListener('touchend', this.handlerUp);
		}
		else {
			this.el.removeEventListener('mousedown', this.handlerDown);
			this.el.removeEventListener('mousemove', this.handlerMove);
			this.el.removeEventListener('mouseup', this.handlerUp);
			this.el.removeEventListener('mouseleave', this.handlerLeave);
		}
	}

	resize(x?: number, y?: number, width?: number, height?: number) {
		if (x || y || width || height) {
			this.rect = { x: x || 0, y: y || 0, width: width || 0, height: height || 0 };
		}
		else if (this.el === window) {
			this.rect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
		}
		else {
			this.rect = (this.el as HTMLElement).getBoundingClientRect();
		}
	}

	onMove(e: Event) {
		const t = e instanceof TouchEvent ? e.touches[0] : e as MouseEvent;
		const touch = { x: t.clientX, y: t.clientY };

		this.mouse.x = ((touch.x + this.rect.x) / this.rect.width) * 2 - 1;
		this.mouse.y = -((touch.y + this.rect.y) / this.rect.height) * 2 + 1;

		this.raycaster.setFromCamera(this.mouse, this.camera);

		/*
		// is dragging
		if (this.selected && this.isDown) {
			if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
				this.emit('interactive-drag', { object: this.selected, position: this.intersection.sub(this.offset) });
			}
			return;
		}
		*/

		const intersects = this.raycaster.intersectObjects(this.objects);

		if (intersects.length > 0) {
			const object = intersects[0].object;
			this.intersectionData = intersects[0];

			this.plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.plane.normal), object.position);

			if (this.hovered !== object) {
				this.emit('interactive-out', { object: this.hovered });
				this.emit('interactive-over', { object });
				this.hovered = object;
			}
			else {
				this.emit('interactive-move', { object, intersectionData: this.intersectionData });
			}
		}
		else {
			this.intersectionData = null;

			if (this.hovered !== null) {
				this.emit('interactive-out', { object: this.hovered });
				this.hovered = null;
			}
		}
	}

	onDown(e: Event) {
		this.isDown = true;
		this.onMove(e);

		this.emit('interactive-down', { object: this.hovered, previous: this.selected, intersectionData: this.intersectionData });
		this.selected = this.hovered;

		if (this.selected) {
			if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
				this.offset.copy(this.intersection).sub(this.selected.position);
			}
		}
	}

	onUp() {
		this.isDown = false;

		this.emit('interactive-up', { object: this.hovered });
	}

	onLeave() {
		this.onUp();
		this.emit('interactive-out', { object: this.hovered });
		this.hovered = null;
	}
}
