module.exports = {setUpFragment}

function setUpFragment (size, numberOfRays) {
  return `
  precision mediump float;
  varying vec2 pos;
  float m_pi = 3.14159265358;
  void commit (vec4 val) {
    gl_FragColor = val;
  }
  void main (void) {
    float i_ray = mod((pos.x * ${size * 2}. -1.)/2. + ${size * 2}.0 * (pos.y * ${size * 2}. - 1.)/2., ${numberOfRays}.0);
    // float i_ray =  (pos.y * ${size / 2}.0 * ${size / 2}.0);
    commit(vec4(sin(2.*m_pi*i_ray / ${numberOfRays}.0), cos(2.*m_pi*i_ray/${numberOfRays}.0), 0., 0.));
    //commit(vec4(i_ray, i_ray, 0., 0.));
    // commit(vec4((pos.x * ${size * 2}. -1.)/2., (pos.y * ${size * 2}. - 1.)/2.,0., 0.0));
  }
  `
}