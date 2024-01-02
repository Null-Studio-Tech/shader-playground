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

void main() {

  v_position = position;

  gl_PointSize = 5.0;
  vec4 finalPosition = modelViewMatrix * vec4(v_position, 1.0);
  gl_Position = projectionMatrix * finalPosition;
}