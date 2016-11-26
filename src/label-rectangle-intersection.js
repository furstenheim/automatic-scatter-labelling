'use strict'
var interval = require('./interval').interval
module.exports = {labelRectangleIntersection}

/* Rectangle lk intersects label li moving from pi with vector vi in positive time */
// Compare centers of the labels they must be within li.height / 2 + lk.height / 2 in the vertical variable and li.width / 2 + lk.width / 2 in the horizontal variable, i.e solve |lk.x - (pk.x + t * v.x)| < d
function labelRectangleIntersection (lk, li, vi, pi) {
  var firstInterval, secondInterval, thirdInterval, fourthInterval
  if (vi.y !== 0) {
    const firstIntersection = (lk.height / 2 + li.height / 2 + (lk.top + lk.bottom) / 2 - pi.y) / vi.y
    const secondIntersection = (- lk.height / 2 - li.height / 2 + (lk.top + lk.bottom) / 2 - pi.y) / vi.y
    // Multiplying by a negative sign reverses an inequality
    firstInterval = vi.y > 0 ? interval(Number.NEGATIVE_INFINITY, firstIntersection) : interval(firstIntersection, Number.POSITIVE_INFINITY)
    secondInterval = vi.y > 0 ? interval(secondIntersection , Number.POSITIVE_INFINITY) : interval(Number.NEGATIVE_INFINITY, secondIntersection)
  } else {
    firstInterval = pi.y - (lk.top + lk.bottom) / 2 < lk.height / 2 + li.height / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
    secondInterval = pi.y - (lk.top + lk.bottom) / 2 > - lk.height / 2 - li.height / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
  }
  if (vi.x !== 0) {
    const thirdIntersection = (lk.width / 2 + li.width / 2 + (lk.right + lk.left) / 2 - pi.x) / vi.x
    const fourthIntersection = (- lk.width / 2 - li.width / 2 + (lk.right + lk.left) / 2 - pi.x) / vi.x
    thirdInterval = vi.x > 0 ? interval(Number.NEGATIVE_INFINITY, thirdIntersection) : interval(thirdIntersection, Number.POSITIVE_INFINITY)
    fourthInterval = vi.x > 0 ? interval(fourthIntersection, Number.POSITIVE_INFINITY) : interval(Number.NEGATIVE_INFINITY, fourthIntersection)
  } else {
    thirdInterval = pi.x - (lk.right + lk.left) / 2 < lk.width / 2 + li.width / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
    fourthInterval = pi.x - (lk.right + lk.left) / 2 > -lk.width / 2 - li.width / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
  }

  // Only interested in positive values
  return interval(0,Number.POSITIVE_INFINITY).intersect(firstInterval).intersect(secondInterval).intersect(thirdInterval).intersect(fourthInterval)
}