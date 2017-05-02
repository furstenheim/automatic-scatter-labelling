'use strict'
var interval = require('./interval').interval
module.exports = {labelRectangleIntersection}

/* Rectangle lk intersects label li moving from pi with vector vi in positive time */
// Compare centers of the labels they must be within li.height / 2 + lk.height / 2 in the vertical variable and li.width / 2 + lk.width / 2 in the horizontal variable, i.e solve |lk.x - (pk.x + t * v.x)| < d
function labelRectangleIntersection (lk, li, vi, pi) {
  let min = 0
  let max = Number.POSITIVE_INFINITY
  if (vi.y !== 0) {
    const firstIntersection = (lk.height / 2 + li.height / 2 + (lk.top + lk.bottom) / 2 - pi.y) / vi.y
    const secondIntersection = (-lk.height / 2 - li.height / 2 + (lk.top + lk.bottom) / 2 - pi.y) / vi.y
    // Multiplying by a negative sign reverses an inequality
    if (vi.y > 0) {
      max = Math.min(max, firstIntersection)
      min = Math.max(min, secondIntersection)
    } else {
      min = Math.max(min, firstIntersection)
      max = Math.min(max, secondIntersection)
    }
  } else {
    // vector is vertical and they will never intersect
    if (pi.y - (lk.top + lk.bottom) / 2 > lk.height / 2 + li.height / 2) return interval.empty()
    if (pi.y - (lk.top + lk.bottom) / 2 < - lk.height / 2 - li.height / 2) return interval.empty()
  }
  if (vi.x !== 0) {
    const thirdIntersection = (lk.width / 2 + li.width / 2 + (lk.right + lk.left) / 2 - pi.x) / vi.x
    const fourthIntersection = (- lk.width / 2 - li.width / 2 + (lk.right + lk.left) / 2 - pi.x) / vi.x
    if (vi.x > 0) {
      max = Math.min(max, thirdIntersection)
      min = Math.max(min, fourthIntersection)
    } else {
      min = Math.max(min, thirdIntersection)
      max = Math.min(max, fourthIntersection)
    }
  } else {
    if (pi.x - (lk.right + lk.left) / 2 > lk.width / 2 + li.width / 2) return interval.empty()
    if (pi.x - (lk.right + lk.left) / 2 < -lk.width / 2 - li.width / 2) return interval.empty()
  }

  // Only interested in positive values
  return interval(min, max)
}