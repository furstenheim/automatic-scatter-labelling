/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 24);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = { interval };
function Interval(start, end) {
  if (start >= end) {
    // console.error('Wrong order of interval', start, end)
    this.empty = true;
    this.start = null;
    this.end = null;
    return this;
  }
  this.start = start;
  this.end = end;
  return this;
}

Interval.empty = function () {
  return new Interval(1, -1);
};
Interval.prototype.intersect = function (interval) {
  if (this.empty || interval.empty) return Interval.empty();
  return new Interval(Math.max(interval.start, this.start), Math.min(interval.end, this.end));
};

Interval.prototype.coalesce = function (interval) {
  if (this.empty) return interval;
  if (interval.empty) return this;
  if (interval.start > this.end || this.start > interval.end) {
    // We probably need a multi interval in this case
    throw new Error('Cannot coallesce');
  }
  return new Interval(Math.min(interval.start, this.start), Math.max(interval.end, this.end));
};
// TODO remove coalesce and rename this method to coalesce
// modifies interval
Interval.prototype.coalesceInPlace = function (interval) {
  if (this.empty) return interval;
  if (interval.empty) return this;
  if (interval.start > this.end || this.start > interval.end) {
    // We probably need a multi interval in this case
    throw new Error('Cannot coallesce');
  }
  this.start = Math.min(interval.start, this.start);
  this.end = Math.max(interval.end, this.end);
  return this;
};
Interval.prototype.clone = function () {
  if (this.empty) return Interval.empty();
  return new Interval(this.start, this.end);
};
Interval.prototype.measure = function () {
  if (this.empty) return 0;
  return Math.pow(2, -this.start) - Math.pow(2, -this.end);
};
function interval(start, end) {
  return new Interval(start, end);
}
interval.empty = Interval.empty;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = _;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var interval = __webpack_require__(0).interval;
module.exports = { labelRectangleIntersection };

/* Rectangle lk intersects label li moving from pi with vector vi in positive time */
// Compare centers of the labels they must be within li.height / 2 + lk.height / 2 in the vertical variable and li.width / 2 + lk.width / 2 in the horizontal variable, i.e solve |lk.x - (pk.x + t * v.x)| < d
function labelRectangleIntersection(lk, li, vi, pi) {
  let min = 0;
  let max = Number.POSITIVE_INFINITY;
  if (vi.y !== 0) {
    const firstIntersection = (lk.height / 2 + li.height / 2 + (lk.top + lk.bottom) / 2 - pi.y) / vi.y;
    const secondIntersection = (-lk.height / 2 - li.height / 2 + (lk.top + lk.bottom) / 2 - pi.y) / vi.y;
    // Multiplying by a negative sign reverses an inequality
    if (vi.y > 0) {
      max = Math.min(max, firstIntersection);
      min = Math.max(min, secondIntersection);
    } else {
      min = Math.max(min, firstIntersection);
      max = Math.min(max, secondIntersection);
    }
  } else {
    // vector is vertical and they will never intersect
    if (pi.y - (lk.top + lk.bottom) / 2 > lk.height / 2 + li.height / 2) return interval.empty();
    if (pi.y - (lk.top + lk.bottom) / 2 < -lk.height / 2 - li.height / 2) return interval.empty();
  }
  if (vi.x !== 0) {
    const thirdIntersection = (lk.width / 2 + li.width / 2 + (lk.right + lk.left) / 2 - pi.x) / vi.x;
    const fourthIntersection = (-lk.width / 2 - li.width / 2 + (lk.right + lk.left) / 2 - pi.x) / vi.x;
    if (vi.x > 0) {
      max = Math.min(max, thirdIntersection);
      min = Math.max(min, fourthIntersection);
    } else {
      min = Math.max(min, thirdIntersection);
      max = Math.min(max, fourthIntersection);
    }
  } else {
    if (pi.x - (lk.right + lk.left) / 2 > lk.width / 2 + li.width / 2) return interval.empty();
    if (pi.x - (lk.right + lk.left) / 2 < -lk.width / 2 - li.width / 2) return interval.empty();
  }

  // Only interested in positive values
  return interval(min, max);
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = { updateAvailableSpace, promoteLabelToRectangle,
  computeInitialAvailabeSpaces, resetAvailableSpace, updateMinima, translateLabel };

const pointSegmentIntersection = __webpack_require__(14).pointSegmentIntersection;
const labelRectangleIntersection = __webpack_require__(2).labelRectangleIntersection;
const rayRectangleIntersection = __webpack_require__(5).rayRectangleIntersection;
const multiInterval = __webpack_require__(4).multiInterval;
const interval = __webpack_require__(0).interval;
/*
 An extended point may contain the following
  rays a collection of rays starting from the point as well as the intervals where they are allowed
  label in case the label is not yet settled
  rectangle in case the label is settled
 */
function updateAvailableSpace(extendedPoint) {
  var rays = extendedPoint.rays;
  var measure = 0;
  for (let ray of rays) {
    let rayMeasure = ray.available.measure();
    ray.availableMeasure = rayMeasure;
    measure += rayMeasure;
  }
  extendedPoint.availableMeasure = measure;
}

function computeInitialAvailabeSpaces(extendedPoints, params) {
  const radius = params.radius;
  const bbox = params.bbox;
  for (let pi of extendedPoints) {
    for (let rij of pi.rays) {
      rij.initiallyAvailable = multiInterval([interval(0, Number.POSITIVE_INFINITY)]);
      for (let pk of extendedPoints) {
        const rectangle = { top: pk.position.y + radius, bottom: pk.position.y - radius, left: pk.position.x - radius, right: pk.position.x + radius, width: 2 * radius, height: 2 * radius };
        rij.initiallyAvailable.remove(labelRectangleIntersection(rectangle, pi.label, rij.vector, pi.position));
        if (pi !== pk) {
          rij.initiallyAvailable.remove(rayRectangleIntersection(rectangle, rij.vector, pi.position));
        }
      }
      if (bbox) {
        const labelContainedInterval = labelRectangleIntersection({ top: -bbox.top - pi.label.height, bottom: -bbox.bottom + pi.label.height, left: bbox.left + pi.label.width, right: bbox.right - pi.label.width, width: bbox.width - 2 * pi.label.width, height: bbox.height - 2 * pi.label.height }, pi.label, rij.vector, pi.position);
        // Want labels inside of the graph
        rij.initiallyAvailable.remove(interval(labelContainedInterval.end, Number.POSITIVE_INFINITY));
      }
      rij.available = rij.initiallyAvailable.clone();
    }
  }
}

function resetAvailableSpace(extendedPoint) {
  for (let rij of extendedPoint.rays) {
    rij.available = rij.initiallyAvailable.clone();
  }
}

function updateMinima(extendedPoint) {
  var rays = extendedPoint.rays;
  for (let ray of rays) {
    ray.minimum = ray.available.getMin();
  }
}

function promoteLabelToRectangle(extendedPoint, vi) {
  extendedPoint.rectangle = translateLabel(extendedPoint, vi);
  extendedPoint.segment = { x: vi.x, y: vi.y };
}

function translateLabel(extendedPoint, vi) {
  const point = extendedPoint.position;
  const label = extendedPoint.label;
  return {
    height: label.height,
    width: label.width,
    top: point.y + vi.y + label.height / 2,
    bottom: point.y + vi.y - label.height / 2,
    left: point.x + vi.x - label.width / 2,
    right: point.x + vi.x + label.width / 2
  };
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = { multiInterval };
const interval = __webpack_require__(0).interval;
const utils = __webpack_require__(9);
const _ = __webpack_require__(1);
//Disjoint union of several intervals
// intervals array of coordinates
function MultiInterval(intervals, isClone) {
  // Not very nice but it is hard to clone in js
  if (isClone) {
    this.intervals = _.clone(intervals);
    return this;
  }
  if (!Array.isArray(intervals) || intervals.length === 0) {
    this.intervals = [];
    return this;
  }
  this.intervals = [];
  var checkedIntervals = [];
  // So we can check interval
  var intervalConstructor = interval(0, 1).constructor;
  for (let myInterval of intervals) {
    if (!myInterval instanceof intervalConstructor) {
      this.intervals = [];
      return this;
    }
    if (!myInterval.empty) {
      checkedIntervals.push(myInterval.clone());
    }
  }

  checkedIntervals.sort((i1, i2) => i1.start - i2.start);

  // Now we need to coalesce intervals if needed
  let nextInterval = null;
  for (let myInterval of checkedIntervals) {
    if (nextInterval === null) {
      nextInterval = myInterval;
    } else {
      if (!nextInterval.intersect(myInterval).empty) {
        nextInterval.coalesceInPlace(myInterval);
      } else {
        this.intervals.push(nextInterval.start, nextInterval.end);
        nextInterval = myInterval;
      }
    }
  }
  if (nextInterval) {
    this.intervals.push(nextInterval.start, nextInterval.end);
  }
  return this;
}
MultiInterval.empty = function () {
  return new MultiInterval([]);
};
MultiInterval.prototype.isEmpty = function () {
  return !this.intervals.length;
};

MultiInterval.prototype.intervalConstructor = interval(0, 1).constructor;

MultiInterval.prototype.clone = function () {
  return new MultiInterval(this.intervals, true);
};
MultiInterval.prototype.remove = function (myInterval) {
  if (!myInterval instanceof this.intervalConstructor) {
    throw new Error('Not an interval');
  }
  if (this.isEmpty() || myInterval.empty) {
    return this;
  }
  _remove(this.intervals, myInterval.start, myInterval.end);
  return this;
};
// Removes in place
function _remove(intervals, myStart, myEnd) {
  let i = 0;
  while (i < intervals.length) {
    const intervalStart = intervals[i];
    const intervalEnd = intervals[i + 1];
    if (intervalStart >= myEnd) {
      break; // no more intersection
    }
    // no intersection
    if (intervalEnd <= myStart) {
      i += 2;
      continue;
    }
    // full intersection
    if (intervalStart >= myStart && intervalEnd <= myEnd) {
      intervals.splice(i, 2);
      // i does not grow we decrease length
      continue;
    }
    // left intersection
    if (intervalStart >= myStart && intervalEnd > myEnd) {
      intervals[i] = myEnd;
      break; // There won't be any more intersection
    }
    // right intersection
    if (intervalEnd <= myEnd && intervalStart < myStart) {
      intervals[i + 1] = myStart;
      i += 2;
      continue;
    }
    // intersects in the middle
    if (intervalEnd > myEnd && intervalStart < myStart) {
      intervals.splice(i + 1, 0, myStart, myEnd);
      break; // there won't be any more intersection
    }
    console.error('src/multi-interval.js:111:18:\'This should not happen\',myStart,myEnd,intervalStart,intervalEnd', 'This should not happen', myStart, myEnd, intervalStart, intervalEnd);
    i += 2;
  }
  return intervals;
}

// In place
MultiInterval.prototype.multipleRemove = function (myMultiInterval) {
  if (!myMultiInterval instanceof MultiInterval) {
    throw new Error('Not a multi interval');
  }
  if (this.isEmpty() || myMultiInterval.isEmpty()) {
    return this;
  }
  for (let i = 0; i < myMultiInterval.intervals.length; i += 2) {
    _remove(this.intervals, myMultiInterval.intervals[i], myMultiInterval.intervals[i + 1]);
  }
  return this;
};

function _measureIntersection(intervals, myStart, myEnd) {
  let i = 0;
  let measure = 0;
  while (i < intervals.length) {
    const intervalStart = intervals[i];
    const intervalEnd = intervals[i + 1];
    if (intervalStart >= myEnd) {
      break; // no more intersection
    }
    // no intersection
    if (intervalEnd <= myStart) {
      i += 2;
      continue;
    }
    // full intersection
    if (intervalStart >= myStart && intervalEnd <= myEnd) {
      measure += utils.measure(intervalStart, intervalEnd);
      i += 2;
      continue;
    }
    // left intersection
    if (intervalStart >= myStart && intervalEnd > myEnd) {
      measure += utils.measure(intervalStart, myEnd);
      break; // There won't be any more intersection
    }
    // right intersection
    if (intervalEnd <= myEnd && intervalStart < myStart) {
      measure += utils.measure(myStart, intervalEnd);
      i += 2;
      continue;
    }
    // intersects in the middle
    if (intervalEnd > myEnd && intervalStart < myStart) {
      measure += utils.measure(myStart, myEnd);
      break; // there won't be any more intersection
    }
    console.error('src/multi-interval.js:167:18:\'This should not happen\',myStart,myEnd,intervalStart,intervalEnd', 'This should not happen', myStart, myEnd, intervalStart, intervalEnd);
    i += 2;
  }
  return measure;
}

MultiInterval.prototype.measureMultipleIntersection = function (multiInterval) {
  let measure = 0;
  for (let i = 0; i < multiInterval.intervals.length; i += 2) {
    measure += _measureIntersection(this.intervals, multiInterval.intervals[i], multiInterval.intervals[i + 1]);
  }
  return measure;
};

MultiInterval.prototype.measure = function () {
  let measure = 0;
  for (let i = 0; i < this.intervals.length; i += 2) {
    measure += utils.measure(this.intervals[i], this.intervals[i + 1]);
  }
  return measure;
};

//TODO test
MultiInterval.prototype.getMin = function () {
  if (this.isEmpty()) return Number.POSITIVE_INFINITY;
  return this.intervals[0]; //this.intervals.reduce((min, cur) => cur.start < min ? cur.start : min, Number.POSITIVE_INFINITY)
};

multiInterval.coalesce = function (interval, anotherInterval) {
  if (interval.start > anotherInterval.end || anotherInterval.start > interval.end) {
    return multiInterval([interval, anotherInterval]);
  } else {
    return multiInterval([interval.coalesce(anotherInterval)]);
  }
};
multiInterval.empty = MultiInterval.empty;

function multiInterval(intervals) {
  return new MultiInterval(intervals);
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// Given a ray and a rectangle, return the interval from the intersection to infinity (it blocks the ray)
module.exports = { rayRectangleIntersection };
const labelRectangleIntersection = __webpack_require__(2).labelRectangleIntersection;
const interval = __webpack_require__(0).interval;

function rayRectangleIntersection(lk, vi, pi) {
  // Basically make a fake label of 0 height and width
  const li = { height: 0, width: 0 };
  const intersection = labelRectangleIntersection(lk, li, vi, pi);
  if (intersection.empty) {
    return intersection;
  }
  return interval(intersection.start, Number.POSITIVE_INFINITY);
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Find interval in which an interval and a segment intersect

module.exports = { labelSegmentIntersection };

var segmentSegmentIntersection = __webpack_require__(8).segmentSegmentIntersection;
var interval = __webpack_require__(0).interval;

// Label li moves with vector vi. We find the interval at which it intersects the segment pk, vk. If pk is contained then the interval goes to INFINITY
function labelSegmentIntersection(pk, vk, li, vi, pi) {
  // translate so we can assume that point is in the centre
  pk = { x: pk.x - pi.x, y: pk.y - pi.y };
  // TODO handle parallel lines
  var pointCovered;
  // The time interval where they meet is connected so it is enough to find the end points. This must occur when either the corners of the label intersect or when
  const intersections = [];
  // the end points of the segment intersect
  for (let x of [-li.width / 2, li.width / 2]) {
    for (let y of [-li.height / 2, li.height / 2]) {
      let intersection = segmentSegmentIntersection({ x, y }, vi, pk, vk);
      // Intersects inside the segment
      if (intersection && intersection.s >= 0 && intersection.s <= 1) {
        intersections.push(intersection.t);
      }

      // Given a point to we take the side coming from it in counter clockwise
      let side;
      if (x * y < 0) {
        side = { x: 0, y: -2 * y };
      } else {
        side = { x: -2 * x, y: 0 };
      }
      intersection = segmentSegmentIntersection({ x, y }, side, pk, vi);
      if (intersection && intersection.t >= 0 && intersection.t <= 1) {
        intersections.push(-intersection.s);
        //// The side covers the point in the future
        //if (intersection.s < 0) {
        //  intersections.push(Number.POSITIVE_INFINITY)
        //}
      }
      intersection = segmentSegmentIntersection({ x, y }, side, { x: pk.x + vk.x, y: pk.y + vk.y }, vi);
      if (intersection && intersection.t >= 0 && intersection.t <= 1) {
        intersections.push(-intersection.s);
      }
    }
  }
  var min = intersections.reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY);
  var max = intersections.reduce((a, b) => Math.max(a, b), Number.NEGATIVE_INFINITY);
  min = Math.max(min, 0);
  return interval(min, max);
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { raySegmentIntersection };

const segmentSegmentIntersection = __webpack_require__(8).segmentSegmentIntersection;
const interval = __webpack_require__(0).interval;

/*
pj, vj defines a ray
 */
function raySegmentIntersection(pi, vi, pj, vj) {
  const intersection = segmentSegmentIntersection(pj, vj, pi, vi);
  if (intersection === null) return interval.empty();
  const { t, s } = intersection;
  // t is time in ray, s parameter on the segment
  if (t <= 0 || s < 0 || s > 1) {
    return interval.empty();
  }
  return interval(t, Number.POSITIVE_INFINITY);
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = { segmentSegmentIntersection };
// A point pi moves with vi, a segment is defined with pj, vj, we find the time t at which the point intersects and returns parameters s on the segment
// TODO change order so that pj, vj is the ray
function segmentSegmentIntersection(pi, vi, pj, vj /*Vector of the segment */) {
  // (vi -vj)(t, s)^T = (pj - pi)
  var det = -(vi.x * vj.y - vj.x * vi.y);
  if (det === 0) {
    // Parallel lines
    // Test this
    if ((pi.x - pj.x) * vj.y - (pi.j - pj.y) * vj.x !== 0) return null; // Line does not belong
    // TODO concurrent lines
    throw new Error('Parallel lines not allowed'); // This must be handled out of the algorithm
  }
  const t = (-(pj.x - pi.x) * vj.y + (pj.y - pi.y) * vj.x) / det;
  const s = (-(pj.x - pi.x) * vi.y + (pj.y - pi.y) * vi.x) / det;
  return { t, s };
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = { compareArraysLexicographically, measure };

function compareArraysLexicographically(arr1, arr2) {
  var i = 0;
  while (i < Math.min(arr1.length, arr2.length)) {
    if (arr1[i] != arr2[i]) return arr1[i] - arr2[i];
    i++;
  }
  return arr1.length - arr2.length;
}

function measure(start, end) {
  return Math.pow(2, -start) - Math.pow(2, -end);
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// TODO use sets
let rayIntersection = (() => {
  var _ref = _asyncToGenerator(function* (pointsToLabel, pointsNotToLabel, isWebgl, webglExtra) {
    let { intersectionData, rectangleData } = webglExtra;
    const computeIntersection = webglExtra.computeIntersection;
    pointsToLabel.forEach(function (p) {
      return extendedPointMethods.updateAvailableSpace(p);
    });
    const rejectedPoints = _.filter(pointsToLabel, function (p) {
      return p.availableMeasure === 0;
    });
    // P in the article
    var remainingPoints = _.filter(pointsToLabel, function (p) {
      return p.availableMeasure > 0;
    });
    var P0 = pointsToLabel.concat(pointsNotToLabel);
    const pointsLabeled = []; // Here we differ from the original article, once we find a point in P to label we remove it from P and add it to pointsLabeled, otherwise the algorithm does not finish
    while (remainingPoints.length !== 0) {
      webglExtra = { computeIntersection, intersectionData, rectangleData };
      let bestRay = yield findBestRay.findBestRay(remainingPoints, pointsNotToLabel, isWebgl, webglExtra);
      let rij = bestRay.rbest;
      let pi = bestRay.pbest;
      intersectionData = bestRay.intersectionData;
      rectangleData = bestRay.rectangleData;
      const usedWebgl = bestRay.usedWebgl;
      if (rij === undefined) {
        // It could only happen that we get rij undefined in the first iteration
        if (pointsLabeled.length !== 0 || rejectedPoints.length !== 0) {
          throw new Error('Unexpected behaviour');
        }
        return { chosen: [], rejected: _.clone(pointsToLabel) };
      }
      let vi = { x: rij.vector.x * rij.available.getMin(), y: rij.vector.y * rij.available.getMin() };
      extendedPointMethods.promoteLabelToRectangle(pi, vi);
      //let index = pointsToLabel.findIndex(el => el === pi)
      remainingPoints = remainingPoints.filter(function (el) {
        return el !== pi;
      });
      P0 = P0.filter(function (el) {
        return el !== pi;
      });
      //P0 = P0.filter((el, i) => i!== index)
      //P = P.filter((el, i) => i!== index)
      pointsLabeled.push(pi);
      for (let pk of P0) {
        for (let rkl of pk.rays) {
          let labelIntersection;
          let segmentIntersection;
          if (usedWebgl) {
            const index = rkl.index + rij.selfIndex * 4;
            labelIntersection = interval(intersectionData[index], intersectionData[index + 1]);
            segmentIntersection = interval(intersectionData[index + 2], intersectionData[index + 3]);
          } else {
            const labelInterval = labelRectangleIntersection.labelRectangleIntersection(pi.rectangle, pk.label, rkl.vector, pk.position);
            const segmentInterval = labelSegmentIntersection.labelSegmentIntersection(pi.position, vi, pk.label, rkl.vector, pk.position);
            const rayInterval = rayRectangleIntersection(pi.rectangle, rkl.vector, pk.position);
            const raySegmentInterval = raySegmentIntersection(pi.position, vi, pk.position, rkl.vector);
            labelIntersection = labelInterval.coalesceInPlace(rayInterval);
            segmentIntersection = segmentInterval.coalesceInPlace(raySegmentInterval);
          }
          if (!labelIntersection.empty || !segmentIntersection.empty) {
            rkl.available.multipleRemove(multiInterval.coalesce(labelIntersection, segmentIntersection));
          }
        }
        extendedPointMethods.updateAvailableSpace(pk);

        // The original article is not very clear here. It removes the point from P but the iteration was on P0. I suppose that if the integral is 0 and the point is in P then it will be removed in the next iteration of the greedy algorithm
        if (pk.availableMeasure === 0 && remainingPoints.findIndex(function (el) {
          return el === pk;
        }) !== -1) {
          P0 = P0.filter(function (el) {
            return el !== pk;
          });
          remainingPoints = remainingPoints.filter(function (el) {
            return el !== pk;
          });
          rejectedPoints.push(pk);
        }
      }
    }
    return { chosen: pointsLabeled, rejected: rejectedPoints };
  });

  return function rayIntersection(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = { rayIntersection };

const findBestRay = __webpack_require__(13);
const extendedPointMethods = __webpack_require__(3);
const multiInterval = __webpack_require__(4).multiInterval;
const interval = __webpack_require__(0).interval;
// Better to grab the module here and fetch the method in the algorithm, that way we can stub
const labelRectangleIntersection = __webpack_require__(2);
const labelSegmentIntersection = __webpack_require__(6);
const rayRectangleIntersection = __webpack_require__(5).rayRectangleIntersection;
const raySegmentIntersection = __webpack_require__(7).raySegmentIntersection;
const _ = __webpack_require__(1);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { setUp };

const mainFragment = __webpack_require__(17).mainFragment;
const utils = __webpack_require__(23);
const _ = __webpack_require__(1);

/**
 *
 * @param extendedPoints array of objects with label and position
 * @param numberOfRays number of rays per point
 * @returns {Float32Array}
 */
function setUp(extendedPoints, numberOfRays) {
  const gl = createGl();
  // For each extended point and each direction we save four data
  const size = computeTexturesSize(extendedPoints.length * numberOfRays * numberOfRays);

  // Four corners of the square
  var positionBuffer = newBuffer(gl, [-1, -1, 1, -1, 1, 1, -1, 1]);
  var textureBuffer = newBuffer(gl, [0, 0, 1, 0, 1, 1, 0, 1]);
  var indexBuffer = newBuffer(gl, [1, 2, 0, 3, 0, 2], Uint16Array, gl.ELEMENT_ARRAY_BUFFER);

  const { vertexShader, transformFragmentShader } = getShaders(gl, size, numberOfRays);

  const pointsData = new Float32Array(size * size * 4);
  for (let i = 0; i < extendedPoints.length; i++) {
    const point = extendedPoints[i];
    for (let j = 0; j < numberOfRays; j++) {
      for (let k = 0; k < numberOfRays; k++) {
        const index = numberOfRays * numberOfRays * i * 4 + j * 4 * numberOfRays + k * 4;
        pointsData[index] = point.position.x;
        pointsData[index + 1] = point.position.y;
        pointsData[index + 2] = point.label.height;
        pointsData[index + 3] = point.label.width;
      }
    }
  }
  var pointsTexture = createTexture(gl, pointsData, size);

  const radiusData = new Float32Array(size * size * 4);
  utils.computeRays(radiusData, extendedPoints.length, numberOfRays);
  // We will fill with sin and cos later in the setup
  var radiusTexture = createTexture(gl, radiusData, size);

  const rectangleData = new Float32Array(size * size * 4);
  const rectangleTexture = createTexture(gl, rectangleData, size);

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, transformFragmentShader);
  gl.linkProgram(program);

  const uPointsTexture = gl.getUniformLocation(program, 'u_points_texture');
  const uRadiusTexture = gl.getUniformLocation(program, 'u_radius_texture');
  const uLabelTexture = gl.getUniformLocation(program, 'u_label_texture');
  const uRectangleTexture = gl.getUniformLocation(program, 'u_rectangle_texture');
  const uRectanglePoint = gl.getUniformLocation(program, 'u_rect_point');
  const aPosition = gl.getAttribLocation(program, 'position');
  const aTexture = gl.getAttribLocation(program, 'texture');

  gl.useProgram(program);
  gl.viewport(0, 0, size, size);
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.createFramebuffer());

  var nTexture = createTexture(gl, new Float32Array(size * size * 4), size);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, nTexture, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, pointsTexture);
  gl.uniform1i(uPointsTexture, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, radiusTexture);
  gl.uniform1i(uRadiusTexture, 1);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, rectangleTexture);
  gl.uniform1i(uRectangleTexture, 2);

  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);

  gl.enableVertexAttribArray(aTexture);
  gl.vertexAttribPointer(aTexture, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const intersectionData = new Float32Array(size * size * 4);
  var labelData = new Float32Array(4);
  var rectanglePoint = new Float32Array(4);

  gl.bindTexture(gl.TEXTURE_2D, rectangleTexture);
  return {
    radiusData,
    intersectionData,
    computeIntersection,
    rectangleData
  };
  // TODO change program


  // Rectangle, then pi
  function computeIntersection(rectangleData, pix, piy, intersectionData) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, rectangleData);
    //gl.uniform4fv(uLabelTexture, labelData)
    rectanglePoint[0] = pix;
    rectanglePoint[1] = piy;
    gl.uniform4fv(uRectanglePoint, rectanglePoint);
    redraw(gl);
    gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, intersectionData);
    return { intersectionData, rectangleData };
  }
}

function createTexture(gl, data, size) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, data);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

function getShaders(gl, size, numberOfRays) {

  var vertexShaderCode = `
  attribute vec2 position;
  varying vec2 pos;
  attribute vec2 texture;

  void main (void) {
    pos = texture;
    gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;
  // Compute sin and cos for radius shader
  var transformFragmentShaderCode = mainFragment(size, numberOfRays);
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const transformFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.shaderSource(transformFragmentShader, transformFragmentShaderCode);

  gl.compileShader(vertexShader);
  gl.compileShader(transformFragmentShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) console.error('src/webgl/webgl.js:151:77:gl.getShaderInfoLog(vertexShader)', gl.getShaderInfoLog(vertexShader));
  if (!gl.getShaderParameter(transformFragmentShader, gl.COMPILE_STATUS)) console.error('src/webgl/webgl.js:152:88:transformFragmentShaderCode,gl.getShaderInfoLog(transformFragmentShader)', transformFragmentShaderCode, gl.getShaderInfoLog(transformFragmentShader));

  return {
    vertexShader,
    transformFragmentShader
  };
}
function newBuffer(gl, data, f, e) {
  var buf = gl.createBuffer();

  gl.bindBuffer(e || gl.ARRAY_BUFFER, buf);
  gl.bufferData(e || gl.ARRAY_BUFFER, new (f || Float32Array)(data), gl.STATIC_DRAW);

  return buf;
}
function computeTexturesSize(number) {
  // Taken from turbojs. Best size for textures is power of two, this is the closest size so that size * size * 4 is bigger than data size
  return 2 * Math.pow(2, Math.ceil(Math.log(number) / 1.386) - 1);
}

function redraw(gl) {
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}
function initGLFromCanvas(canvas) {
  let gl = null;
  let attr = { alpha: false, antialias: false };
  gl = canvas.getContext('webgl', attr);
  if (!gl) throw new Error('Could not start webgl');
  if (!gl.getExtension('OES_texture_float')) throw new Error('Cannot output floats');
  return gl;
}

function createGl() {
  // TODO probably remove at the end
  return initGLFromCanvas(document.createElement('canvas'));
}

function initVertexBuffer(gl) {
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Cover four cornes so that initial value is constant all over the canvas
  const vertices = [1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return vertexBuffer;
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {


// TODO add the possibility to own score function
/**
 *
 * @param greedyAlgorithm function that receives two arrays, one of elements to be computed and one for the points for the rest of the iterations.
 * It returns an object with two elements, chosen and rejected
 * @param startingData starting array of elements
 * @param resetFunction function to be applied to each element at the start of each iteration
 * @param params extra params
 */
let iterativeGreedyAlgorithm = (() => {
  var _ref = _asyncToGenerator(function* (greedyAlgorithm, startingData, resetFunction, params = {}) {
    const MAX_NUMBER_OF_ITERATIONS = _.isNumber(params.MAX_NUMBER_OF_ITERATIONS) ? params.MAX_NUMBER_OF_ITERATIONS : 100;
    // At every loop if we improve the result then we apply serialize function to the result to save a copy
    const serializeFunction = _.isFunction(params.serializeFunction) ? params.serializeFunction : _.cloneDeep;
    // In the greedy queue we store all the elements in array in reverse order of execution
    const greedyQueue = [startingData];
    let bestGreedyQueue = [];
    let bestScore = 0;
    for (let j = 0; j < MAX_NUMBER_OF_ITERATIONS; j++) {
      let iterationScore = 0;
      greedyQueue.forEach(function (collection) {
        collection.forEach(function (element) {
          resetFunction.call(element, element);
        });
      });
      const n = greedyQueue.length;
      for (let i = n - 1; i >= 0; i--) {
        const { chosen, rejected } = yield greedyAlgorithm(greedyQueue[i], _.flatten(greedyQueue.slice(0, i)));
        iterationScore += chosen.length;
        if (chosen.length !== 0) {
          greedyQueue[i] = chosen;
          // end of the queue
          if (i === n - 1) {
            if (rejected.length) {
              greedyQueue.push(rejected);
            }
          } else {
            greedyQueue[i + 1] = [...greedyQueue[i + 1], ...rejected];
          }
        } else {
          // If chosen.length === 0 then these elements could not be assigned even at the beginning of the queue, we should get rid of them
          if (i !== n - 1) {
            greedyQueue[i] = greedyQueue[i + 1];
            greedyQueue[i + 1] = rejected;
          }
        }
      }
      if (iterationScore > bestScore) {
        bestScore = iterationScore;
        // There must be a better way to store the result
        // Plus the name is a bit tricky, one expects that the algorithm in it pass sets the elements
        bestGreedyQueue = serializeFunction(_.flatten(greedyQueue));
      }
      if (iterationScore === _.sumBy(greedyQueue, 'length')) {
        return bestGreedyQueue;
      }
    }
    return bestGreedyQueue;
  });

  return function iterativeGreedyAlgorithm(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = { solve: iterativeGreedyAlgorithm };

const _ = __webpack_require__(1);

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// pixels

let findBestRay = (() => {
  var _ref = _asyncToGenerator(function* (pointsToLabel, pointsNotToLabel, isWebgl, webglExtra) {
    let { intersectionData, rectangleData } = webglExtra;
    const computeIntersection = webglExtra.computeIntersection;
    // We follow the article page 4 Algorithm 1
    var P = pointsToLabel;
    var P0 = pointsNotToLabel.concat(pointsToLabel);
    // int P min in the article
    var minimumAvailableSpace = Number.POSITIVE_INFINITY;
    var rbest;
    var Vbest;
    var pbest; // This is not in the original algorithm but allows to easily find the corresponding point
    P0.forEach(function (p) {
      return extendedPointMethods.updateAvailableSpace(p);
    });
    P.forEach(function (p) {
      return extendedPointMethods.updateMinima(p);
    });
    const pi = _.minBy(P, 'availableMeasure');
    let mindik = _.minBy(pi.rays, 'minimum').minimum;
    let R = pi.rays.filter(function (r) {
      return r.availableMeasure > 0;
    });
    if (isWebgl) {
      R.forEach(function (rij) {
        const index = 4 * rij.selfIndex;
        let segment = { x: rij.vector.x * rij.minimum, y: rij.vector.y * rij.minimum };
        const rectangle = extendedPointMethods.translateLabel(pi, segment);
        rectangleData[index] = rectangle.top;
        rectangleData[index + 1] = rectangle.left;
        rectangleData[index + 2] = rectangle.bottom;
        rectangleData[index + 3] = rectangle.right;
      });
      ({ intersectionData, rectangleData } = yield computeIntersection(rectangleData, pi.position.x, pi.position.y, intersectionData));
    }
    rijloop: for (let rij of R) {
      let Vij = [];
      let segment = { x: rij.vector.x * rij.minimum, y: rij.vector.y * rij.minimum };
      const rectangle = extendedPointMethods.translateLabel(pi, segment);
      for (let pk of P0) {
        if (pk === pi) continue;
        // No sense to wait for the intersection if rbest is defined

        //int pk
        let availableSpace = pk.availableMeasure;
        // Not doing the preintersection here. Something fishy in the article, if preintersect is empty then  integral pk- is 0 which does not make much sense
        for (let rkl of pk.rays) {
          let labelIntersection;
          let segmentIntersection;
          if (isWebgl) {
            const index = rkl.index + rij.selfIndex * 4;
            labelIntersection = interval(intersectionData[index], intersectionData[index + 1]);
            segmentIntersection = interval(intersectionData[index + 2], intersectionData[index + 3]);
          } else {
            // We have split label rectangle intersection into two algorithms, label rectangle and label segment. Those two intervals should intersect since the segment intersects the rectangle, so we can coalesce the intervals
            const labelInterval = labelRectangleIntersection(rectangle, pk.label, rkl.vector, pk.position);
            const segmentInterval = labelSegmentIntersection(pi.position, segment, pk.label, rkl.vector, pk.position);
            const rayInterval = rayRectangleIntersection(rectangle, rkl.vector, pk.position);
            const raySegmentInterval = raySegmentIntersection(pi.position, segment, pk.position, rkl.vector);
            labelIntersection = labelInterval.coalesceInPlace(rayInterval);
            segmentIntersection = segmentInterval.coalesceInPlace(raySegmentInterval);
          }
          if (!labelIntersection.empty || !segmentIntersection.empty) {
            availableSpace -= rkl.available.measureMultipleIntersection(multiInterval.coalesce(labelIntersection, segmentIntersection));
          }
        }
        // This ray is not good because we try to maximize the minimum
        if (rbest && availableSpace < minimumAvailableSpace) {
          continue rijloop;
        }
        Vij.push(availableSpace);
      }
      Vij.sort(function (i, j) {
        return i - j;
      }); // order to compare in lexicographical order
      if (!Vbest || utils.compareArraysLexicographically(Vij, Vbest) < 0) {
        rbest = rij;
        Vbest = Vij;
        minimumAvailableSpace = _.min(Vij);
        pbest = pi;
      }
    }
    // We need to return intersectionData because the reference has been neutered in find ray intersection
    return { rbest: rbest, pbest: pbest, intersectionData, rectangleData, usedWebgl: isWebgl };
  });

  return function findBestRay(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = { findBestRay };

const _ = __webpack_require__(1);

const extendedPointMethods = __webpack_require__(3);
const labelRectangleIntersection = __webpack_require__(2).labelRectangleIntersection;
const labelSegmentIntersection = __webpack_require__(6).labelSegmentIntersection;
const rayRectangleIntersection = __webpack_require__(5).rayRectangleIntersection;
const raySegmentIntersection = __webpack_require__(7).raySegmentIntersection;
const multiInterval = __webpack_require__(4).multiInterval;
const interval = __webpack_require__(0).interval;
const utils = __webpack_require__(9);

const TOLERANCE = 2;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/*
Given a point and a segment we find the intersection of the ray defined by the segment. If the point intersects the ray at a then we consider (a, infinity) to be the intersection
 */
module.exports = { pointSegmentIntersection };
var interval = __webpack_require__(0).interval;
function pointSegmentIntersection(pi, pk, vk) {
  var det = (pi.x - pk.x) * vk.y - (pi.y - pk.y) * vk.x;
  // point is not contained in the line
  if (det !== 0) return interval.empty();
  var intersectionPoint;
  if (vk.y !== 0) intersectionPoint = (pi.y - pk.y) / vk.y;else if (vk.x !== 0) intersectionPoint = (pi.x - pk.x) / vk.x;
  if (intersectionPoint < 0) return interval.empty();
  return interval(intersectionPoint, Number.POSITIVE_INFINITY);
}

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = { labelRectangleIntersectionFragment };

function labelRectangleIntersectionFragment() {
  return `
  // min max of the interval
  // rectangle has top, left, bottom, right
  // label height width
  // ray x y
  // returns -1,-1 if empty
  vec2 label_rectangle_intersection (vec4 rectangle, vec2 label, vec2 ray, vec2 point) {
    float my_min = 0.;
    float my_max = infinity;
    float rectangle_height = (rectangle.r - rectangle.b);
    float rectangle_width = (rectangle.a - rectangle.g);
    if (ray.y != 0.) {
      float firstIntersection = (rectangle_height / 2. + label.x / 2. + (rectangle.r + rectangle.b) / 2. - point.y) / ray.y;
      float secondIntersection = (- rectangle_height / 2. - label.x / 2. + (rectangle.r + rectangle.b) / 2. - point.y) / ray.y;
      // Multiplying by a negative sign reverses an inequality
      if (ray.y > 0.) {
        my_max = min(my_max, firstIntersection);
        my_min = max(my_min, secondIntersection);
      } else {
        my_min = max(my_min, firstIntersection);
        my_max = min(my_max, secondIntersection);
      }
    } else {
      // vector is vertical and they will never intersect
      if (point.y - (rectangle.r + rectangle.b) / 2. > rectangle_height / 2. + label.x / 2.) {
        return vec2(-1., -1.);
      }
      if (point.y - (rectangle.r + rectangle.b) / 2. < - rectangle_height / 2. - label.x / 2.) {
        return vec2(-1., -1.);
      }
    }
    if (ray.x != 0.) {
      float thirdIntersection = (rectangle_width / 2. + label.y / 2. + (rectangle.a + rectangle.g) / 2. - point.x) / ray.x;
      float fourthIntersection = (- rectangle_width / 2. - label.y / 2. + (rectangle.a + rectangle.g) / 2. - point.x) / ray.x;
      if (ray.x > 0.) {
        my_max = min(my_max, thirdIntersection);
        my_min = max(my_min, fourthIntersection);
      } else {
        my_min = max(my_min, thirdIntersection);
        my_max = min(my_max, fourthIntersection);
      }
    } else {
      if (point.x - (rectangle.a + rectangle.g) / 2. > rectangle_width / 2. + label.y / 2.) {
        return vec2(-1., -1.);
      }
      if (point.x - (rectangle.a + rectangle.g) / 2. < -rectangle_width / 2. - label.y / 2.) {
        return vec2(-1., -1.);
      }
    }
    if (my_min >= my_max) {
      return vec2(-1., -1.);
    }
    return vec2(my_min, my_max);
    }
  `;
}

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = { labelSegmentIntersectionFragment };

function labelSegmentIntersectionFragment() {
  return `
    vec2 label_segment_intersection (vec2 segment_point, vec2 segment, vec2 label, vec2 ray, vec2 point) {
          // Translate so that ray starts at origin
          vec2 pk = segment_point - point;
          float my_min = infinity;
          float my_max = 0.;
          for (float i = -1.; i < 1.5; i += 2.) {
          // label.y is width
          float x = i * label.y / 2.;
          for (float j = -1.; j < 1.5; j += 2.) {
            float y = j * label.x / 2.;
            bool intersects;
            intersects = segment_segment_intersects(vec2(x, y), ray, pk, segment);
            if (intersects) {
              vec2 intersection = segment_segment_intersection(vec2(x, y), ray, pk, segment);
              if (intersection.y >= 0. && intersection.y <= 1.) {
                my_max = max(my_max, intersection.x);
                my_min = min(my_min, intersection.x);
              }
            }
            // Given a point, we take the side coming from it in counter clockwise
            vec2 side;
            if (x * y < 0.) {
              side = vec2(0., -2. * y);
            } else {
              side = vec2(-2. * x, 0.);
            }
            if (segment_segment_intersects(vec2(x, y), side, pk, ray)) {
              vec2 intersection = segment_segment_intersection(vec2(x, y), side, pk, ray);
              if (intersection.x >= 0. && intersection.x <= 1.) {
                my_max = max(my_max, -intersection.y);
                my_min = min(my_min, -intersection.y);
              }

            }
            vec2 translated_point = pk + segment;
            if (segment_segment_intersects(vec2(x, y), side, translated_point, ray)) {
              vec2 intersection = segment_segment_intersection(vec2(x, y), side, translated_point, ray);
              if (intersection.x >=0. && intersection.x <= 1.) {
                my_max = max(my_max, -intersection.y);
                my_min = min(my_min, -intersection.y);
              }
            }
          }
        }
        if (my_max == 0.) {
          return vec2(-1., -1.);
        }
        my_min = max(my_min, 0.);
        return vec2(my_min, my_max);
    }
  `;
}

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { mainFragment };

const mainIntersectionFragment = __webpack_require__(18);
const segmentSegmentIntersectsFragment = __webpack_require__(22);
const segmentSegmentIntersectionFragment = __webpack_require__(21);
const labelRectangleIntersectionFragment = __webpack_require__(15);
const labelSegmentIntersectionFragment = __webpack_require__(16);
const rayRectangleIntersectionFragment = __webpack_require__(19);
const raySegmentIntersectionFragment = __webpack_require__(20);
function mainFragment(size, numberOfRays) {
  return `
  precision mediump float;
  // we are in clamped mode so we are ok
  float infinity = 1./0.0000001;
  uniform sampler2D u_points_texture;
  uniform sampler2D u_radius_texture;
  uniform sampler2D u_rectangle_texture;
  uniform vec4 u_label_texture;
  uniform vec4 u_rect_point;
  varying vec2 pos;
  float get_index (void) {
    return (pos.x * ${ size * 2 }. -1.)/2. + ${ size }.0 * (pos.y * ${ size * 2 }. - 1.)/2.;
  }
  vec2 get_rectangle_index (void) {
    return vec2((mod(get_index(), ${ numberOfRays }.0) + 0.5) / (${ size }.), 1./ ${ 2 * size }.);
  }
  vec4 read_point (void) {
    return texture2D(u_points_texture, pos);
  }
  vec2 read_radius (void) {
    return texture2D(u_radius_texture, pos).rg;
  }
  vec4 read_rectangle (void) {
    return texture2D(u_rectangle_texture,  get_rectangle_index());
  }
  vec4 read_rectangle_point (void) {
    return u_rect_point;
  }
  void commit (vec4 val) {
    gl_FragColor = val;
  }
  ${ segmentSegmentIntersectsFragment.segmentSegmentIntersectsFragment() }
  ${ segmentSegmentIntersectionFragment.segmentSegmentIntersectionFragment() }
  ${ labelRectangleIntersectionFragment.labelRectangleIntersectionFragment() }
  ${ labelSegmentIntersectionFragment.labelSegmentIntersectionFragment() }
  ${ rayRectangleIntersectionFragment.rayRectangleIntersectionFragment() }
  ${ raySegmentIntersectionFragment.raySegmentIntersectionFragment() }
  ${ mainIntersectionFragment.mainIntersectionFragment(size, numberOfRays) }
  `;
}

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = { mainIntersectionFragment };

function mainIntersectionFragment(size, numberOfRays) {
  return `void main (void) {
    vec4 point = read_point();
    vec2 radius = read_radius();
    vec4 rect = read_rectangle();
    vec4 rect_point = read_rectangle_point();
    vec2 segment = (rect.ar + rect.gb) / 2. - rect_point.rg;
    vec2 label_interval = label_rectangle_intersection(rect, point.ba, radius, point.rg);
    vec2 segment_interval = label_segment_intersection(rect_point.xy, segment, point.ba, radius, point.rg);
    vec2 ray_interval = ray_rectangle_intersection(rect, radius, point.rg);
    vec2 ray_segment_interval = ray_segment_intersection(rect_point.xy, segment, point.rg, radius);

    vec2 label_intersection;
    vec2 segment_intersection;
    // if ray intervals are not empty then normal intervals are not empty. Hence we only need to consider rays emptiness
    if (ray_interval.x < 0.) {
      label_intersection = label_interval;
    } else {
      label_intersection = vec2(min(label_interval.x, ray_interval.x), max(label_interval.y, ray_interval.y));
    }
    if (ray_segment_interval.x < 0.) {
      segment_intersection = segment_interval;
    } else {
      segment_intersection = vec2(min(segment_interval.x, ray_segment_interval.x), max(segment_interval.y, ray_segment_interval.y));
    }

    commit(vec4(label_intersection, segment_intersection));
  }`;
}

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = { rayRectangleIntersectionFragment };
function rayRectangleIntersectionFragment() {
  return `
  vec2 ray_rectangle_intersection (vec4 rectangle, vec2 ray, vec2 ray_point) {
    vec2 fake_label = vec2(0., 0.);
    vec2 intersection = label_rectangle_intersection(rectangle, fake_label, ray, ray_point);
    // empty
    if (intersection.x < 0.) {
      return intersection;
    }
    return vec2(intersection.x, infinity);
  }
  `;
}

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = { raySegmentIntersectionFragment };
function raySegmentIntersectionFragment() {
  return `vec2 ray_segment_intersection(vec2 segment_point, vec2 segment, vec2 ray_point, vec2 ray) {
    if (!segment_segment_intersects(ray_point, ray, segment_point, segment)) {
      return vec2(-1., -1.);
    }
    vec2 intersection = segment_segment_intersection(ray_point, ray, segment_point, segment);
    if (intersection.x <=0. || intersection.y < 0. || intersection.y > 1.) {
      return vec2(-1., -1.);
    }
    return vec2(intersection.x, infinity);
  }
  `;
}

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = { segmentSegmentIntersectionFragment };

function segmentSegmentIntersectionFragment() {
  return `
  vec2 segment_segment_intersection (vec2 ray_point, vec2 ray, vec2 segment_point, vec2 segment) {
    // This assumes that rays already intersect
      float det = - (ray.x* segment.y - segment.x * ray.y);
      float t = (-(segment_point.x - ray_point.x) * segment.y + (segment_point.y - ray_point.y) * segment.x) / det;
      float s = (-(segment_point.x - ray_point.x) * ray.y + (segment_point.y - ray_point.y) * ray.x) / det;
      return vec2(t, s);
  }
  `;
}

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = { segmentSegmentIntersectsFragment };

function segmentSegmentIntersectsFragment() {
  return `
  bool segment_segment_intersects (vec2 ray_point, vec2 ray, vec2 segment_point, vec2 segment) {
   // TODO handle parallel concurrent lines
    return (ray.x * segment.y - ray.y * segment.x) != 0.;
  }
  `;
}

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = { computeRays };
function computeRays(radiusData, numberOfPoints, numberOfRays) {
  for (let i = 0; i < numberOfPoints; i++) {
    for (let j = 0; j < numberOfRays; j++) {
      for (let k = 0; k < numberOfRays; k++) {
        const index = numberOfRays * numberOfRays * i * 4 + numberOfRays * j * 4 + k * 4;
        radiusData[index] = Math.sin(2 * Math.PI * j / numberOfRays);
        radiusData[index + 1] = Math.cos(2 * Math.PI * j / numberOfRays);
      }
    }
  }
}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { mainAlgorithm };

importScripts('https://cdn.jsdelivr.net/lodash/4.17.4/lodash.min.js');
const extendedPointMethods = __webpack_require__(3);
const rayIntersection = __webpack_require__(10).rayIntersection;
//const _ = require('lodash')
const iterativeGreedy = __webpack_require__(12);
const webgl = __webpack_require__(11);
let NUMBER_OF_RAYS;
// In this object we register the callbacks for computations in the main thread (gpu case)
const callbacks = {};
// Called as webworker
if (typeof postMessage !== 'undefined') {
  onmessage = function (event) {
    var data = event.data;
    switch (data.type) {
      case 'start':
        launchMainAlgorithmFromEvent(event);
        break;
      case 'computeIntersection':
        returnGPUComputation(event);
        break;
      default:
        console.error('src/main-algorithm.js:24:22:\'Not a valid event type\',data.type', 'Not a valid event type', data.type);
    }
  };
}

function returnGPUComputation(event) {
  const uuid = event.data.uuid;
  if (_.isFunction(callbacks[uuid])) {
    callbacks[uuid](event);
    delete callbacks[uuid];
  } else {
    console.error('src/main-algorithm.js:35:18:\'Callback should be a function, uuid:\',uuid', 'Callback should be a function, uuid:', uuid);
  }
}

function launchMainAlgorithmFromEvent(event) {
  const data = event.data;
  const extendedPoints = data.extendedPoints;
  const params = data.params;
  const processUUID = data.processUUID; // we use this in case the algorihm is required several times
  if (params.isWebgl) {
    params.intersectionData = data.intersectionData;
    params.rectangleData = data.rectangleData;
    params.computeIntersection = _.partialRight(computeIntersectionWithGPU, processUUID);
  }
  mainAlgorithm(extendedPoints, params).then(function (result) {
    postMessage({
      type: 'end',
      processUUID,
      result
    });
  });
}

function computeIntersectionWithGPU(rectangleData, pix, piy, intersectionData, processUUID) {
  var uuid = parseInt(Math.random() * 1000000).toString(); // no need for anything fancy
  return new Promise(function (resolve, reject) {
    postMessage({
      type: 'computeIntersection',
      rectangleData,
      pix,
      piy,
      intersectionData,
      uuid,
      processUUID
    }, [rectangleData.buffer, intersectionData.buffer]);
    callbacks[uuid] = function (event) {
      resolve({ intersectionData: event.data.intersectionData, rectangleData: event.data.rectangleData });
    };
  });
}

function mainAlgorithm(extendedPoints, params = {}) {
  NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3;
  const MAX_NUMBER_OF_ITERATIONS = _.isNumber(params.MAX_NUMBER_OF_ITERATIONS) ? params.MAX_NUMBER_OF_ITERATIONS : 1;
  const isWebgl = params.isWebgl;
  computeRays(extendedPoints);
  var intersectionData, computeIntersection, rectangleData;
  if (isWebgl && !params.intersectionData) {
    ({ intersectionData, computeIntersection, rectangleData } = webgl.setUp(extendedPoints, NUMBER_OF_RAYS));
  } else if (isWebgl && params.intersectionData) {
    ({ intersectionData, computeIntersection, rectangleData } = params);
  }
  extendedPointMethods.computeInitialAvailabeSpaces(extendedPoints, { radius: params.radius || 2, bbox: params.bbox });
  extendedPoints.forEach(function (p) {
    extendedPointMethods.resetAvailableSpace(p);
    extendedPointMethods.updateAvailableSpace(p);
  });
  const possiblePoints = extendedPoints.filter(p => p.availableMeasure > 0);
  return iterativeGreedy.solve(_.partialRight(rayIntersection, isWebgl, { intersectionData, computeIntersection, rectangleData }), possiblePoints, resetFunction, { serializeFunction, MAX_NUMBER_OF_ITERATIONS });
}

function computeRays(extendedPoints) {
  for (let i = 0; i < extendedPoints.length; i++) {
    let pi = extendedPoints[i];
    pi.rays = [];
    for (let j = 0; j < NUMBER_OF_RAYS; j++) {
      pi.rays.push({
        index: i * NUMBER_OF_RAYS * NUMBER_OF_RAYS * 4 + j * NUMBER_OF_RAYS * 4,
        selfIndex: j,
        vector: {
          x: Math.sin(2 * Math.PI * j / NUMBER_OF_RAYS),
          y: Math.cos(2 * Math.PI * j / NUMBER_OF_RAYS)
        }
      });
    }
  }
}

// At each iteration of iterative greedy if the solution is better we serialize what we obtained
function serializeFunction(arrayOfPoints) {
  // When we label a point we promote label to rectangle and we reset it at each iteration
  const labeledPoints = arrayOfPoints.filter(point => !!point.rectangle);
  // To serialize we need an id
  return labeledPoints.map(point => {
    return { id: point.id, rectangle: _.clone(point.rectangle) };
  });
}

// At each iteration of iterative greedy we reset the conditions
function resetFunction(generalizedPoint) {
  generalizedPoint.rectangle = null;
  extendedPointMethods.resetAvailableSpace(generalizedPoint);
}

/***/ })
/******/ ]);