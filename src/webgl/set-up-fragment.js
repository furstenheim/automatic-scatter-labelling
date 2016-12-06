module.exports = {setUpFragment}

function setUpFragment (size, numberOfRays) {
  return `
  precision mediump float;
  varying vec2 pos;
  double m_pi = 3.14159265358;
  void commit (vec4 val) {
    gl_FragColor = val;
  }
  void main (void) {
    float i_ray = mod(pos.x * ${size}.0 + (pos.y * ${size}.0 * ${size}.0), ${numberOfRays}.0);
    commit(vec4(sin(2*m_pi*i_ray / ${numberOfRays}.0, cos(2*m_pi*i_ray/${numberOfRays}.0), 0., 0.));
  }
  `
}