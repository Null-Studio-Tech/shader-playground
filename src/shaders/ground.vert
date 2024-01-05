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


#include "../lygia/generative/random.glsl";
#include "../lygia/generative/cnoise.glsl";

float rand(float n) {
  return fract(sin(n) * 43758.5453123);
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

  float rnd = random(a_index);
  noise_scale = rnd < 0.0001 ? 5.0 * noise_scale : noise_scale;

  gl_PointSize = 4.5 * uPixelRatio * noise_scale;

  v_position.y += noise_layer_3 + noise_layer_1 + noise_layer_2;
  v_position.x += noise_layer_3;

  v_position.y += up_offset(v_position.xz);

  // float dispalce = length(v_position.xyz - uMouse.xyz);
  // vec3 dir = normalize(v_position.xyz - uMouse.xyz);
  // v_position.xyz += dir * 0.5 * smoothstep(0.3, 0.0, dispalce);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(v_position, 1.0);
}
