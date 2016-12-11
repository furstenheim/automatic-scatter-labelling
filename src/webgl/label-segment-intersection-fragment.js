module.exports = {labelSegmentIntersectionFragment}

function labelSegmentIntersectionFragment () {
  return `
    vec2 label_segment_intersection (vec2 segment_point, vec2 segment, vec2 label, vec2 ray, vec2 point) {
          // Translate so that ray starts at origin
          vec2 pk = segment_point - point;
          float my_min = infinity;
          float my_max = 0.;
          for (float i = -1.; i < 1.5; i += 2.) {
          // label.y is width
          float x = i * label.y;
          for (float j = -1.; j < 1.5; j += 2.) {
            float y = j * label.x;
            bool intersects;
            intersects = segment_segment_intersects(vec2(x, y), ray, pk, segment);
            if (intersects) {
              vec2 intersection = segment_segment_intersection(vec2(x, y), ray, pk, segment);
              if (intersection.y >= 0. && intersection.y <= 1.) {
                my_max = max(my_max, intersection.x);
                my_min = min(my_min, intersection.x);
              }
            }
            // Given a point, we take the side coming from it in counter clockwise
            vec2 side;
            if (x * y < 0.) {
              side = vec2(0., -2. * y);
            } else {
              side = vec2(-2. * x, 0.);
            }
            if (segment_segment_intersects(vec2(x, y), side, pk, ray)) {
              vec2 intersection = segment_segment_intersection(vec2(x, y), side, pk, ray);
              if (intersection.x >= 0. && intersection.x <= 1.) {
                my_max = max(my_max, intersection.y);
                my_min = min(my_min, intersection.y);
              }

            }
            vec2 translated_point = vec2(pk.x + segment.x, pk.y + segment.y);
            if (segment_segment_intersects(vec2(x, y), side, translated_point, ray)) {
              vec2 intersection = segment_segment_intersection(vec2(x, y), side, translated_point, ray);
              if (intersection.x >=0. && intersection.x <= 1.) {
                my_max = max(my_max, intersection.y);
                my_min = min(my_min, intersection.y);
              }
            }
          }
        }
        my_min = max(my_min, 0.);
        return vec2(my_min, my_max);
    }
  `
}