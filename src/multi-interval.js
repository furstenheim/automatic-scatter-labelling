'use strict'
module.exports = multiInterval
var interval = require('./interval')
//Disjoint union of several intervals
function MultiInterval(intervals) {
  if (!Array.isArray(intervals)) {
    this.empty = true
    this.intervals = []
    return this
  }
  this.intervals = []
  var checkedIntervals = []
  // So we can check interval
  var intervalConstructor = interval(0, 1).constructor
  for (let myInterval of intervals) {
    if (! myInterval instanceof intervalConstructor) {
      this.empty = true
      this.intervals = []
      return this
    }
    if (!myInterval.empty) {
      checkedIntervals.push(myInterval.clone())
    }
  }

  checkedIntervals.sort((i1, i2) => i1.start - i2.start)

  // Now we need to coalesce intervals if needed
  let nextInterval = null
  for (let myInterval of checkedIntervals) {
    if (nextInterval === null) {
      nextInterval = myInterval
    } else {
      if (!nextInterval.intersect(myInterval).empty) {
        nextInterval = nextInterval.coalesce(myInterval)
      } else {
        this.intervals.push(nextInterval)
        nextInterval = myInterval
      }
    }
  }
  if (nextInterval) {
    this.intervals.push(nextInterval)
  }
  return this
}
MultiInterval.empty = function () {
  return new MultiInterval([])
}

MultiInterval.prototype.intervalConstructor = interval(0, 1).constructor
MultiInterval.prototype.clone = function () {
  return new MultiInterval(this.intervals)
}
MultiInterval.prototype.remove = function (myInterval) {
  if (! myInterval instanceof this.intervalConstructor) {
    throw new Error('Not an interval')
  }
  if (this.empty || myInterval.empty) {
    return this.clone()
  }

  var leftComplement = interval(Number.NEGATIVE_INFINITY, myInterval.start)
  var rightComplement = interval(myInterval.end, Number.POSITIVE_INFINITY)
  var leftIntervals = this.intervals.map(i => i.intersect(leftComplement))
  var rightIntervals = this.intervals.map(i => i.intersect(rightComplement))
  return new MultiInterval(leftIntervals.concat(rightIntervals))
}
function multiInterval(intervals) {
  return new MultiInterval(intervals)
}
multiInterval.empty = MultiInterval.empty
