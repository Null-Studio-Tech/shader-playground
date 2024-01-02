precision highp float;

attribute float pindex;
attribute float a_size;

varying vec3 v_position;

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

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
  0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
  -0.577350269189626,  // -1.0 + 2.0 * C.x
  0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

// Compute final noise value at P
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float random(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {

  v_position = position;
	// // displacement
  vec3 displaced = position;
	// // randomise
	// displaced.xy += vec2(random(pindex) - 0.5, random(offset.x + pindex) - 0.5) * uRandom;
  // float rndz = 0.1 * snoise(vec2(position.x, position.y)) * uTime;
  float rndz = 0.1 * snoise(vec2(position.x * position.y, uTime * 0.1));
  // float tmp = random(pindex) * 2.0 * 2.0;
  // rndz *= tmp;
  displaced.z += rndz;
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

  gl_PointSize = 30.0 * a_size / uTotal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}