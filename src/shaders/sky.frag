precision highp float;

uniform float uTime;

varying vec3 v_position;
varying float radius;

#include "../lygia/draw/circle.glsl";

mat2 scale(vec2 _scale) {
  return mat2(_scale.x, 0.0, 0.0, _scale.y);
}


void main() {

  vec2 coord = gl_PointCoord;

  // vec2 translate = vec2(cos(uTime), sin(uTime));
  // coord += translate * 0.35;

  // coord = scale(vec2(sin(uTime) * 0.5 + 1.0)) * coord;
  float rad = abs(0.5 * sin(uTime)) + 0.1;

  vec3 color = vec3(0.0) + circle(coord, rad);
  gl_FragColor = vec4(color,0.6);

}