'use strict'
var interval = require('./interval').interval
module.exports = {labelPointIntersection}

function labelPointIntersection (pk, li, vi, pi) {
  var firstInterval, secondInterval, thirdInterval, fourthInterval
  if (vi.y !== 0) {
    firstInterval = interval(Number.NEGATIVE_INFINITY, (li.height / 2 + pk.y - pi.y) / vi.y)
    secondInterval = interval((- li.height / 2 + pk.y - pi.y) / vi.y, Number.POSITIVE_INFINITY)
  } else {
    firstInterval = pi.y - pk.y < li.height / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
    secondInterval = pi.y - pk.y > - li.height / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
  }
  if (vi.x !== 0) {
    thirdInterval = interval(Number.NEGATIVE_INFINITY, (li.width / 2 + pk.x - pi.x) / vi.x)
    fourthInterval = interval((- li.width / 2 + pk.x - pi.x) / vi.x, Number.POSITIVE_INFINITY)
  } else {
    thirdInterval = pi.x - pk.x < li.width / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
    fourthInterval = pi.x - pk.x > - li.width / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
  }
  // Only interested in positive values
  var result = interval(0,Number.POSITIVE_INFINITY).intersect(firstInterval).intersect(secondInterval).intersect(thirdInterval).intersect(fourthInterval)

  // Before returning we must check whether the point belongs to the ray
  if ((pi.x - pk.x) * vi.y - (pi.y - pk.y) * vi.x === 0) {
    result = interval(result.start, Number.POSITIVE_INFINITY)
  }
  return result
}