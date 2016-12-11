module.exports = {rayRectangleIntersectionFragment}
function rayRectangleIntersectionFragment () {
  return `
  vec2 ray_rectangle_intersection (vec4 rectangle, vec2 ray, vec2 ray_point) {
    vec2 fake_label = vec2(0., 0.);
    vec2 intersection = label_rectangle_intersection(rectangle, fake_label, ray, ray_point);
    // empty
    if (intersection.x < 0.) {
      return intersection;
    }
    return vec2(intersection.x, infinity);
  }
  `
}