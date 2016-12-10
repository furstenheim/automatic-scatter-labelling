module.exports = {segmentSegmentIntersectsFragment}

function segmentSegmentIntersectsFragment () {
  return `
  bool segment_segment_intersects (vec2 ray_point, vec2 ray, vec2 segment_point, vec2 segment) {
   // TODO handle parallel concurrent lines
    return (ray.x * segment.y - ray.y * segment.x) != 0.;
  }
  `
}