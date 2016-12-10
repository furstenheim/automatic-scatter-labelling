module.exports = {segmentSegmentIntersectionFragment}

function segmentSegmentIntersectionFragment () {
  return `
  vec2 segment_segment_intersection (vec2 ray_point, vec2 ray, vec2 segment_point, vec2 segment) {
    // This assumes that rays already intersect
      float det = - (ray.x* segment.y - segment.x * ray.y);
      float t = (-(segment_point.x - ray_point.x) * segment.y + (segment_point.y - ray_point.y) * segment.x) / det;
      float s = (-(segment_point.x - ray_point.x) * ray.y + (segment_point.y - ray_point.y) * ray.x) / det;
      return vec2(t, s);
  }
  `

}
