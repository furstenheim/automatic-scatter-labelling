// Given a ray and a rectangle, return the interval from the intersection to infinity (it blocks the ray)
module.exports = {rayRectangleIntersection}
const labelRectangleIntersection = require('./label-rectangle-intersection').labelRectangleIntersection
const interval = require('./interval').interval

function rayRectangleIntersection (lk, vi, pi) {
  // Basically make a fake label of 0 height and width
  const li = {height: 0, width: 0}
  const intersection = labelRectangleIntersection(lk, li, vi, pi)
  if (intersection.empty) {
    return intersection
  }
  return interval(intersection.start, Number.POSITIVE_INFINITY)
}