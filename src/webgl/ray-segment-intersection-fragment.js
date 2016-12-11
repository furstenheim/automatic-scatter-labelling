module.exports = {raySegmentIntersectionFragment}
function raySegmentIntersectionFragment () {
  return `vec2 ray_segment_intersection(vec2 segment_point, vec2 segment, vec2 ray_point, vec2 ray) {
    if (!segment_segment_intersects(ray_point, ray, segment_point, segment)) {
      return vec2(-1., -1.);
    }
    vec2 intersection = segment_segment_intersection(ray_point, ray, segment_point, segment);
    if (intersection.x <=0. || intersection.y < 0. || intersection.y > 1.) {
      return vec2(-1., -1.);
    }
    return vec2(intersection.x, infinity);
  }
  `
}