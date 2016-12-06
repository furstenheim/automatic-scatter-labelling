module.exports = {mainFragment}
function mainFragment (size, numberOfRays) {
  return `
  precision mediump float;
  uniform sampler2D u_points_texture;
  uniform sampler2D u_radius_texture;
  uniform sampler2D u_label_texture;
  varying vec2 pos;
  vec4 read_point (void) {
    return texture2D(u_points_texture, pos);
  }
  vec4 read_radius (void) {
    return texture2D(u_radius_texture, pos);
  }
  vec4 read_label (void) {
    return texture2D(u_label_texture, vec2(float(0) / ${size}.0, 0.));
  }
  void commit (vec4 val) {
    gl_FragColor = val;
  }
  void main (void) {
    vec4 point = read_point();
    vec4 radius = read_radius();
    vec4 label = read_label();
    commit(vec4(point.rg / 0.00000000000000000000000000001, label.r * point.b, label.g));
  }
  `
}