module.exports = {mainIntersectionFragment}

function mainIntersectionFragment (size, numberOfRays) {
  return `void main (void) {
    vec4 point = read_point();
    vec2 radius = read_radius();
    vec4 rect = read_rectangle();
    vec4 rect_point = read_rectangle_point();
    vec2 segment = (rect.ar + rect.gb) / 2. - rect_point.rg;
    vec2 label_interval = label_rectangle_intersection(rect, point.ba, radius, point.rg);
    vec2 segment_interval = label_segment_intersection(rect_point.xy, segment, point.ba, radius, point.rg);
    vec2 ray_interval = ray_rectangle_intersection(rect, radius, point.rg);
    vec2 ray_segment_interval = ray_segment_intersection(rect_point.xy, segment, point.rg, radius);

    vec2 label_intersection;
    vec2 segment_intersection;
    // if ray intervals are not empty then normal intervals are not empty. Hence we only need to consider rays emptiness
    if (ray_interval.x < 0.) {
      label_intersection = label_interval;
    } else {
      label_intersection = vec2(min(label_interval.x, ray_interval.x), max(label_interval.y, ray_interval.y));
    }
    if (ray_segment_interval.x < 0.) {
      segment_intersection = segment_interval;
    } else {
      segment_intersection = vec2(min(segment_interval.x, ray_segment_interval.x), max(segment_interval.y, ray_segment_interval.y));
    }

    commit(vec4(label_intersection, segment_intersection));
  }`
}