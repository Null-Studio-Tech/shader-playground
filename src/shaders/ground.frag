precision highp float;

varying vec3 v_position;

void main() {
  float radius = 0.5; // 半径，取值范围 0.0 到 1.0
  vec2 coords = gl_PointCoord - vec2(0.5, 0.5); // 将坐标原点移至中心
  float distance = length(coords);

  vec4 color_white = vec4(1.0, 1.0, 1.0, 1.0);
  vec4 color_green = vec4(0.0, 1.0, 1.0, 1.0);

  // gl_FragColor = color_white;

  if(distance > radius) {
    discard;
  } else {
    if(v_position.x > 0.0) {
      gl_FragColor = color_green;
    } else {
      gl_FragColor = color_white;
    }
  }

}