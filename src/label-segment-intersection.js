'use strict'
// Find interval in which an interval and a segment intersect
module.exports = labelSegmentIntersection

var segmentSegmentIntersection = require('./segment-segment-intersection')
var interval = require('./interval')

// Label li moves with vector vi. We find the interval at which it intersects the segment pk, vk. If pk is contained then the interval goes to INFINITY
function labelSegmentIntersection (pk, vk, li, vi, pi) {
  pk = {x: pk.x - pi.x, y: pk.y - pi.y}
  // TODO handle parallel lines
  var pointCovered
  // The time interval where they meet is connected so it is enough to find the end points. This must occur when either the corners of the label intersect or when
  const intersections = []
  // the end points of the segment intersect
  for (let x of [- li.width / 2, li.width / 2]) {
    for (let y of [ - li.height / 2, li.height / 2]) {
      let intersection = segmentSegmentIntersection({x, y}, vi, pk, vk)
      // Intersects inside the segment
      if (intersection && intersection.s >= 0 && intersection.s <= 1) {
        intersections.push(intersection.t)
      }

      // Given a point to we take the side coming from it in counter clockwise
      let side
      if (x * y < 0) {
        side = {x: 0, y: -2 * y}
      } else {
        side = {x: -2 * x, y: 0}
      }
      intersection = segmentSegmentIntersection({x, y}, side, pk, vi)
      if (intersection && intersection.t >= 0 && intersection.t <= 1) {
        intersections.push(-intersection.s)
        //// The side covers the point in the future
        //if (intersection.s < 0) {
        //  intersections.push(Number.POSITIVE_INFINITY)
        //}
      }
      intersection = segmentSegmentIntersection({x, y}, side, {x: pk.x + vk.x, y: pk.y + vk.y}, vi)
      if (intersection && intersection.t >= 0 && intersection.t <= 1) {
        intersections.push(-intersection.s)
      }
    }
  }
  var min = intersections.reduce((a, b) => Math.min(a,b), Number.POSITIVE_INFINITY)
  var max = intersections.reduce((a, b) => Math.max(a,b), Number.NEGATIVE_INFINITY)
  // TODO test negative interval
  return interval(min, max).intersect(interval(0, Number.POSITIVE_INFINITY))

}