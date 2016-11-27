'use strict'
module.exports = {multiInterval}
const interval = require('./interval').interval
const _ = require('lodash')
//Disjoint union of several intervals
// intervals array of coordinates
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
        nextInterval.coalesceInPlace(myInterval)
      } else {
        this.intervals.push(nextInterval.start, nextInterval.end)
        nextInterval = myInterval
      }
    }
  }
  if (nextInterval) {
    this.intervals.push(nextInterval.start, nextInterval.end)
  }
  return this
}
MultiInterval.empty = function () {
  return new MultiInterval([])
}
MultiInterval.prototype.isEmpty = function () {
  return !this.intervals.length
}

MultiInterval.prototype.intervalConstructor = interval(0, 1).constructor
MultiInterval.prototype.clone = function () {
  throw new Error('Not implemented')
  return new MultiInterval(this.intervals)
}
MultiInterval.prototype.remove = function (myInterval) {
  if (! myInterval instanceof this.intervalConstructor) {
    throw new Error('Not an interval')
  }
  if (this.empty || myInterval.empty) {
    return this
  }
  return this._remove(myInterval.start, myInterval.end)
}
// Removes in place
MultiInterval.prototype._remove = function (myStart, myEnd) {
  let i = 0
  while (i < this.intervals.length) {
    const intervalStart = this.intervals[i]
    const intervalEnd = this.intervals[i + 1]
    // no intersection
    if (intervalStart >= myEnd || intervalEnd <= myStart) {
      i += 2
      continue
    }
    // full intersection
    if (intervalStart >= myStart && intervalEnd <= myEnd) {
      this.intervals.splice(i, 2)
      // i does not grow we decrease length
      continue
    }
    // left intersection
    if (intervalStart >= myStart && intervalEnd > myEnd) {
      this.intervals[i] = myEnd
      break // There won't be any more intersection
    }
    // right intersection
    if (intervalEnd <= myEnd && intervalStart < myStart) {
      this.intervals[i + 1] = myStart
      i += 2
      continue
    }
    // intersects in the middle
    if (intervalEnd > myEnd && intervalStart < myStart) {
      this.intervals.splice(i + 1, 0, myStart, myEnd)
      break // there won't be any more intersection
    }
    console.error('This should not happen', myStart, myEnd, intervalStart, intervalEnd)
  }
  return this
}

MultiInterval.prototype.multipleRemove = function (myMultiInterval) {
  if (! myMultiInterval instanceof MultiInterval) {
    throw new Error('Not a multi interval')
  }
  if (this.empty || myMultiInterval.empty) {
    return this
  }
  for (let i = 0; i < myMultiInterval.intervals.length; i++) {
    this._remove(myMultiInterval.intervals[i], myMultiInterval.intervals[i + 1])
  }
  return this
}
// Warning only works properly with positive multiintervals
MultiInterval.prototype.measure = function () {
  var measure = 0
  for (let mInterval of this.intervals) {
    measure += mInterval.measure()
  }
  return measure
}
function multiInterval(intervals) {
  return new MultiInterval(intervals)
}

//TODO test
MultiInterval.prototype.getMin = function () {
  if (this.empty) return Number.POSITIVE_INFINITY
  return this.intervals[0]//this.intervals.reduce((min, cur) => cur.start < min ? cur.start : min, Number.POSITIVE_INFINITY)
}

multiInterval.coalesce = function (interval, anotherInterval) {
  if (interval.start > anotherInterval.end || anotherInterval.start > interval.end) {
    return multiInterval([interval, anotherInterval])
  } else {
    return multiInterval([interval.coalesce(anotherInterval)])
  }
}
multiInterval.empty = MultiInterval.empty
