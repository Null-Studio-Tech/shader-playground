precision highp float;

varying vec3 v_position;
varying float radius;
varying float v_color;

float circle(in vec2 _st, in float _radius) {
  vec2 dist = _st - vec2(0.5);
  return 1. - smoothstep(_radius - (_radius * 0.01), _radius + (_radius * 0.01), dot(dist, dist) * 4.0);
}

void main() {
  // float radius = 0.5; // 半径，取值范围 0.0 到 1.0
  // vec2 coords = gl_PointCoord - vec2(0.5, 0.5); // 将坐标原点移至中心
  // float distance = length(coords);
  // vec3 color = vec3(circle(gl_PointCoord, 0.5));
  // gl_FragColor = vec4(color, color.x);

  // if(distance > 0.5) {
  //   discard;
  // } else {
  //   gl_FragColor = vec4(1.0, 1.0, 1.0, 0.6);
  //   // if(v_position.x > 0.0) {
  //   //   gl_FragColor = color_green;
  //   // } else {
  //   //   gl_FragColor = color_white;
  //   // }
  // }

  gl_FragColor = vec4(1.0);

}