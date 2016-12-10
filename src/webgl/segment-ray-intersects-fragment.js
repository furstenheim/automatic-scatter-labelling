module.exports = {segmentRayIntersectsFragment}

function segmentRayIntersectsFragment () {
  return `
  bool segment_ray_intersects (vec2 segment_point, vec2 segment, vec2 ray_point, vec2 ray) {
   // TODO handle parallel concurrent lines
    return (ray.x * segment.y - ray.y * segment.x) != 0.;
  }
  `
}