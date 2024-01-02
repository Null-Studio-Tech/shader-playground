precision highp float;

uniform float uTime;

varying vec3 v_position;
varying float radius;

mat2 scale(vec2 _scale) {
  return mat2(_scale.x, 0.0, 0.0, _scale.y);
}

float circle(in vec2 _st, in float _radius) {
  vec2 dist = _st - vec2(0.5);
  return 1. - smoothstep(_radius - (_radius * 0.01), _radius + (_radius * 0.01), dot(dist, dist) * 4.0);
}

void main() {

  vec2 coord = gl_PointCoord;

  vec2 translate = vec2(cos(uTime), sin(uTime));
  coord += translate * 0.35;

  // coord = scale(vec2(sin(uTime) * 0.5 + 1.0)) * coord;
  float rad = abs(0.5 * sin(uTime)) + 0.1;

  vec3 color = vec3(0.0) + circle(coord, rad);
  gl_FragColor = vec4(color, 1.0);

}