module.exports = {labelRectangleIntersectionFragment}

function labelRectangleIntersectionFragment () {
  return `
  // min max of the interval
  // rectangle has top, left, bottom, right
  // label height width
  // ray x y
  // returns -1,-1 if empty
  vec2 label_rectangle_intersection (vec4 rectangle, vec2 label, vec2 ray, vec2 point) {
    float my_min = 0.;
    float my_max = infinity;
    float rectangle_height = (rectangle.r + rectangle.b) / 2.;
    float rectangle_width = (rectangle.g + rectangle.a) / 2.;
    if (ray.y != 0.) {
      float firstIntersection = (rectangle_height / 2. + label.x / 2. + (rectangle.r + rectangle.b) / 2. - point.y) / ray.y;
      float secondIntersection = (- rectangle_height / 2. - label.x / 2. + (rectangle.r + rectangle.b) / 2. - point.y) / ray.y;
      // Multiplying by a negative sign reverses an inequality
      if (ray.y > 0.) {
        my_max = min(my_max, firstIntersection);
        my_min = max(my_min, secondIntersection);
      } else {
        my_min = max(my_min, firstIntersection);
        my_max = min(my_max, secondIntersection);
      }
    } else {
      // vector is vertical and they will never intersect
      if (point.y - (rectangle.r + rectangle.b) / 2. > rectangle_height / 2. + label.x / 2.) {
        return vec2(-1., -1.);
      }
      if (point.y - (rectangle.r + rectangle.b) / 2. < - rectangle_height / 2. - label.x / 2.) {
        return vec2(-1., -1.);
      }
    }
    if (ray.x != 0.) {
      float thirdIntersection = (rectangle_width / 2. + label.y / 2. + (rectangle.a + rectangle.g) / 2. - point.x) / ray.x;
      float fourthIntersection = (- rectangle_width / 2. - label.y / 2. + (rectangle.a + rectangle.g) / 2. - point.x) / ray.x;
      if (ray.x > 0.) {
        my_max = min(my_max, thirdIntersection);
        my_min = max(my_min, fourthIntersection);
      } else {
        my_min = max(my_min, thirdIntersection);
        my_max = min(my_max, fourthIntersection);
      }
    } else {
      if (point.x - (rectangle.a + rectangle.g) / 2. > rectangle_width / 2. + label.y / 2.) {
        return vec2(-1., -1.);
      }
      if (point.x - (rectangle.a + rectangle.g) / 2. < -rectangle_width / 2. - label.y / 2.) {
        return vec2(-1., -1.);
      }
    }
    return vec2(my_min, my_max);
    }
  `

}
