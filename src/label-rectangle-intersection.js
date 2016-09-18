'use strict'
var interval = require('./interval')
module.exports = labelRectangleIntersection
// Given label lk, and label li moving on vector vi from point pi it computes the interval at which li intersects lk
function labelRectangleIntersection (lk, li, vi, pi) {
  // Strategy is as follows, a label is inside another label iff one of the corners is inside, so we find intervals for each corners and coallesce
  var intervals = []
  for (let rx of [-li.width / 2, li.width/2]) {
    for (let ry of [-li.height / 2, li.height / 2]) {
      intervals.push(labelRelativePointIntersection(lk, rx, ry, vi, pi))
    }
  }
  console.log(intervals)
  return intervals.reduce((i1, i2)=> i1.coalesce(i2), interval.empty())
}

// Given point pi and vector vi, finds interval at which relative point rx, ry intersects the rectangle
function labelRelativePointIntersection (lk, rx, ry, vi, pi) {
  var firstInterval, secondInterval, thirdInterval, fourthInterval
  if (vi.y !== 0) {
    // Point is below the top
    firstInterval = interval(Number.NEGATIVE_INFINITY, (lk.top - pi.y - ry) / vi.y)
    secondInterval = interval((lk.bottom - ry - pi.y) / vi.y, Number.POSITIVE_INFINITY)
  } else {
    firstInterval = pi.y + ry < lk.top ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
    secondInterval = pi.y + ry > lk.bottom ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
  }
  if (vi.x !== 0) {
    thirdInterval = interval(Number.NEGATIVE_INFINITY, (lk.right - pi.x - rx) / vi.x)
    fourthInterval = interval((lk.left - rx - pi.x) / vi.x, Number.POSITIVE_INFINITY)
  } else {
    thirdInterval = pi.x + rx < lk.right ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
    fourthInterval = pi.x + rx > lk.left ? interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) : interval.empty()
  }

  console.log(pi.x, rx, lk.right)
  // Only interested in positive values
  console.log(firstInterval, secondInterval, thirdInterval, fourthInterval)
  return interval(0,Number.POSITIVE_INFINITY).intersect(firstInterval).intersect(secondInterval).intersect(thirdInterval).intersect(fourthInterval)
}