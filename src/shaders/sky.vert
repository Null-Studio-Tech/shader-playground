precision highp float;

attribute float pindex;
attribute float a_size;

varying vec3 v_position;
varying float radius;

// attribute float angle;
uniform float uTotal;
uniform float uTime;
// uniform float uRandom;
// uniform float uDepth;
// uniform float uSize;
// uniform vec2 uTextureSize;// 纹理图片的宽高乘积
// uniform sampler2D uTexture;
// uniform sampler2D uTouch;

// varying vec2 vPUv;
// varying vec2 vUv;

void main() {

  v_position = position;
	// // displacement
  vec3 displaced = position;
	// // randomise
	// displaced.xy += vec2(random(pindex) - 0.5, random(offset.x + pindex) - 0.5) * uRandom;
  // float rndz = 0.1 * snoise(vec2(position.x, position.y)) * uTime;
  // float rndz = gold_noise(position.xy, uTime);
  // float psize = snoise(vec2(uTime, position.x * position.y) * 0.5) * 0.01;
  // float tmp = random(pindex) * 2.0 * 2.0;
  // rndz *= tmp;
  // displaced.z += rndz;
	// // center
	// displaced.xy -= uTextureSize * 0.5;
  // rndz *= 0.5;
	// // touch
	// float t = texture2D(uTouch, puv).r;
	// displaced.z += t * 20.0 * rndz;
	// displaced.x += cos(angle) * t * 20.0 * rndz;
	// displaced.y += sin(angle) * t * 20.0 * rndz;

	// // particle size
	// float psize = (snoise(vec2(uTime, pindex) * 0.5) + 2.0);
	// psize *= max(grey, 0.2);
	// psize *= uSize;

	// final position
	// vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
	// mvPosition.xyz += position * psize;
	// vec4 finalPosition = projectionMatrix * mvPosition;

  // gl_PointSize = 1.0 + 5.0 * rndz;
  gl_PointSize = 10.0;
  // radius = 0.1 + rndz * 0.3;
  // vec4 finalPosition = modelViewMatrix * vec4(position, 1.0);
  // finalPosition.xyz += 0.6 * psize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
