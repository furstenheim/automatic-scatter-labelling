'use strict'
var interval = require('./interval')
module.exports = labelRectangleIntersection

// Compare centers of the labels they must be within li.height / 2 + lk.height / 2 in the vertical variable and li.width / 2 + lk.width / 2 in the horizontal variable

function labelRectangleIntersection (lk, li, vi, pi) {
  var firstInterval, secondInterval, thirdInterval, fourthInterval
  if (vi.y !== 0) {
    firstInterval = interval(Number.NEGATIVE_INFINITY, (lk.height / 2 + li.height / 2 + (lk.top + lk.bottom) / 2 - pi.y) / vi.y)
    secondInterval = interval((- lk.height / 2 - li.height / 2 + (lk.top + lk.bottom) / 2 - pi.y) / vi.y, Number.POSITIVE_INFINITY)
  } else {
    firstInterval = pi.y - (lk.top + lk.bottom) / 2 < lk.height / 2 + li.height / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
    secondInterval = pi.y - (lk.top + lk.bottom) / 2 > - lk.height / 2 - li.height / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
  }
  if (vi.x !== 0) {
    thirdInterval = interval(Number.NEGATIVE_INFINITY, (lk.width / 2 + li.width / 2 + (lk.right + lk.left) / 2 - pi.x) / vi.x)
    fourthInterval = interval((- lk.width / 2 - li.width / 2 + (lk.right + lk.left) / 2 - pi.x) / vi.x, Number.POSITIVE_INFINITY)
  } else {
    thirdInterval = pi.x - (lk.right + lk.left) / 2 < lk.width / 2 + li.width / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
    fourthInterval = pi.x - (lk.right + lk.left) / 2 > -lk.width / 2 - li.width / 2 ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
  }

  // Only interested in positive values
  return interval(0,Number.POSITIVE_INFINITY).intersect(firstInterval).intersect(secondInterval).intersect(thirdInterval).intersect(fourthInterval)
}