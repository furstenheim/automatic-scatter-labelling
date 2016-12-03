'use strict'
module.exports = {multiInterval}
const interval = require('./interval').interval
const utils = require('./utils')
const _ = require('lodash')
//Disjoint union of several intervals
// intervals array of coordinates
function MultiInterval(intervals, isClone) {
  // Not very nice but it is hard to clone in js
  if (isClone) {
    this.intervals = _.clone(intervals)
    if (intervals.length === 0) this.empty = true
    return this
  }
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
  return new MultiInterval(this.intervals, true)
}
MultiInterval.prototype.remove = function (myInterval) {
  if (! myInterval instanceof this.intervalConstructor) {
    throw new Error('Not an interval')
  }
  if (this.empty || myInterval.empty) {
    return this
  }
  _remove(this.intervals, myInterval.start, myInterval.end)
  return this
}
// Removes in place
function _remove(intervals, myStart, myEnd) {
  let i = 0
  while (i < intervals.length) {
    const intervalStart = intervals[i]
    const intervalEnd = intervals[i + 1]
    if (intervalStart >= myEnd) {
      break // no more intersection
    }
    // no intersection
    if (intervalEnd <= myStart) {
      i += 2
      continue
    }
    // full intersection
    if (intervalStart >= myStart && intervalEnd <= myEnd) {
      intervals.splice(i, 2)
      // i does not grow we decrease length
      continue
    }
    // left intersection
    if (intervalStart >= myStart && intervalEnd > myEnd) {
      intervals[i] = myEnd
      break // There won't be any more intersection
    }
    // right intersection
    if (intervalEnd <= myEnd && intervalStart < myStart) {
      intervals[i + 1] = myStart
      i += 2
      continue
    }
    // intersects in the middle
    if (intervalEnd > myEnd && intervalStart < myStart) {
      intervals.splice(i + 1, 0, myStart, myEnd)
      break // there won't be any more intersection
    }
    console.error('This should not happen', myStart, myEnd, intervalStart, intervalEnd)
    i += 2
  }
  return intervals
}

// In place
MultiInterval.prototype.multipleRemove = function (myMultiInterval) {
  if (! myMultiInterval instanceof MultiInterval) {
    throw new Error('Not a multi interval')
  }
  if (this.empty || myMultiInterval.empty) {
    return this
  }
  for (let i = 0; i < myMultiInterval.intervals.length; i += 2) {
    _remove(this.intervals, myMultiInterval.intervals[i], myMultiInterval.intervals[i + 1])
  }
  return this
}

function _measureIntersection (intervals, myStart, myEnd) {
  let i = 0
  let measure = 0
  while (i < intervals.length) {
    const intervalStart = intervals[i]
    const intervalEnd = intervals[i + 1]
    if (intervalStart >= myEnd) {
      break // no more intersection
    }
    // no intersection
    if (intervalEnd <= myStart) {
      i += 2
      continue
    }
    // full intersection
    if (intervalStart >= myStart && intervalEnd <= myEnd) {
      measure += utils.measure(intervalStart, intervalEnd)
      i += 2
      continue
    }
    // left intersection
    if (intervalStart >= myStart && intervalEnd > myEnd) {
      measure += utils.measure(intervalStart, myEnd)
      break // There won't be any more intersection
    }
    // right intersection
    if (intervalEnd <= myEnd && intervalStart < myStart) {
      measure += utils.measure(myStart, intervalEnd)
      i += 2
      continue
    }
    // intersects in the middle
    if (intervalEnd > myEnd && intervalStart < myStart) {
      measure += utils.measure(myStart, myEnd)
      break // there won't be any more intersection
    }
    console.error('This should not happen', myStart, myEnd, intervalStart, intervalEnd)
    i += 2
  }
  return measure
}

MultiInterval.prototype.measureMultipleIntersection = function (multiInterval) {
  let measure = 0
  for (let i = 0; i < multiInterval.intervals.length; i += 2) {
    measure += _measureIntersection(this.intervals, multiInterval.intervals[i], multiInterval.intervals[i+1])
  }
  return measure
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

function multiInterval (intervals) {
  return new MultiInterval(intervals)
}