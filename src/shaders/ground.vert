precision highp float;

attribute float a_index;
attribute float a_size;
attribute float angle;
attribute float a_scale;

varying vec3 v_position;
varying float radius;
varying float v_color;

uniform float uTotal;
uniform float uTime;
uniform vec3 uMouse;
uniform float uPixelRatio;
// uniform float uRandom;
// uniform float uDepth;
// uniform float uSize;
// uniform vec2 uTextureSize;// 纹理图片的宽高乘积
// uniform sampler2D uTexture;
// uniform sampler2D uTouch;

// varying vec2 vPUv;
// varying vec2 vUv;

float rand(float n) {
  return fract(sin(n) * 43758.5453123);
}

vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

float remap(float value, float sourceMin, float sourceMax, float targetMin, float targetMax) {
  float normalized = (value - sourceMin) / (sourceMax - sourceMin);
  return targetMin + normalized * (targetMax - targetMin);
}

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

vec2 bezier2(vec2 p0, vec2 p1, vec2 p2, float t) {
  float u = 1.0 - t;
  float tt = t * t;
  float uu = u * u;

  vec2 p = uu * p0; // 第一项
  p += 2.0 * u * t * p1; // 第二项
  p += tt * p2; // 第三项

  return p;
}

float up_offset(vec2 pos) {
  float dist = smoothstep(0.1, 1.0, length(pos - vec2(0.0)));
  return pow(dist * 20.0, -2.0) * 0.3;
}

const float noise_layer_1_amp = 0.2;
const float noise_layer_1_freq = 2.0;
const float noise_layer_2_amp = 0.1;
const float noise_layer_2_freq = 0.6;
const float noise_layer_3_amp = 0.05;
const float noise_layer_3_freq = 25.0;
const float noise_scale_freq = 3.0;
const float noise_scale_freqX = 2.0;
const float noise_scale_freqY = 1.0;
const float noise_scale_freqZ = 6.0;

void main() {

  v_position = position;

  float offset_x_layer1 = 0.1 * uTime;
  float offset_x_layer2 = 0.2 * uTime;
  vec3 sample_pos_layer1 = vec3(v_position.x + offset_x_layer1, v_position.y, v_position.z);
  vec3 sample_pos_layer2 = vec3(v_position.x - offset_x_layer2, v_position.y, v_position.z);
  float noise_layer_1 = cnoise(sample_pos_layer1 * noise_layer_1_freq) * noise_layer_1_amp;
  float noise_layer_2 = cnoise(sample_pos_layer2 * noise_layer_2_freq) * noise_layer_2_amp;
  float noise_layer_3 = cnoise(v_position.xyz * noise_layer_3_freq) * noise_layer_3_amp;
  vec3 scale_sample_pos = vec3(v_position.x * noise_scale_freqX, v_position.y * noise_scale_freqY, v_position.z * noise_scale_freqZ);
  float noise_scale = cnoise(scale_sample_pos);
  noise_scale = remap(noise_scale, -1.0, 1.0, 0.1, 0.7);

  v_color = remap(noise_scale, -1.0, 1.0, 0.2, 1.0);

  float rnd = rand(a_index);
  noise_scale = rnd < 0.0001 ? 5.0 * noise_scale : noise_scale;

  gl_PointSize = 4.5 * uPixelRatio * noise_scale;

  v_position.y += noise_layer_3 + noise_layer_1 + noise_layer_2;
  v_position.x += noise_layer_3;

  v_position.y += up_offset(v_position.xz);

  // float dispalce = length(v_position.xyz - uMouse.xyz);
  // vec3 dir = normalize(v_position.xyz - uMouse.xyz);
  // v_position.xyz += dir * 0.5 * smoothstep(0.3, 0.0, dispalce);

  vec4 finalPosition = modelViewMatrix * vec4(v_position, 1.0);
  gl_Position = projectionMatrix * finalPosition;
}
