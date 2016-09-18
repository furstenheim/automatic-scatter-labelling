module.exports = interval
function Interval (start, end) {
  if (start > end) {
    console.error('Wrong order of interval', start, end)
    return null
  }
  this.start = start
  this.end = end
  return this
}

Interval.prototype.intersect = function (interval) {
  if (this === null || interval === null) return null
  return new Interval(Math.max(interval.start, this.start), Math.min(interval.end, this.end))
}

function interval(start, end) {
  return new Interval(start, end)
}