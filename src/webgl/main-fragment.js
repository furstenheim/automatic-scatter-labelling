module.exports = {mainFragment}

const mainIntersectionFragment = require('./main-intersection-fragment')
const segmentSegmentIntersectsFragment = require('./segment-segment-intersects-fragment')
const segmentSegmentIntersectionFragment = require('./segment-segment-intersection-fragment')
const labelRectangleIntersectionFragment = require('./label-rectangle-intersection-fragment')
function mainFragment (size, numberOfRays) {
  return `
  precision mediump float;
  // we are in clamped mode so we are ok
  float infinity = 1./0.0000001;
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
  vec4 read_rectangle (void) {
    return texture2D(u_label_texture, vec2(0., 0.));
  }
  void commit (vec4 val) {
    gl_FragColor = val;
  }
  ${segmentSegmentIntersectsFragment.segmentSegmentIntersectsFragment()}
  ${segmentSegmentIntersectionFragment.segmentSegmentIntersectionFragment()}
  ${labelRectangleIntersectionFragment.labelRectangleIntersectionFragment()}
  ${mainIntersectionFragment.mainIntersectionFragment(size, numberOfRays)}
  `
}