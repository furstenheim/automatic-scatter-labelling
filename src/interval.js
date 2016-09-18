module.exports = interval
function Interval (start, end) {
  if (start > end) {
    // console.error('Wrong order of interval', start, end)
    this.empty = true
    this.start = null
    this.end = null
    return this
  }
  this.start = start
  this.end = end
  return this
}

Interval.empty = function () {
  return new Interval(1, -1)
}
Interval.prototype.intersect = function (interval) {
  if (this.empty || interval.empty) return Interval.empty()
  return new Interval(Math.max(interval.start, this.start), Math.min(interval.end, this.end))
}

Interval.prototype.coalesce = function (interval) {
  if (this.empty) return interval
  if (interval.empty) return this
  if (interval.start > this.end || this.start > interval.end) {
    // We probably need a multi interval in this case
    throw new Error('Cannot coallesce')
  }
  return new Interval(Math.min(interval.start, this.start), Math.max(interval.end, this.end))
}
function interval(start, end) {
  return new Interval(start, end)
}
interval.empty = Interval.empty