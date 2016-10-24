/*
Given a point and a segment we find the intersection of the ray defined by the segment. If the point intersects the ray at a then we consider (a, infinity) to be the intersection
 */
module.exports = {pointSegmentIntersection}
var interval = require('./interval').interval
function pointSegmentIntersection (pi, pk, vk) {
  var det = (pi.x - pk.x) * vk.y - (pi.y - pk.y) * vk.x
  // point is not contained in the line
  if (det !== 0) return interval.empty()
  var intersectionPoint
  if (vk.y !== 0) intersectionPoint = (pi.y - pk.y) / vk.y
  else if (vk.x !== 0) intersectionPoint = (pi.x - pk.x) / vk.x
  if (intersectionPoint < 0) return interval.empty()
  return  interval(intersectionPoint, Number.POSITIVE_INFINITY)
}