module.exports = {raySegmentIntersection}

const segmentSegmentIntersection = require('./segment-segment-intersection').segmentSegmentIntersection
const interval = require('./interval').interval

/*
pj, vj defines a ray
 */
function raySegmentIntersection (pi, vi, pj, vj) {
  const intersection = segmentSegmentIntersection(pj, vj, pi, vi)
  if (intersection === null) return interval.empty()
  const {t, s} = intersection
  // t is time in ray, s parameter on the segment
  if (t <= 0 || s < 0 || s > 1) {
    return interval.empty()
  }
  return interval(t, Number.POSITIVE_INFINITY)
}