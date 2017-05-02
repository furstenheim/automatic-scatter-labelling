(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.automaticScatterLabelling = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
const lodash = typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null;
const mainAlgorithmLoader = require('./src/main-algorithm-loader');
module.exports = mainAlgorithmLoader.mainAlgorithm;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./src/main-algorithm-loader":9}],2:[function(require,module,exports){


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
    const MAX_NUMBER_OF_ITERATIONS = typeof params.MAX_NUMBER_OF_ITERATIONS === 'number' ? params.MAX_NUMBER_OF_ITERATIONS : 100;
    // At every loop if we improve the result then we apply serialize function to the result to save a copy
    const serializeFunction = typeof params.serializeFunction === 'function' ? params.serializeFunction : function (x) {
      return JSON.parse(JSON.stringify(x));
    };
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
        const { chosen, rejected } = yield greedyAlgorithm(greedyQueue[i], flatten(greedyQueue.slice(0, i)));
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
        bestGreedyQueue = serializeFunction(flatten(greedyQueue));
      }
      const greedyQueueLength = greedyQueue.reduce(function (length, array) {
        return length + array.length;
      }, 0);
      if (iterationScore === greedyQueueLength) {
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

function flatten(arrays) {
  return arrays.reduce((a1, a2) => a1.concat(a2), []);
}
},{}],3:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn, options) {
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp && exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'], (
            // try to call default if defined to also support babel esmodule
            // exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);'
        )),
        scache
    ];

    var workerSources = {};
    resolveSources(skey);

    function resolveSources(key) {
        workerSources[key] = true;

        for (var depPath in sources[key][1]) {
            var depKey = sources[key][1][depPath];
            if (!workerSources[depKey]) {
                resolveSources(depKey);
            }
        }
    }

    var src = '(' + bundleFn + ')({'
        + Object.keys(workerSources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    var blob = new Blob([src], { type: 'text/javascript' });
    if (options && options.bare) { return blob; }
    var workerUrl = URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    worker.objectURL = workerUrl;
    return worker;
};

},{}],4:[function(require,module,exports){
'use strict';

module.exports = {
  updateAvailableSpace,
  promoteLabelToRectangle,
  computeInitialAvailabeSpaces,
  resetAvailableSpace,
  updateMinima,
  translateLabel
};

const labelRectangleIntersection = require('./label-rectangle-intersection').labelRectangleIntersection;
const rayRectangleIntersection = require('./ray-rectangle-intersection').rayRectangleIntersection;
const multiInterval = require('./multi-interval').multiInterval;
const interval = require('./interval').interval;
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

},{"./interval":6,"./label-rectangle-intersection":7,"./multi-interval":11,"./ray-rectangle-intersection":13}],5:[function(require,module,exports){
(function (global){
'use strict';

module.exports = { findBestRay };

const _ = typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null;

const extendedPointMethods = require('./extended-point-methods');
const labelRectangleIntersection = require('./label-rectangle-intersection').labelRectangleIntersection;
const labelSegmentIntersection = require('./label-segment-intersection').labelSegmentIntersection;
const rayRectangleIntersection = require('./ray-rectangle-intersection').rayRectangleIntersection;
const raySegmentIntersection = require('./ray-segment-intersection').raySegmentIntersection;
const multiInterval = require('./multi-interval').multiInterval;
const utils = require('./utils');

async function findBestRay(pointsToLabel, pointsNotToLabel) {
  // We follow the article page 4 Algorithm 1
  var P = pointsToLabel;
  var P0 = pointsNotToLabel.concat(pointsToLabel);
  // int P min in the article
  var minimumAvailableSpace = Number.POSITIVE_INFINITY;
  var rbest;
  var Vbest;
  var pbest; // This is not in the original algorithm but allows to easily find the corresponding point
  P0.forEach(p => extendedPointMethods.updateAvailableSpace(p));
  P.forEach(p => extendedPointMethods.updateMinima(p));
  const pi = _.minBy(P, 'availableMeasure');
  let mindik = _.minBy(pi.rays, 'minimum').minimum;
  let R = pi.rays.filter(r => r.availableMeasure > 0);
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
        // We have split label rectangle intersection into two algorithms, label rectangle and label segment. Those two intervals should intersect since the segment intersects the rectangle, so we can coalesce the intervals
        const labelInterval = labelRectangleIntersection(rectangle, pk.label, rkl.vector, pk.position);
        const segmentInterval = labelSegmentIntersection(pi.position, segment, pk.label, rkl.vector, pk.position);
        const rayInterval = rayRectangleIntersection(rectangle, rkl.vector, pk.position);
        const raySegmentInterval = raySegmentIntersection(pi.position, segment, pk.position, rkl.vector);
        labelIntersection = labelInterval.coalesceInPlace(rayInterval);
        segmentIntersection = segmentInterval.coalesceInPlace(raySegmentInterval);
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
    Vij.sort((i, j) => i - j); // order to compare in lexicographical order
    if (!Vbest || utils.compareArraysLexicographically(Vij, Vbest) < 0) {
      rbest = rij;
      Vbest = Vij;
      minimumAvailableSpace = _.min(Vij);
      pbest = pi;
    }
  }
  // We need to return intersectionData because the reference has been neutered in find ray intersection
  return { rbest: rbest, pbest: pbest };
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./extended-point-methods":4,"./label-rectangle-intersection":7,"./label-segment-intersection":8,"./multi-interval":11,"./ray-rectangle-intersection":13,"./ray-segment-intersection":14,"./utils":16}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
'use strict';

var interval = require('./interval').interval;
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

},{"./interval":6}],8:[function(require,module,exports){
'use strict';
// Find interval in which an interval and a segment intersect

module.exports = { labelSegmentIntersection };

var segmentSegmentIntersection = require('./segment-segment-intersection').segmentSegmentIntersection;
var interval = require('./interval').interval;

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

},{"./interval":6,"./segment-segment-intersection":15}],9:[function(require,module,exports){
(function (global){
module.exports = { mainAlgorithm };
const work = require('webworkify');
const algorithm = work(require('./main-algorithm.js'));
const _ = typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null;
const promiseResolutions = {};
function mainAlgorithm(extendedPoints, params = {}) {
  return new Promise(function (resolve, reject) {
    extendedPoints = extendedPoints.map(p => {
      return {
        id: p.id,
        position: {
          x: p.position.x,
          y: -p.position.y // The algorithm expects y to grow upwards
        },
        label: p.label
      };
    });
    const processUUID = parseInt(Math.random() * 1000000).toString(); // no need for anything fancy
    algorithm.postMessage({
      type: 'start',
      extendedPoints,
      params,
      processUUID
    });
    promiseResolutions[processUUID] = function (event) {
      const result = event.data.result.map(p => {
        return {
          id: p.id,
          rectangle: {
            left: p.rectangle.left,
            right: p.rectangle.right,
            top: -p.rectangle.top,
            bottom: -p.rectangle.bottom
          }
        };
      });
      return resolve(result);
    };
  });
}
algorithm.onmessage = function (event) {
  const data = event.data;
  switch (data.type) {
    case 'end':
      endEvent(event);
      break;
    default:
      console.error('src/main-algorithm-loader.js:48:20:\'This event case should not happen\',data.type', 'This event case should not happen', data.type);
  }
};

function endEvent(event) {
  const { processUUID } = event.data;
  const callback = promiseResolutions[processUUID];
  callback(event);
  delete promiseResolutions[processUUID];
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./main-algorithm.js":10,"webworkify":3}],10:[function(require,module,exports){
(function (global){
let NUMBER_OF_RAYS;
// Called as webworker
module.exports = function (self) {
  importScripts('https://cdn.jsdelivr.net/lodash/4.17.4/lodash.min.js');
  const extendedPointMethods = require('./extended-point-methods');
  const _ = typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null;
  const rayIntersection = require('./ray-intersection').rayIntersection;
  const iterativeGreedy = require('iterative-greedy');
  if (typeof postMessage !== 'undefined') {
    self.onmessage = function (event) {
      var data = event.data;
      switch (data.type) {
        case 'start':
          launchMainAlgorithmFromEvent(event);
          break;
        default:
          console.error('src/main-algorithm.js:17:24:\'Not a valid event type\',data.type', 'Not a valid event type', data.type);
      }
    };
  }

  function launchMainAlgorithmFromEvent(event) {
    const data = event.data;
    const extendedPoints = data.extendedPoints;
    const params = data.params;
    const processUUID = data.processUUID; // we use this in case the algorihm is required several times
    mainAlgorithm(extendedPoints, params).then(function (result) {
      postMessage({
        type: 'end',
        processUUID,
        result
      });
    });
  }

  function mainAlgorithm(extendedPoints, params = {}) {
    NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3;
    const MAX_NUMBER_OF_ITERATIONS = _.isNumber(params.MAX_NUMBER_OF_ITERATIONS) ? params.MAX_NUMBER_OF_ITERATIONS : 1;
    computeRays(extendedPoints);
    extendedPointMethods.computeInitialAvailabeSpaces(extendedPoints, { radius: params.radius || 2, bbox: params.bbox });
    extendedPoints.forEach(function (p) {
      extendedPointMethods.resetAvailableSpace(p);
      extendedPointMethods.updateAvailableSpace(p);
    });
    const possiblePoints = extendedPoints.filter(p => p.availableMeasure > 0);
    return iterativeGreedy.solve(_.partialRight(rayIntersection), possiblePoints, resetFunction, { serializeFunction, MAX_NUMBER_OF_ITERATIONS });
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
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./extended-point-methods":4,"./ray-intersection":12,"iterative-greedy":2}],11:[function(require,module,exports){
(function (global){
'use strict';

module.exports = { multiInterval };
const interval = require('./interval').interval;
const utils = require('./utils');
const _ = typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null;
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./interval":6,"./utils":16}],12:[function(require,module,exports){
(function (global){
'use strict';

module.exports = { rayIntersection };

const findBestRay = require('./find-best-ray');
const extendedPointMethods = require('./extended-point-methods');
const multiInterval = require('./multi-interval').multiInterval;
const interval = require('./interval').interval;
// Better to grab the module here and fetch the method in the algorithm, that way we can stub
const labelRectangleIntersection = require('./label-rectangle-intersection');
const labelSegmentIntersection = require('./label-segment-intersection');
const rayRectangleIntersection = require('./ray-rectangle-intersection').rayRectangleIntersection;
const raySegmentIntersection = require('./ray-segment-intersection').raySegmentIntersection;
const _ = typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null;

// TODO use sets
async function rayIntersection(pointsToLabel, pointsNotToLabel) {
  pointsToLabel.forEach(p => extendedPointMethods.updateAvailableSpace(p));
  const rejectedPoints = _.filter(pointsToLabel, p => p.availableMeasure === 0);
  // P in the article
  var remainingPoints = _.filter(pointsToLabel, p => p.availableMeasure > 0);
  var P0 = pointsToLabel.concat(pointsNotToLabel);
  const pointsLabeled = []; // Here we differ from the original article, once we find a point in P to label we remove it from P and add it to pointsLabeled, otherwise the algorithm does not finish
  while (remainingPoints.length !== 0) {
    let bestRay = await findBestRay.findBestRay(remainingPoints, pointsNotToLabel);
    let rij = bestRay.rbest;
    let pi = bestRay.pbest;
    if (rij === undefined) {
      // It could only happen that we get rij undefined in the first iteration
      if (pointsLabeled.length !== 0 || rejectedPoints.length !== 0) {
        throw new Error('Unexpected behaviour');
      }
      return { chosen: [], rejected: _.clone(pointsToLabel) };
    }
    let vi = { x: rij.vector.x * rij.available.getMin(), y: rij.vector.y * rij.available.getMin() };
    extendedPointMethods.promoteLabelToRectangle(pi, vi);
    remainingPoints = remainingPoints.filter(el => el !== pi);
    P0 = P0.filter(el => el !== pi);
    pointsLabeled.push(pi);
    for (let pk of P0) {
      for (let rkl of pk.rays) {
        let labelIntersection;
        let segmentIntersection;
        const labelInterval = labelRectangleIntersection.labelRectangleIntersection(pi.rectangle, pk.label, rkl.vector, pk.position);
        const segmentInterval = labelSegmentIntersection.labelSegmentIntersection(pi.position, vi, pk.label, rkl.vector, pk.position);
        const rayInterval = rayRectangleIntersection(pi.rectangle, rkl.vector, pk.position);
        const raySegmentInterval = raySegmentIntersection(pi.position, vi, pk.position, rkl.vector);
        labelIntersection = labelInterval.coalesceInPlace(rayInterval);
        segmentIntersection = segmentInterval.coalesceInPlace(raySegmentInterval);
        if (!labelIntersection.empty || !segmentIntersection.empty) {
          rkl.available.multipleRemove(multiInterval.coalesce(labelIntersection, segmentIntersection));
        }
      }
      extendedPointMethods.updateAvailableSpace(pk);

      // The original article is not very clear here. It removes the point from P but the iteration was on P0. I suppose that if the integral is 0 and the point is in P then it will be removed in the next iteration of the greedy algorithm
      if (pk.availableMeasure === 0 && remainingPoints.findIndex(el => el === pk) !== -1) {
        P0 = P0.filter(el => el !== pk);
        remainingPoints = remainingPoints.filter(el => el !== pk);
        rejectedPoints.push(pk);
      }
    }
  }
  return { chosen: pointsLabeled, rejected: rejectedPoints };
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./extended-point-methods":4,"./find-best-ray":5,"./interval":6,"./label-rectangle-intersection":7,"./label-segment-intersection":8,"./multi-interval":11,"./ray-rectangle-intersection":13,"./ray-segment-intersection":14}],13:[function(require,module,exports){
// Given a ray and a rectangle, return the interval from the intersection to infinity (it blocks the ray)
module.exports = { rayRectangleIntersection };
const labelRectangleIntersection = require('./label-rectangle-intersection').labelRectangleIntersection;
const interval = require('./interval').interval;

function rayRectangleIntersection(lk, vi, pi) {
  // Basically make a fake label of 0 height and width
  const li = { height: 0, width: 0 };
  const intersection = labelRectangleIntersection(lk, li, vi, pi);
  if (intersection.empty) {
    return intersection;
  }
  return interval(intersection.start, Number.POSITIVE_INFINITY);
}

},{"./interval":6,"./label-rectangle-intersection":7}],14:[function(require,module,exports){
module.exports = { raySegmentIntersection };

const segmentSegmentIntersection = require('./segment-segment-intersection').segmentSegmentIntersection;
const interval = require('./interval').interval;

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

},{"./interval":6,"./segment-segment-intersection":15}],15:[function(require,module,exports){
module.exports = { segmentSegmentIntersection };
// A point pi moves with vi, a segment is defined with pj, vj, we find the time t at which the point intersects and returns parameters s on the segment
// TODO change order so that pj, vj is the ray
function segmentSegmentIntersection(pi, vi, pj, vj /* Vector of the segment */) {
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

},{}],16:[function(require,module,exports){
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

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pdGVyYXRpdmUtZ3JlZWR5L2Rpc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd2Vid29ya2lmeS9pbmRleC5qcyIsInNyYy9leHRlbmRlZC1wb2ludC1tZXRob2RzLmpzIiwic3JjL2ZpbmQtYmVzdC1yYXkuanMiLCJzcmMvaW50ZXJ2YWwuanMiLCJzcmMvbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9sYWJlbC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy9tYWluLWFsZ29yaXRobS1sb2FkZXIuanMiLCJzcmMvbWFpbi1hbGdvcml0aG0uanMiLCJzcmMvbXVsdGktaW50ZXJ2YWwuanMiLCJzcmMvcmF5LWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktc2VnbWVudC1pbnRlcnNlY3Rpb24uanMiLCJzcmMvc2VnbWVudC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxNQUFNLFNBQVUsT0FBTyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDLE9BQU8sR0FBUCxDQUFoQyxHQUE4QyxPQUFPLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0MsT0FBTyxHQUFQLENBQWhDLEdBQThDLElBQTVHO0FBQ0EsTUFBTSxzQkFBc0IsUUFBUSw2QkFBUixDQUE1QjtBQUNBLE9BQU8sT0FBUCxHQUFpQixvQkFBb0IsYUFBckM7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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SWlDO0FBQy9DO0FBQ0QsUUFBTSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUgsR0FBTyxHQUFHLENBQVosSUFBaUIsR0FBRyxDQUFwQixHQUF3QixDQUFDLEdBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBWCxJQUFnQixHQUFHLENBQTVDLElBQWlELEdBQTNEO0FBQ0EsUUFBTSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUgsR0FBTyxHQUFHLENBQVosSUFBaUIsR0FBRyxDQUFwQixHQUF3QixDQUFDLEdBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBWCxJQUFnQixHQUFHLENBQTVDLElBQWlELEdBQTNEO0FBQ0EsU0FBTyxFQUFDLENBQUQsRUFBSSxDQUFKLEVBQVA7QUFDRDs7O0FDZkQsT0FBTyxPQUFQLEdBQWlCLEVBQUMsOEJBQUQsRUFBaUMsT0FBakMsRUFBakI7O0FBRUEsU0FBUyw4QkFBVCxDQUF5QyxJQUF6QyxFQUErQyxJQUEvQyxFQUFxRDtBQUNuRCxNQUFJLElBQUksQ0FBUjtBQUNBLFNBQU8sSUFBSSxLQUFLLEdBQUwsQ0FBUyxLQUFLLE1BQWQsRUFBc0IsS0FBSyxNQUEzQixDQUFYLEVBQStDO0FBQzdDLFFBQUksS0FBSyxDQUFMLEtBQVcsS0FBSyxDQUFMLENBQWYsRUFBd0IsT0FBTyxLQUFLLENBQUwsSUFBVSxLQUFLLENBQUwsQ0FBakI7QUFDeEI7QUFDRDtBQUNELFNBQU8sS0FBSyxNQUFMLEdBQWMsS0FBSyxNQUExQjtBQUNEOztBQUVELFNBQVMsT0FBVCxDQUFrQixLQUFsQixFQUF5QixHQUF6QixFQUE4QjtBQUM1QixTQUFPLEtBQUssR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFDLEtBQWIsSUFBc0IsS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLENBQUMsR0FBYixDQUE3QjtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IGxvZGFzaCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKVxuY29uc3QgbWFpbkFsZ29yaXRobUxvYWRlciA9IHJlcXVpcmUoJy4vc3JjL21haW4tYWxnb3JpdGhtLWxvYWRlcicpXG5tb2R1bGUuZXhwb3J0cyA9IG1haW5BbGdvcml0aG1Mb2FkZXIubWFpbkFsZ29yaXRobSIsIlxuXG4vLyBUT0RPIGFkZCB0aGUgcG9zc2liaWxpdHkgdG8gb3duIHNjb3JlIGZ1bmN0aW9uXG4vKipcbiAqXG4gKiBAcGFyYW0gZ3JlZWR5QWxnb3JpdGhtIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgdHdvIGFycmF5cywgb25lIG9mIGVsZW1lbnRzIHRvIGJlIGNvbXB1dGVkIGFuZCBvbmUgZm9yIHRoZSBwb2ludHMgZm9yIHRoZSByZXN0IG9mIHRoZSBpdGVyYXRpb25zLlxuICogSXQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCB0d28gZWxlbWVudHMsIGNob3NlbiBhbmQgcmVqZWN0ZWRcbiAqIEBwYXJhbSBzdGFydGluZ0RhdGEgc3RhcnRpbmcgYXJyYXkgb2YgZWxlbWVudHNcbiAqIEBwYXJhbSByZXNldEZ1bmN0aW9uIGZ1bmN0aW9uIHRvIGJlIGFwcGxpZWQgdG8gZWFjaCBlbGVtZW50IGF0IHRoZSBzdGFydCBvZiBlYWNoIGl0ZXJhdGlvblxuICogQHBhcmFtIHBhcmFtcyBleHRyYSBwYXJhbXNcbiAqL1xubGV0IGl0ZXJhdGl2ZUdyZWVkeUFsZ29yaXRobSA9ICgoKSA9PiB7XG4gIHZhciBfcmVmID0gX2FzeW5jVG9HZW5lcmF0b3IoZnVuY3Rpb24qIChncmVlZHlBbGdvcml0aG0sIHN0YXJ0aW5nRGF0YSwgcmVzZXRGdW5jdGlvbiwgcGFyYW1zID0ge30pIHtcbiAgICBjb25zdCBNQVhfTlVNQkVSX09GX0lURVJBVElPTlMgPSB0eXBlb2YgcGFyYW1zLk1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA9PT0gJ251bWJlcicgPyBwYXJhbXMuTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TIDogMTAwO1xuICAgIC8vIEF0IGV2ZXJ5IGxvb3AgaWYgd2UgaW1wcm92ZSB0aGUgcmVzdWx0IHRoZW4gd2UgYXBwbHkgc2VyaWFsaXplIGZ1bmN0aW9uIHRvIHRoZSByZXN1bHQgdG8gc2F2ZSBhIGNvcHlcbiAgICBjb25zdCBzZXJpYWxpemVGdW5jdGlvbiA9IHR5cGVvZiBwYXJhbXMuc2VyaWFsaXplRnVuY3Rpb24gPT09ICdmdW5jdGlvbicgPyBwYXJhbXMuc2VyaWFsaXplRnVuY3Rpb24gOiBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoeCkpO1xuICAgIH07XG4gICAgLy8gSW4gdGhlIGdyZWVkeSBxdWV1ZSB3ZSBzdG9yZSBhbGwgdGhlIGVsZW1lbnRzIGluIGFycmF5IGluIHJldmVyc2Ugb3JkZXIgb2YgZXhlY3V0aW9uXG4gICAgY29uc3QgZ3JlZWR5UXVldWUgPSBbc3RhcnRpbmdEYXRhXTtcbiAgICBsZXQgYmVzdEdyZWVkeVF1ZXVlID0gW107XG4gICAgbGV0IGJlc3RTY29yZSA9IDA7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBNQVhfTlVNQkVSX09GX0lURVJBVElPTlM7IGorKykge1xuICAgICAgbGV0IGl0ZXJhdGlvblNjb3JlID0gMDtcbiAgICAgIGdyZWVkeVF1ZXVlLmZvckVhY2goZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgY29sbGVjdGlvbi5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgcmVzZXRGdW5jdGlvbi5jYWxsKGVsZW1lbnQsIGVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgbiA9IGdyZWVkeVF1ZXVlLmxlbmd0aDtcbiAgICAgIGZvciAobGV0IGkgPSBuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgeyBjaG9zZW4sIHJlamVjdGVkIH0gPSB5aWVsZCBncmVlZHlBbGdvcml0aG0oZ3JlZWR5UXVldWVbaV0sIGZsYXR0ZW4oZ3JlZWR5UXVldWUuc2xpY2UoMCwgaSkpKTtcbiAgICAgICAgaXRlcmF0aW9uU2NvcmUgKz0gY2hvc2VuLmxlbmd0aDtcbiAgICAgICAgaWYgKGNob3Nlbi5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICBncmVlZHlRdWV1ZVtpXSA9IGNob3NlbjtcbiAgICAgICAgICAvLyBlbmQgb2YgdGhlIHF1ZXVlXG4gICAgICAgICAgaWYgKGkgPT09IG4gLSAxKSB7XG4gICAgICAgICAgICBpZiAocmVqZWN0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGdyZWVkeVF1ZXVlLnB1c2gocmVqZWN0ZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBncmVlZHlRdWV1ZVtpICsgMV0gPSBbLi4uZ3JlZWR5UXVldWVbaSArIDFdLCAuLi5yZWplY3RlZF07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIGNob3Nlbi5sZW5ndGggPT09IDAgdGhlbiB0aGVzZSBlbGVtZW50cyBjb3VsZCBub3QgYmUgYXNzaWduZWQgZXZlbiBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBxdWV1ZSwgd2Ugc2hvdWxkIGdldCByaWQgb2YgdGhlbVxuICAgICAgICAgIGlmIChpICE9PSBuIC0gMSkge1xuICAgICAgICAgICAgZ3JlZWR5UXVldWVbaV0gPSBncmVlZHlRdWV1ZVtpICsgMV07XG4gICAgICAgICAgICBncmVlZHlRdWV1ZVtpICsgMV0gPSByZWplY3RlZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpdGVyYXRpb25TY29yZSA+IGJlc3RTY29yZSkge1xuICAgICAgICBiZXN0U2NvcmUgPSBpdGVyYXRpb25TY29yZTtcbiAgICAgICAgLy8gVGhlcmUgbXVzdCBiZSBhIGJldHRlciB3YXkgdG8gc3RvcmUgdGhlIHJlc3VsdFxuICAgICAgICAvLyBQbHVzIHRoZSBuYW1lIGlzIGEgYml0IHRyaWNreSwgb25lIGV4cGVjdHMgdGhhdCB0aGUgYWxnb3JpdGhtIGluIGl0IHBhc3Mgc2V0cyB0aGUgZWxlbWVudHNcbiAgICAgICAgYmVzdEdyZWVkeVF1ZXVlID0gc2VyaWFsaXplRnVuY3Rpb24oZmxhdHRlbihncmVlZHlRdWV1ZSkpO1xuICAgICAgfVxuICAgICAgY29uc3QgZ3JlZWR5UXVldWVMZW5ndGggPSBncmVlZHlRdWV1ZS5yZWR1Y2UoZnVuY3Rpb24gKGxlbmd0aCwgYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGxlbmd0aCArIGFycmF5Lmxlbmd0aDtcbiAgICAgIH0sIDApO1xuICAgICAgaWYgKGl0ZXJhdGlvblNjb3JlID09PSBncmVlZHlRdWV1ZUxlbmd0aCkge1xuICAgICAgICByZXR1cm4gYmVzdEdyZWVkeVF1ZXVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmVzdEdyZWVkeVF1ZXVlO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24gaXRlcmF0aXZlR3JlZWR5QWxnb3JpdGhtKF94LCBfeDIsIF94Mykge1xuICAgIHJldHVybiBfcmVmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59KSgpO1xuXG5mdW5jdGlvbiBfYXN5bmNUb0dlbmVyYXRvcihmbikgeyByZXR1cm4gZnVuY3Rpb24gKCkgeyB2YXIgZ2VuID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgZnVuY3Rpb24gc3RlcChrZXksIGFyZykgeyB0cnkgeyB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7IHZhciB2YWx1ZSA9IGluZm8udmFsdWU7IH0gY2F0Y2ggKGVycm9yKSB7IHJlamVjdChlcnJvcik7IHJldHVybjsgfSBpZiAoaW5mby5kb25lKSB7IHJlc29sdmUodmFsdWUpOyB9IGVsc2UgeyByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkgeyBzdGVwKFwibmV4dFwiLCB2YWx1ZSk7IH0sIGZ1bmN0aW9uIChlcnIpIHsgc3RlcChcInRocm93XCIsIGVycik7IH0pOyB9IH0gcmV0dXJuIHN0ZXAoXCJuZXh0XCIpOyB9KTsgfTsgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgc29sdmU6IGl0ZXJhdGl2ZUdyZWVkeUFsZ29yaXRobSB9O1xuXG5mdW5jdGlvbiBmbGF0dGVuKGFycmF5cykge1xuICByZXR1cm4gYXJyYXlzLnJlZHVjZSgoYTEsIGEyKSA9PiBhMS5jb25jYXQoYTIpLCBbXSk7XG59IiwidmFyIGJ1bmRsZUZuID0gYXJndW1lbnRzWzNdO1xudmFyIHNvdXJjZXMgPSBhcmd1bWVudHNbNF07XG52YXIgY2FjaGUgPSBhcmd1bWVudHNbNV07XG5cbnZhciBzdHJpbmdpZnkgPSBKU09OLnN0cmluZ2lmeTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIG9wdGlvbnMpIHtcbiAgICB2YXIgd2tleTtcbiAgICB2YXIgY2FjaGVLZXlzID0gT2JqZWN0LmtleXMoY2FjaGUpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYWNoZUtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBjYWNoZUtleXNbaV07XG4gICAgICAgIHZhciBleHAgPSBjYWNoZVtrZXldLmV4cG9ydHM7XG4gICAgICAgIC8vIFVzaW5nIGJhYmVsIGFzIGEgdHJhbnNwaWxlciB0byB1c2UgZXNtb2R1bGUsIHRoZSBleHBvcnQgd2lsbCBhbHdheXNcbiAgICAgICAgLy8gYmUgYW4gb2JqZWN0IHdpdGggdGhlIGRlZmF1bHQgZXhwb3J0IGFzIGEgcHJvcGVydHkgb2YgaXQuIFRvIGVuc3VyZVxuICAgICAgICAvLyB0aGUgZXhpc3RpbmcgYXBpIGFuZCBiYWJlbCBlc21vZHVsZSBleHBvcnRzIGFyZSBib3RoIHN1cHBvcnRlZCB3ZVxuICAgICAgICAvLyBjaGVjayBmb3IgYm90aFxuICAgICAgICBpZiAoZXhwID09PSBmbiB8fCBleHAgJiYgZXhwLmRlZmF1bHQgPT09IGZuKSB7XG4gICAgICAgICAgICB3a2V5ID0ga2V5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXdrZXkpIHtcbiAgICAgICAgd2tleSA9IE1hdGguZmxvb3IoTWF0aC5wb3coMTYsIDgpICogTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoMTYpO1xuICAgICAgICB2YXIgd2NhY2hlID0ge307XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2FjaGVLZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGNhY2hlS2V5c1tpXTtcbiAgICAgICAgICAgIHdjYWNoZVtrZXldID0ga2V5O1xuICAgICAgICB9XG4gICAgICAgIHNvdXJjZXNbd2tleV0gPSBbXG4gICAgICAgICAgICBGdW5jdGlvbihbJ3JlcXVpcmUnLCdtb2R1bGUnLCdleHBvcnRzJ10sICcoJyArIGZuICsgJykoc2VsZiknKSxcbiAgICAgICAgICAgIHdjYWNoZVxuICAgICAgICBdO1xuICAgIH1cbiAgICB2YXIgc2tleSA9IE1hdGguZmxvb3IoTWF0aC5wb3coMTYsIDgpICogTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoMTYpO1xuXG4gICAgdmFyIHNjYWNoZSA9IHt9OyBzY2FjaGVbd2tleV0gPSB3a2V5O1xuICAgIHNvdXJjZXNbc2tleV0gPSBbXG4gICAgICAgIEZ1bmN0aW9uKFsncmVxdWlyZSddLCAoXG4gICAgICAgICAgICAvLyB0cnkgdG8gY2FsbCBkZWZhdWx0IGlmIGRlZmluZWQgdG8gYWxzbyBzdXBwb3J0IGJhYmVsIGVzbW9kdWxlXG4gICAgICAgICAgICAvLyBleHBvcnRzXG4gICAgICAgICAgICAndmFyIGYgPSByZXF1aXJlKCcgKyBzdHJpbmdpZnkod2tleSkgKyAnKTsnICtcbiAgICAgICAgICAgICcoZi5kZWZhdWx0ID8gZi5kZWZhdWx0IDogZikoc2VsZik7J1xuICAgICAgICApKSxcbiAgICAgICAgc2NhY2hlXG4gICAgXTtcblxuICAgIHZhciB3b3JrZXJTb3VyY2VzID0ge307XG4gICAgcmVzb2x2ZVNvdXJjZXMoc2tleSk7XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlU291cmNlcyhrZXkpIHtcbiAgICAgICAgd29ya2VyU291cmNlc1trZXldID0gdHJ1ZTtcblxuICAgICAgICBmb3IgKHZhciBkZXBQYXRoIGluIHNvdXJjZXNba2V5XVsxXSkge1xuICAgICAgICAgICAgdmFyIGRlcEtleSA9IHNvdXJjZXNba2V5XVsxXVtkZXBQYXRoXTtcbiAgICAgICAgICAgIGlmICghd29ya2VyU291cmNlc1tkZXBLZXldKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZVNvdXJjZXMoZGVwS2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzcmMgPSAnKCcgKyBidW5kbGVGbiArICcpKHsnXG4gICAgICAgICsgT2JqZWN0LmtleXMod29ya2VyU291cmNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdpZnkoa2V5KSArICc6WydcbiAgICAgICAgICAgICAgICArIHNvdXJjZXNba2V5XVswXVxuICAgICAgICAgICAgICAgICsgJywnICsgc3RyaW5naWZ5KHNvdXJjZXNba2V5XVsxXSkgKyAnXSdcbiAgICAgICAgICAgIDtcbiAgICAgICAgfSkuam9pbignLCcpXG4gICAgICAgICsgJ30se30sWycgKyBzdHJpbmdpZnkoc2tleSkgKyAnXSknXG4gICAgO1xuXG4gICAgdmFyIFVSTCA9IHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTCB8fCB3aW5kb3cubW96VVJMIHx8IHdpbmRvdy5tc1VSTDtcblxuICAgIHZhciBibG9iID0gbmV3IEJsb2IoW3NyY10sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSk7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5iYXJlKSB7IHJldHVybiBibG9iOyB9XG4gICAgdmFyIHdvcmtlclVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgdmFyIHdvcmtlciA9IG5ldyBXb3JrZXIod29ya2VyVXJsKTtcbiAgICB3b3JrZXIub2JqZWN0VVJMID0gd29ya2VyVXJsO1xuICAgIHJldHVybiB3b3JrZXI7XG59O1xuIiwiJ3VzZSBzdHJpY3QnXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdXBkYXRlQXZhaWxhYmxlU3BhY2UsXG4gIHByb21vdGVMYWJlbFRvUmVjdGFuZ2xlLFxuICBjb21wdXRlSW5pdGlhbEF2YWlsYWJlU3BhY2VzLFxuICByZXNldEF2YWlsYWJsZVNwYWNlLFxuICB1cGRhdGVNaW5pbWEsXG4gIHRyYW5zbGF0ZUxhYmVsXG59XG5cbmNvbnN0IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykubGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb25cbmNvbnN0IHJheVJlY3RhbmdsZUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKS5yYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb25cbmNvbnN0IG11bHRpSW50ZXJ2YWwgPSByZXF1aXJlKCcuL211bHRpLWludGVydmFsJykubXVsdGlJbnRlcnZhbFxuY29uc3QgaW50ZXJ2YWwgPSByZXF1aXJlKCcuL2ludGVydmFsJykuaW50ZXJ2YWxcbi8qXG4gQW4gZXh0ZW5kZWQgcG9pbnQgbWF5IGNvbnRhaW4gdGhlIGZvbGxvd2luZ1xuICByYXlzIGEgY29sbGVjdGlvbiBvZiByYXlzIHN0YXJ0aW5nIGZyb20gdGhlIHBvaW50IGFzIHdlbGwgYXMgdGhlIGludGVydmFscyB3aGVyZSB0aGV5IGFyZSBhbGxvd2VkXG4gIGxhYmVsIGluIGNhc2UgdGhlIGxhYmVsIGlzIG5vdCB5ZXQgc2V0dGxlZFxuICByZWN0YW5nbGUgaW4gY2FzZSB0aGUgbGFiZWwgaXMgc2V0dGxlZFxuICovXG5mdW5jdGlvbiB1cGRhdGVBdmFpbGFibGVTcGFjZSAoZXh0ZW5kZWRQb2ludCkge1xuICB2YXIgcmF5cyA9IGV4dGVuZGVkUG9pbnQucmF5c1xuICB2YXIgbWVhc3VyZSA9IDBcbiAgZm9yIChsZXQgcmF5IG9mIHJheXMpIHtcbiAgICBsZXQgcmF5TWVhc3VyZSA9IHJheS5hdmFpbGFibGUubWVhc3VyZSgpXG4gICAgcmF5LmF2YWlsYWJsZU1lYXN1cmUgPSByYXlNZWFzdXJlXG4gICAgbWVhc3VyZSArPSByYXlNZWFzdXJlXG4gIH1cbiAgZXh0ZW5kZWRQb2ludC5hdmFpbGFibGVNZWFzdXJlID0gbWVhc3VyZVxufVxuXG5mdW5jdGlvbiBjb21wdXRlSW5pdGlhbEF2YWlsYWJlU3BhY2VzIChleHRlbmRlZFBvaW50cywgcGFyYW1zKSB7XG4gIGNvbnN0IHJhZGl1cyA9IHBhcmFtcy5yYWRpdXNcbiAgY29uc3QgYmJveCA9IHBhcmFtcy5iYm94XG4gIGZvciAobGV0IHBpIG9mIGV4dGVuZGVkUG9pbnRzKSB7XG4gICAgZm9yIChsZXQgcmlqIG9mIHBpLnJheXMpIHtcbiAgICAgIHJpai5pbml0aWFsbHlBdmFpbGFibGUgPSBtdWx0aUludGVydmFsKFtpbnRlcnZhbCgwLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXSlcbiAgICAgIGZvciAobGV0IHBrIG9mIGV4dGVuZGVkUG9pbnRzKSB7XG4gICAgICAgIGNvbnN0IHJlY3RhbmdsZSA9IHt0b3A6IHBrLnBvc2l0aW9uLnkgKyByYWRpdXMsIGJvdHRvbTogcGsucG9zaXRpb24ueSAtIHJhZGl1cywgbGVmdDogcGsucG9zaXRpb24ueCAtIHJhZGl1cywgcmlnaHQ6IHBrLnBvc2l0aW9uLnggKyByYWRpdXMsIHdpZHRoOiAyICogcmFkaXVzLCBoZWlnaHQ6IDIgKiByYWRpdXN9XG4gICAgICAgIHJpai5pbml0aWFsbHlBdmFpbGFibGUucmVtb3ZlKGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHJlY3RhbmdsZSwgcGkubGFiZWwsIHJpai52ZWN0b3IsIHBpLnBvc2l0aW9uKSlcbiAgICAgICAgaWYgKHBpICE9PSBwaykge1xuICAgICAgICAgIHJpai5pbml0aWFsbHlBdmFpbGFibGUucmVtb3ZlKHJheVJlY3RhbmdsZUludGVyc2VjdGlvbihyZWN0YW5nbGUsIHJpai52ZWN0b3IsIHBpLnBvc2l0aW9uKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGJib3gpIHtcbiAgICAgICAgY29uc3QgbGFiZWxDb250YWluZWRJbnRlcnZhbCA9IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHt0b3A6IC1iYm94LnRvcCAtIHBpLmxhYmVsLmhlaWdodCwgYm90dG9tOiAtYmJveC5ib3R0b20gKyBwaS5sYWJlbC5oZWlnaHQsIGxlZnQ6IGJib3gubGVmdCArIHBpLmxhYmVsLndpZHRoLCByaWdodDogYmJveC5yaWdodCAtIHBpLmxhYmVsLndpZHRoLCB3aWR0aDogYmJveC53aWR0aCAtIDIgKiBwaS5sYWJlbC53aWR0aCwgaGVpZ2h0OiBiYm94LmhlaWdodCAtIDIgKiBwaS5sYWJlbC5oZWlnaHR9LCBwaS5sYWJlbCwgcmlqLnZlY3RvciwgcGkucG9zaXRpb24pXG4gICAgICAgIC8vIFdhbnQgbGFiZWxzIGluc2lkZSBvZiB0aGUgZ3JhcGhcbiAgICAgICAgcmlqLmluaXRpYWxseUF2YWlsYWJsZS5yZW1vdmUoaW50ZXJ2YWwobGFiZWxDb250YWluZWRJbnRlcnZhbC5lbmQsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkpXG4gICAgICB9XG4gICAgICByaWouYXZhaWxhYmxlID0gcmlqLmluaXRpYWxseUF2YWlsYWJsZS5jbG9uZSgpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlc2V0QXZhaWxhYmxlU3BhY2UgKGV4dGVuZGVkUG9pbnQpIHtcbiAgZm9yIChsZXQgcmlqIG9mIGV4dGVuZGVkUG9pbnQucmF5cykge1xuICAgIHJpai5hdmFpbGFibGUgPSByaWouaW5pdGlhbGx5QXZhaWxhYmxlLmNsb25lKClcbiAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVNaW5pbWEgKGV4dGVuZGVkUG9pbnQpIHtcbiAgdmFyIHJheXMgPSBleHRlbmRlZFBvaW50LnJheXNcbiAgZm9yIChsZXQgcmF5IG9mIHJheXMpIHtcbiAgICByYXkubWluaW11bSA9IHJheS5hdmFpbGFibGUuZ2V0TWluKClcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9tb3RlTGFiZWxUb1JlY3RhbmdsZSAoZXh0ZW5kZWRQb2ludCwgdmkpIHtcbiAgZXh0ZW5kZWRQb2ludC5yZWN0YW5nbGUgPSB0cmFuc2xhdGVMYWJlbChleHRlbmRlZFBvaW50LCB2aSlcbiAgZXh0ZW5kZWRQb2ludC5zZWdtZW50ID0ge3g6IHZpLngsIHk6IHZpLnl9XG59XG5cbmZ1bmN0aW9uIHRyYW5zbGF0ZUxhYmVsIChleHRlbmRlZFBvaW50LCB2aSkge1xuICBjb25zdCBwb2ludCA9IGV4dGVuZGVkUG9pbnQucG9zaXRpb25cbiAgY29uc3QgbGFiZWwgPSBleHRlbmRlZFBvaW50LmxhYmVsXG4gIHJldHVybiB7XG4gICAgaGVpZ2h0OiBsYWJlbC5oZWlnaHQsXG4gICAgd2lkdGg6IGxhYmVsLndpZHRoLFxuICAgIHRvcDogcG9pbnQueSArIHZpLnkgKyBsYWJlbC5oZWlnaHQgLyAyLFxuICAgIGJvdHRvbTogcG9pbnQueSArIHZpLnkgLSBsYWJlbC5oZWlnaHQgLyAyLFxuICAgIGxlZnQ6IHBvaW50LnggKyB2aS54IC0gbGFiZWwud2lkdGggLyAyLFxuICAgIHJpZ2h0OiBwb2ludC54ICsgdmkueCArIGxhYmVsLndpZHRoIC8gMlxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge2ZpbmRCZXN0UmF5fVxuXG5jb25zdCBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpXG5cbmNvbnN0IGV4dGVuZGVkUG9pbnRNZXRob2RzID0gcmVxdWlyZSgnLi9leHRlbmRlZC1wb2ludC1tZXRob2RzJylcbmNvbnN0IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykubGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb25cbmNvbnN0IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtc2VnbWVudC1pbnRlcnNlY3Rpb24nKS5sYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb25cbmNvbnN0IHJheVJlY3RhbmdsZUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKS5yYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb25cbmNvbnN0IHJheVNlZ21lbnRJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1zZWdtZW50LWludGVyc2VjdGlvbicpLnJheVNlZ21lbnRJbnRlcnNlY3Rpb25cbmNvbnN0IG11bHRpSW50ZXJ2YWwgPSByZXF1aXJlKCcuL211bHRpLWludGVydmFsJykubXVsdGlJbnRlcnZhbFxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuYXN5bmMgZnVuY3Rpb24gZmluZEJlc3RSYXkgKHBvaW50c1RvTGFiZWwsIHBvaW50c05vdFRvTGFiZWwpIHtcbiAgLy8gV2UgZm9sbG93IHRoZSBhcnRpY2xlIHBhZ2UgNCBBbGdvcml0aG0gMVxuICB2YXIgUCA9IHBvaW50c1RvTGFiZWxcbiAgdmFyIFAwID0gcG9pbnRzTm90VG9MYWJlbC5jb25jYXQocG9pbnRzVG9MYWJlbClcbiAgLy8gaW50IFAgbWluIGluIHRoZSBhcnRpY2xlXG4gIHZhciBtaW5pbXVtQXZhaWxhYmxlU3BhY2UgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcbiAgdmFyIHJiZXN0XG4gIHZhciBWYmVzdFxuICB2YXIgcGJlc3QgLy8gVGhpcyBpcyBub3QgaW4gdGhlIG9yaWdpbmFsIGFsZ29yaXRobSBidXQgYWxsb3dzIHRvIGVhc2lseSBmaW5kIHRoZSBjb3JyZXNwb25kaW5nIHBvaW50XG4gIFAwLmZvckVhY2gocD0+IGV4dGVuZGVkUG9pbnRNZXRob2RzLnVwZGF0ZUF2YWlsYWJsZVNwYWNlKHApKVxuICBQLmZvckVhY2gocD0+IGV4dGVuZGVkUG9pbnRNZXRob2RzLnVwZGF0ZU1pbmltYShwKSlcbiAgY29uc3QgcGkgPSBfLm1pbkJ5KFAsICdhdmFpbGFibGVNZWFzdXJlJylcbiAgbGV0IG1pbmRpayA9IF8ubWluQnkocGkucmF5cywgJ21pbmltdW0nKS5taW5pbXVtXG4gIGxldCBSID0gcGkucmF5cy5maWx0ZXIociA9PiByLmF2YWlsYWJsZU1lYXN1cmUgPiAwKVxuICByaWpsb29wOiBmb3IgKGxldCByaWogb2YgUikge1xuICAgIGxldCBWaWogPSBbXVxuICAgIGxldCBzZWdtZW50ID0ge3g6IHJpai52ZWN0b3IueCAqIHJpai5taW5pbXVtLCB5OiByaWoudmVjdG9yLnkgKiByaWoubWluaW11bX1cbiAgICBjb25zdCByZWN0YW5nbGUgPSBleHRlbmRlZFBvaW50TWV0aG9kcy50cmFuc2xhdGVMYWJlbChwaSwgc2VnbWVudClcbiAgICBmb3IgKGxldCBwayBvZiBQMCkge1xuICAgICAgaWYgKHBrID09PSBwaSkgY29udGludWVcbiAgICAgIC8vIE5vIHNlbnNlIHRvIHdhaXQgZm9yIHRoZSBpbnRlcnNlY3Rpb24gaWYgcmJlc3QgaXMgZGVmaW5lZFxuXG4gICAgICAvL2ludCBwa1xuICAgICAgbGV0IGF2YWlsYWJsZVNwYWNlID0gcGsuYXZhaWxhYmxlTWVhc3VyZVxuICAgICAgLy8gTm90IGRvaW5nIHRoZSBwcmVpbnRlcnNlY3Rpb24gaGVyZS4gU29tZXRoaW5nIGZpc2h5IGluIHRoZSBhcnRpY2xlLCBpZiBwcmVpbnRlcnNlY3QgaXMgZW1wdHkgdGhlbiAgaW50ZWdyYWwgcGstIGlzIDAgd2hpY2ggZG9lcyBub3QgbWFrZSBtdWNoIHNlbnNlXG4gICAgICBmb3IgKGxldCBya2wgb2YgcGsucmF5cykge1xuICAgICAgICBsZXQgbGFiZWxJbnRlcnNlY3Rpb25cbiAgICAgICAgbGV0IHNlZ21lbnRJbnRlcnNlY3Rpb25cbiAgICAgICAgLy8gV2UgaGF2ZSBzcGxpdCBsYWJlbCByZWN0YW5nbGUgaW50ZXJzZWN0aW9uIGludG8gdHdvIGFsZ29yaXRobXMsIGxhYmVsIHJlY3RhbmdsZSBhbmQgbGFiZWwgc2VnbWVudC4gVGhvc2UgdHdvIGludGVydmFscyBzaG91bGQgaW50ZXJzZWN0IHNpbmNlIHRoZSBzZWdtZW50IGludGVyc2VjdHMgdGhlIHJlY3RhbmdsZSwgc28gd2UgY2FuIGNvYWxlc2NlIHRoZSBpbnRlcnZhbHNcbiAgICAgICAgY29uc3QgbGFiZWxJbnRlcnZhbCA9IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHJlY3RhbmdsZSwgcGsubGFiZWwsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCBzZWdtZW50SW50ZXJ2YWwgPSBsYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb24ocGkucG9zaXRpb24sIHNlZ21lbnQsIHBrLmxhYmVsLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3QgcmF5SW50ZXJ2YWwgPSByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocmVjdGFuZ2xlLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3QgcmF5U2VnbWVudEludGVydmFsID0gcmF5U2VnbWVudEludGVyc2VjdGlvbihwaS5wb3NpdGlvbiwgc2VnbWVudCwgcGsucG9zaXRpb24sIHJrbC52ZWN0b3IpXG4gICAgICAgIGxhYmVsSW50ZXJzZWN0aW9uID0gbGFiZWxJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UocmF5SW50ZXJ2YWwpXG4gICAgICAgIHNlZ21lbnRJbnRlcnNlY3Rpb24gPSBzZWdtZW50SW50ZXJ2YWwuY29hbGVzY2VJblBsYWNlKHJheVNlZ21lbnRJbnRlcnZhbClcbiAgICAgICAgaWYgKCFsYWJlbEludGVyc2VjdGlvbi5lbXB0eSB8fCAhc2VnbWVudEludGVyc2VjdGlvbi5lbXB0eSkge1xuICAgICAgICAgIGF2YWlsYWJsZVNwYWNlIC09IHJrbC5hdmFpbGFibGUubWVhc3VyZU11bHRpcGxlSW50ZXJzZWN0aW9uKG11bHRpSW50ZXJ2YWwuY29hbGVzY2UobGFiZWxJbnRlcnNlY3Rpb24sIHNlZ21lbnRJbnRlcnNlY3Rpb24pKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBUaGlzIHJheSBpcyBub3QgZ29vZCBiZWNhdXNlIHdlIHRyeSB0byBtYXhpbWl6ZSB0aGUgbWluaW11bVxuICAgICAgaWYgKHJiZXN0ICYmIGF2YWlsYWJsZVNwYWNlIDwgbWluaW11bUF2YWlsYWJsZVNwYWNlKSB7XG4gICAgICAgIGNvbnRpbnVlIHJpamxvb3BcbiAgICAgIH1cbiAgICAgIFZpai5wdXNoKGF2YWlsYWJsZVNwYWNlKVxuICAgIH1cbiAgICBWaWouc29ydCgoaSxqKSA9PiBpIC0gaikgLy8gb3JkZXIgdG8gY29tcGFyZSBpbiBsZXhpY29ncmFwaGljYWwgb3JkZXJcbiAgICBpZiAoIVZiZXN0IHx8IHV0aWxzLmNvbXBhcmVBcnJheXNMZXhpY29ncmFwaGljYWxseShWaWosIFZiZXN0KSA8IDApIHtcbiAgICAgIHJiZXN0ID0gcmlqXG4gICAgICBWYmVzdCA9IFZpalxuICAgICAgbWluaW11bUF2YWlsYWJsZVNwYWNlID0gXy5taW4oVmlqKVxuICAgICAgcGJlc3QgPSBwaVxuICAgIH1cbiAgfVxuICAvLyBXZSBuZWVkIHRvIHJldHVybiBpbnRlcnNlY3Rpb25EYXRhIGJlY2F1c2UgdGhlIHJlZmVyZW5jZSBoYXMgYmVlbiBuZXV0ZXJlZCBpbiBmaW5kIHJheSBpbnRlcnNlY3Rpb25cbiAgcmV0dXJuIHtyYmVzdDogcmJlc3QsIHBiZXN0OiBwYmVzdH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge2ludGVydmFsfVxuZnVuY3Rpb24gSW50ZXJ2YWwgKHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIC8vIGNvbnNvbGUuZXJyb3IoJ1dyb25nIG9yZGVyIG9mIGludGVydmFsJywgc3RhcnQsIGVuZClcbiAgICB0aGlzLmVtcHR5ID0gdHJ1ZVxuICAgIHRoaXMuc3RhcnQgPSBudWxsXG4gICAgdGhpcy5lbmQgPSBudWxsXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICB0aGlzLnN0YXJ0ID0gc3RhcnRcbiAgdGhpcy5lbmQgPSBlbmRcbiAgcmV0dXJuIHRoaXNcbn1cblxuSW50ZXJ2YWwuZW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgSW50ZXJ2YWwoMSwgLTEpXG59XG5JbnRlcnZhbC5wcm90b3R5cGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24gKGludGVydmFsKSB7XG4gIGlmICh0aGlzLmVtcHR5IHx8IGludGVydmFsLmVtcHR5KSByZXR1cm4gSW50ZXJ2YWwuZW1wdHkoKVxuICByZXR1cm4gbmV3IEludGVydmFsKE1hdGgubWF4KGludGVydmFsLnN0YXJ0LCB0aGlzLnN0YXJ0KSwgTWF0aC5taW4oaW50ZXJ2YWwuZW5kLCB0aGlzLmVuZCkpXG59XG5cbkludGVydmFsLnByb3RvdHlwZS5jb2FsZXNjZSA9IGZ1bmN0aW9uIChpbnRlcnZhbCkge1xuICBpZiAodGhpcy5lbXB0eSkgcmV0dXJuIGludGVydmFsXG4gIGlmIChpbnRlcnZhbC5lbXB0eSkgcmV0dXJuIHRoaXNcbiAgaWYgKGludGVydmFsLnN0YXJ0ID4gdGhpcy5lbmQgfHwgdGhpcy5zdGFydCA+IGludGVydmFsLmVuZCkge1xuICAgIC8vIFdlIHByb2JhYmx5IG5lZWQgYSBtdWx0aSBpbnRlcnZhbCBpbiB0aGlzIGNhc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjb2FsbGVzY2UnKVxuICB9XG4gIHJldHVybiBuZXcgSW50ZXJ2YWwoTWF0aC5taW4oaW50ZXJ2YWwuc3RhcnQsIHRoaXMuc3RhcnQpLCBNYXRoLm1heChpbnRlcnZhbC5lbmQsIHRoaXMuZW5kKSlcbn1cbi8vIFRPRE8gcmVtb3ZlIGNvYWxlc2NlIGFuZCByZW5hbWUgdGhpcyBtZXRob2QgdG8gY29hbGVzY2Vcbi8vIG1vZGlmaWVzIGludGVydmFsXG5JbnRlcnZhbC5wcm90b3R5cGUuY29hbGVzY2VJblBsYWNlID0gZnVuY3Rpb24gKGludGVydmFsKSB7XG4gIGlmICh0aGlzLmVtcHR5KSByZXR1cm4gaW50ZXJ2YWxcbiAgaWYgKGludGVydmFsLmVtcHR5KSByZXR1cm4gdGhpc1xuICBpZiAoaW50ZXJ2YWwuc3RhcnQgPiB0aGlzLmVuZCB8fCB0aGlzLnN0YXJ0ID4gaW50ZXJ2YWwuZW5kKSB7XG4gICAgLy8gV2UgcHJvYmFibHkgbmVlZCBhIG11bHRpIGludGVydmFsIGluIHRoaXMgY2FzZVxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNvYWxsZXNjZScpXG4gIH1cbiAgdGhpcy5zdGFydCA9IE1hdGgubWluKGludGVydmFsLnN0YXJ0LCB0aGlzLnN0YXJ0KVxuICB0aGlzLmVuZCA9IE1hdGgubWF4KGludGVydmFsLmVuZCwgdGhpcy5lbmQpXG4gIHJldHVybiB0aGlzXG59XG5JbnRlcnZhbC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmVtcHR5KSByZXR1cm4gSW50ZXJ2YWwuZW1wdHkoKVxuICByZXR1cm4gbmV3IEludGVydmFsKHRoaXMuc3RhcnQsIHRoaXMuZW5kKVxufVxuSW50ZXJ2YWwucHJvdG90eXBlLm1lYXN1cmUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmVtcHR5KSByZXR1cm4gMFxuICByZXR1cm4gTWF0aC5wb3coMiwgLXRoaXMuc3RhcnQpIC0gTWF0aC5wb3coMiwgLXRoaXMuZW5kKVxufVxuZnVuY3Rpb24gaW50ZXJ2YWwoc3RhcnQsIGVuZCkge1xuICByZXR1cm4gbmV3IEludGVydmFsKHN0YXJ0LCBlbmQpXG59XG5pbnRlcnZhbC5lbXB0eSA9IEludGVydmFsLmVtcHR5IiwiJ3VzZSBzdHJpY3QnXG52YXIgaW50ZXJ2YWwgPSByZXF1aXJlKCcuL2ludGVydmFsJykuaW50ZXJ2YWxcbm1vZHVsZS5leHBvcnRzID0ge2xhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9ufVxuXG4vKiBSZWN0YW5nbGUgbGsgaW50ZXJzZWN0cyBsYWJlbCBsaSBtb3ZpbmcgZnJvbSBwaSB3aXRoIHZlY3RvciB2aSBpbiBwb3NpdGl2ZSB0aW1lICovXG4vLyBDb21wYXJlIGNlbnRlcnMgb2YgdGhlIGxhYmVscyB0aGV5IG11c3QgYmUgd2l0aGluIGxpLmhlaWdodCAvIDIgKyBsay5oZWlnaHQgLyAyIGluIHRoZSB2ZXJ0aWNhbCB2YXJpYWJsZSBhbmQgbGkud2lkdGggLyAyICsgbGsud2lkdGggLyAyIGluIHRoZSBob3Jpem9udGFsIHZhcmlhYmxlLCBpLmUgc29sdmUgfGxrLnggLSAocGsueCArIHQgKiB2LngpfCA8IGRcbmZ1bmN0aW9uIGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uIChsaywgbGksIHZpLCBwaSkge1xuICBsZXQgbWluID0gMFxuICBsZXQgbWF4ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG4gIGlmICh2aS55ICE9PSAwKSB7XG4gICAgY29uc3QgZmlyc3RJbnRlcnNlY3Rpb24gPSAobGsuaGVpZ2h0IC8gMiArIGxpLmhlaWdodCAvIDIgKyAobGsudG9wICsgbGsuYm90dG9tKSAvIDIgLSBwaS55KSAvIHZpLnlcbiAgICBjb25zdCBzZWNvbmRJbnRlcnNlY3Rpb24gPSAoLWxrLmhlaWdodCAvIDIgLSBsaS5oZWlnaHQgLyAyICsgKGxrLnRvcCArIGxrLmJvdHRvbSkgLyAyIC0gcGkueSkgLyB2aS55XG4gICAgLy8gTXVsdGlwbHlpbmcgYnkgYSBuZWdhdGl2ZSBzaWduIHJldmVyc2VzIGFuIGluZXF1YWxpdHlcbiAgICBpZiAodmkueSA+IDApIHtcbiAgICAgIG1heCA9IE1hdGgubWluKG1heCwgZmlyc3RJbnRlcnNlY3Rpb24pXG4gICAgICBtaW4gPSBNYXRoLm1heChtaW4sIHNlY29uZEludGVyc2VjdGlvbilcbiAgICB9IGVsc2Uge1xuICAgICAgbWluID0gTWF0aC5tYXgobWluLCBmaXJzdEludGVyc2VjdGlvbilcbiAgICAgIG1heCA9IE1hdGgubWluKG1heCwgc2Vjb25kSW50ZXJzZWN0aW9uKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyB2ZWN0b3IgaXMgdmVydGljYWwgYW5kIHRoZXkgd2lsbCBuZXZlciBpbnRlcnNlY3RcbiAgICBpZiAocGkueSAtIChsay50b3AgKyBsay5ib3R0b20pIC8gMiA+IGxrLmhlaWdodCAvIDIgKyBsaS5oZWlnaHQgLyAyKSByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICAgIGlmIChwaS55IC0gKGxrLnRvcCArIGxrLmJvdHRvbSkgLyAyIDwgLSBsay5oZWlnaHQgLyAyIC0gbGkuaGVpZ2h0IC8gMikgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgfVxuICBpZiAodmkueCAhPT0gMCkge1xuICAgIGNvbnN0IHRoaXJkSW50ZXJzZWN0aW9uID0gKGxrLndpZHRoIC8gMiArIGxpLndpZHRoIC8gMiArIChsay5yaWdodCArIGxrLmxlZnQpIC8gMiAtIHBpLngpIC8gdmkueFxuICAgIGNvbnN0IGZvdXJ0aEludGVyc2VjdGlvbiA9ICgtIGxrLndpZHRoIC8gMiAtIGxpLndpZHRoIC8gMiArIChsay5yaWdodCArIGxrLmxlZnQpIC8gMiAtIHBpLngpIC8gdmkueFxuICAgIGlmICh2aS54ID4gMCkge1xuICAgICAgbWF4ID0gTWF0aC5taW4obWF4LCB0aGlyZEludGVyc2VjdGlvbilcbiAgICAgIG1pbiA9IE1hdGgubWF4KG1pbiwgZm91cnRoSW50ZXJzZWN0aW9uKVxuICAgIH0gZWxzZSB7XG4gICAgICBtaW4gPSBNYXRoLm1heChtaW4sIHRoaXJkSW50ZXJzZWN0aW9uKVxuICAgICAgbWF4ID0gTWF0aC5taW4obWF4LCBmb3VydGhJbnRlcnNlY3Rpb24pXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChwaS54IC0gKGxrLnJpZ2h0ICsgbGsubGVmdCkgLyAyID4gbGsud2lkdGggLyAyICsgbGkud2lkdGggLyAyKSByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICAgIGlmIChwaS54IC0gKGxrLnJpZ2h0ICsgbGsubGVmdCkgLyAyIDwgLWxrLndpZHRoIC8gMiAtIGxpLndpZHRoIC8gMikgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgfVxuXG4gIC8vIE9ubHkgaW50ZXJlc3RlZCBpbiBwb3NpdGl2ZSB2YWx1ZXNcbiAgcmV0dXJuIGludGVydmFsKG1pbiwgbWF4KVxufSIsIid1c2Ugc3RyaWN0J1xuLy8gRmluZCBpbnRlcnZhbCBpbiB3aGljaCBhbiBpbnRlcnZhbCBhbmQgYSBzZWdtZW50IGludGVyc2VjdFxubW9kdWxlLmV4cG9ydHMgPSB7bGFiZWxTZWdtZW50SW50ZXJzZWN0aW9ufVxuXG52YXIgc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3NlZ21lbnQtc2VnbWVudC1pbnRlcnNlY3Rpb24nKS5zZWdtZW50U2VnbWVudEludGVyc2VjdGlvblxudmFyIGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG5cbi8vIExhYmVsIGxpIG1vdmVzIHdpdGggdmVjdG9yIHZpLiBXZSBmaW5kIHRoZSBpbnRlcnZhbCBhdCB3aGljaCBpdCBpbnRlcnNlY3RzIHRoZSBzZWdtZW50IHBrLCB2ay4gSWYgcGsgaXMgY29udGFpbmVkIHRoZW4gdGhlIGludGVydmFsIGdvZXMgdG8gSU5GSU5JVFlcbmZ1bmN0aW9uIGxhYmVsU2VnbWVudEludGVyc2VjdGlvbiAocGssIHZrLCBsaSwgdmksIHBpKSB7XG4gIC8vIHRyYW5zbGF0ZSBzbyB3ZSBjYW4gYXNzdW1lIHRoYXQgcG9pbnQgaXMgaW4gdGhlIGNlbnRyZVxuICBwayA9IHt4OiBway54IC0gcGkueCwgeTogcGsueSAtIHBpLnl9XG4gIC8vIFRPRE8gaGFuZGxlIHBhcmFsbGVsIGxpbmVzXG4gIHZhciBwb2ludENvdmVyZWRcbiAgLy8gVGhlIHRpbWUgaW50ZXJ2YWwgd2hlcmUgdGhleSBtZWV0IGlzIGNvbm5lY3RlZCBzbyBpdCBpcyBlbm91Z2ggdG8gZmluZCB0aGUgZW5kIHBvaW50cy4gVGhpcyBtdXN0IG9jY3VyIHdoZW4gZWl0aGVyIHRoZSBjb3JuZXJzIG9mIHRoZSBsYWJlbCBpbnRlcnNlY3Qgb3Igd2hlblxuICBjb25zdCBpbnRlcnNlY3Rpb25zID0gW11cbiAgLy8gdGhlIGVuZCBwb2ludHMgb2YgdGhlIHNlZ21lbnQgaW50ZXJzZWN0XG4gIGZvciAobGV0IHggb2YgWy0gbGkud2lkdGggLyAyLCBsaS53aWR0aCAvIDJdKSB7XG4gICAgZm9yIChsZXQgeSBvZiBbIC0gbGkuaGVpZ2h0IC8gMiwgbGkuaGVpZ2h0IC8gMl0pIHtcbiAgICAgIGxldCBpbnRlcnNlY3Rpb24gPSBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbih7eCwgeX0sIHZpLCBwaywgdmspXG4gICAgICAvLyBJbnRlcnNlY3RzIGluc2lkZSB0aGUgc2VnbWVudFxuICAgICAgaWYgKGludGVyc2VjdGlvbiAmJiBpbnRlcnNlY3Rpb24ucyA+PSAwICYmIGludGVyc2VjdGlvbi5zIDw9IDEpIHtcbiAgICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKGludGVyc2VjdGlvbi50KVxuICAgICAgfVxuXG4gICAgICAvLyBHaXZlbiBhIHBvaW50IHRvIHdlIHRha2UgdGhlIHNpZGUgY29taW5nIGZyb20gaXQgaW4gY291bnRlciBjbG9ja3dpc2VcbiAgICAgIGxldCBzaWRlXG4gICAgICBpZiAoeCAqIHkgPCAwKSB7XG4gICAgICAgIHNpZGUgPSB7eDogMCwgeTogLTIgKiB5fVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2lkZSA9IHt4OiAtMiAqIHgsIHk6IDB9XG4gICAgICB9XG4gICAgICBpbnRlcnNlY3Rpb24gPSBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbih7eCwgeX0sIHNpZGUsIHBrLCB2aSlcbiAgICAgIGlmIChpbnRlcnNlY3Rpb24gJiYgaW50ZXJzZWN0aW9uLnQgPj0gMCAmJiBpbnRlcnNlY3Rpb24udCA8PSAxKSB7XG4gICAgICAgIGludGVyc2VjdGlvbnMucHVzaCgtaW50ZXJzZWN0aW9uLnMpXG4gICAgICAgIC8vLy8gVGhlIHNpZGUgY292ZXJzIHRoZSBwb2ludCBpbiB0aGUgZnV0dXJlXG4gICAgICAgIC8vaWYgKGludGVyc2VjdGlvbi5zIDwgMCkge1xuICAgICAgICAvLyAgaW50ZXJzZWN0aW9ucy5wdXNoKE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbiAgICAgICAgLy99XG4gICAgICB9XG4gICAgICBpbnRlcnNlY3Rpb24gPSBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbih7eCwgeX0sIHNpZGUsIHt4OiBway54ICsgdmsueCwgeTogcGsueSArIHZrLnl9LCB2aSlcbiAgICAgIGlmIChpbnRlcnNlY3Rpb24gJiYgaW50ZXJzZWN0aW9uLnQgPj0gMCAmJiBpbnRlcnNlY3Rpb24udCA8PSAxKSB7XG4gICAgICAgIGludGVyc2VjdGlvbnMucHVzaCgtaW50ZXJzZWN0aW9uLnMpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHZhciBtaW4gPSBpbnRlcnNlY3Rpb25zLnJlZHVjZSgoYSwgYikgPT4gTWF0aC5taW4oYSxiKSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxuICB2YXIgbWF4ID0gaW50ZXJzZWN0aW9ucy5yZWR1Y2UoKGEsIGIpID0+IE1hdGgubWF4KGEsYiksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSlcbiAgbWluID0gTWF0aC5tYXgobWluLCAwKVxuICByZXR1cm4gaW50ZXJ2YWwobWluLCBtYXgpXG5cbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHttYWluQWxnb3JpdGhtfVxuY29uc3Qgd29yayA9IHJlcXVpcmUoJ3dlYndvcmtpZnknKVxuY29uc3QgYWxnb3JpdGhtID0gd29yayhyZXF1aXJlKCcuL21haW4tYWxnb3JpdGhtLmpzJykpXG5jb25zdCBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpXG5jb25zdCBwcm9taXNlUmVzb2x1dGlvbnMgPSB7fVxuZnVuY3Rpb24gbWFpbkFsZ29yaXRobSAoZXh0ZW5kZWRQb2ludHMsIHBhcmFtcyA9IHt9KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgZXh0ZW5kZWRQb2ludHMgPSBleHRlbmRlZFBvaW50cy5tYXAocCA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogcC5pZCxcbiAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICB4OiBwLnBvc2l0aW9uLngsXG4gICAgICAgICAgeTogLXAucG9zaXRpb24ueSAvLyBUaGUgYWxnb3JpdGhtIGV4cGVjdHMgeSB0byBncm93IHVwd2FyZHNcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWw6IHAubGFiZWxcbiAgICAgIH1cbiAgICB9KVxuICAgIGNvbnN0IHByb2Nlc3NVVUlEID0gcGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApLnRvU3RyaW5nKCkgLy8gbm8gbmVlZCBmb3IgYW55dGhpbmcgZmFuY3lcbiAgICBhbGdvcml0aG0ucG9zdE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogJ3N0YXJ0JyxcbiAgICAgIGV4dGVuZGVkUG9pbnRzLFxuICAgICAgcGFyYW1zLFxuICAgICAgcHJvY2Vzc1VVSURcbiAgICB9KVxuICAgIHByb21pc2VSZXNvbHV0aW9uc1twcm9jZXNzVVVJRF0gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGV2ZW50LmRhdGEucmVzdWx0Lm1hcChwID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogcC5pZCxcbiAgICAgICAgICByZWN0YW5nbGU6IHtcbiAgICAgICAgICAgIGxlZnQ6IHAucmVjdGFuZ2xlLmxlZnQsXG4gICAgICAgICAgICByaWdodDogcC5yZWN0YW5nbGUucmlnaHQsXG4gICAgICAgICAgICB0b3A6IC1wLnJlY3RhbmdsZS50b3AsXG4gICAgICAgICAgICBib3R0b206IC1wLnJlY3RhbmdsZS5ib3R0b21cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICByZXR1cm4gcmVzb2x2ZShyZXN1bHQpXG4gICAgfVxuICB9KVxufVxuYWxnb3JpdGhtLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YVxuICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgIGNhc2UgJ2VuZCc6XG4gICAgICBlbmRFdmVudChldmVudClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoaXMgZXZlbnQgY2FzZSBzaG91bGQgbm90IGhhcHBlbicsIGRhdGEudHlwZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmRFdmVudCAoZXZlbnQpIHtcbiAgY29uc3Qge3Byb2Nlc3NVVUlEfSA9IGV2ZW50LmRhdGFcbiAgY29uc3QgY2FsbGJhY2sgPSBwcm9taXNlUmVzb2x1dGlvbnNbcHJvY2Vzc1VVSURdXG4gIGNhbGxiYWNrKGV2ZW50KVxuICBkZWxldGUgcHJvbWlzZVJlc29sdXRpb25zW3Byb2Nlc3NVVUlEXVxufSIsImxldCBOVU1CRVJfT0ZfUkFZU1xuLy8gQ2FsbGVkIGFzIHdlYndvcmtlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2VsZikge1xuICBpbXBvcnRTY3JpcHRzKCdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbG9kYXNoLzQuMTcuNC9sb2Rhc2gubWluLmpzJylcbiAgY29uc3QgZXh0ZW5kZWRQb2ludE1ldGhvZHMgPSByZXF1aXJlKCcuL2V4dGVuZGVkLXBvaW50LW1ldGhvZHMnKVxuICBjb25zdCBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpXG4gIGNvbnN0IHJheUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LWludGVyc2VjdGlvbicpLnJheUludGVyc2VjdGlvblxuICBjb25zdCBpdGVyYXRpdmVHcmVlZHkgPSByZXF1aXJlKCdpdGVyYXRpdmUtZ3JlZWR5JylcbiAgaWYgKHR5cGVvZiBwb3N0TWVzc2FnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzZWxmLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGRhdGEgPSBldmVudC5kYXRhXG4gICAgICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgbGF1bmNoTWFpbkFsZ29yaXRobUZyb21FdmVudChldmVudClcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBhIHZhbGlkIGV2ZW50IHR5cGUnLCBkYXRhLnR5cGUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbGF1bmNoTWFpbkFsZ29yaXRobUZyb21FdmVudCAoZXZlbnQpIHtcbiAgICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YVxuICAgIGNvbnN0IGV4dGVuZGVkUG9pbnRzID0gZGF0YS5leHRlbmRlZFBvaW50c1xuICAgIGNvbnN0IHBhcmFtcyA9IGRhdGEucGFyYW1zXG4gICAgY29uc3QgcHJvY2Vzc1VVSUQgPSBkYXRhLnByb2Nlc3NVVUlEIC8vIHdlIHVzZSB0aGlzIGluIGNhc2UgdGhlIGFsZ29yaWhtIGlzIHJlcXVpcmVkIHNldmVyYWwgdGltZXNcbiAgICBtYWluQWxnb3JpdGhtKGV4dGVuZGVkUG9pbnRzLCBwYXJhbXMpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnZW5kJyxcbiAgICAgICAgICBwcm9jZXNzVVVJRCxcbiAgICAgICAgICByZXN1bHRcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBtYWluQWxnb3JpdGhtIChleHRlbmRlZFBvaW50cywgcGFyYW1zID0ge30pIHtcbiAgICBOVU1CRVJfT0ZfUkFZUyA9IF8uaXNOdW1iZXIocGFyYW1zLk5VTUJFUl9PRl9SQVlTKSA/IHBhcmFtcy5OVU1CRVJfT0ZfUkFZUyA6IDNcbiAgICBjb25zdCBNQVhfTlVNQkVSX09GX0lURVJBVElPTlMgPSBfLmlzTnVtYmVyKHBhcmFtcy5NQVhfTlVNQkVSX09GX0lURVJBVElPTlMpID8gcGFyYW1zLk1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA6IDFcbiAgICBjb21wdXRlUmF5cyhleHRlbmRlZFBvaW50cylcbiAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5jb21wdXRlSW5pdGlhbEF2YWlsYWJlU3BhY2VzKGV4dGVuZGVkUG9pbnRzLCB7cmFkaXVzOiBwYXJhbXMucmFkaXVzIHx8IDIsIGJib3g6IHBhcmFtcy5iYm94fSlcbiAgICBleHRlbmRlZFBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5yZXNldEF2YWlsYWJsZVNwYWNlKHApXG4gICAgICBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwKVxuICAgIH0pXG4gICAgY29uc3QgcG9zc2libGVQb2ludHMgPSBleHRlbmRlZFBvaW50cy5maWx0ZXIocCA9PiBwLmF2YWlsYWJsZU1lYXN1cmUgPiAwKVxuICAgIHJldHVybiBpdGVyYXRpdmVHcmVlZHkuc29sdmUoXy5wYXJ0aWFsUmlnaHQocmF5SW50ZXJzZWN0aW9uKSwgcG9zc2libGVQb2ludHMsIHJlc2V0RnVuY3Rpb24sIHtzZXJpYWxpemVGdW5jdGlvbiwgTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXB1dGVSYXlzIChleHRlbmRlZFBvaW50cykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXh0ZW5kZWRQb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBwaSA9IGV4dGVuZGVkUG9pbnRzW2ldXG4gICAgICBwaS5yYXlzID0gW11cbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgTlVNQkVSX09GX1JBWVM7IGorKykge1xuICAgICAgICBwaS5yYXlzLnB1c2goIHtcbiAgICAgICAgICBpbmRleDogaSpOVU1CRVJfT0ZfUkFZUyAqIE5VTUJFUl9PRl9SQVlTICo0ICsgaiAqIE5VTUJFUl9PRl9SQVlTICogNCxcbiAgICAgICAgICBzZWxmSW5kZXg6IGosXG4gICAgICAgICAgdmVjdG9yIDoge1xuICAgICAgICAgICAgeDogTWF0aC5zaW4oMiAqIE1hdGguUEkgKiBqIC8gTlVNQkVSX09GX1JBWVMpLFxuICAgICAgICAgICAgeTogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBqIC8gTlVNQkVSX09GX1JBWVMpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4vLyBBdCBlYWNoIGl0ZXJhdGlvbiBvZiBpdGVyYXRpdmUgZ3JlZWR5IGlmIHRoZSBzb2x1dGlvbiBpcyBiZXR0ZXIgd2Ugc2VyaWFsaXplIHdoYXQgd2Ugb2J0YWluZWRcbiAgZnVuY3Rpb24gc2VyaWFsaXplRnVuY3Rpb24gKGFycmF5T2ZQb2ludHMpIHtcbiAgICAvLyBXaGVuIHdlIGxhYmVsIGEgcG9pbnQgd2UgcHJvbW90ZSBsYWJlbCB0byByZWN0YW5nbGUgYW5kIHdlIHJlc2V0IGl0IGF0IGVhY2ggaXRlcmF0aW9uXG4gICAgY29uc3QgbGFiZWxlZFBvaW50cyA9IGFycmF5T2ZQb2ludHMuZmlsdGVyKHBvaW50ID0+ICEhcG9pbnQucmVjdGFuZ2xlKVxuICAgIC8vIFRvIHNlcmlhbGl6ZSB3ZSBuZWVkIGFuIGlkXG4gICAgcmV0dXJuIGxhYmVsZWRQb2ludHMubWFwKHBvaW50ID0+IHsgcmV0dXJuIHtpZDogcG9pbnQuaWQsIHJlY3RhbmdsZTogXy5jbG9uZShwb2ludC5yZWN0YW5nbGUpfSB9KVxuICB9XG5cbi8vIEF0IGVhY2ggaXRlcmF0aW9uIG9mIGl0ZXJhdGl2ZSBncmVlZHkgd2UgcmVzZXQgdGhlIGNvbmRpdGlvbnNcbiAgZnVuY3Rpb24gcmVzZXRGdW5jdGlvbiAoZ2VuZXJhbGl6ZWRQb2ludCkge1xuICAgIGdlbmVyYWxpemVkUG9pbnQucmVjdGFuZ2xlID0gbnVsbFxuICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnJlc2V0QXZhaWxhYmxlU3BhY2UoZ2VuZXJhbGl6ZWRQb2ludClcbiAgfVxufVxuXG4iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge211bHRpSW50ZXJ2YWx9XG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbmNvbnN0IF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbClcbi8vRGlzam9pbnQgdW5pb24gb2Ygc2V2ZXJhbCBpbnRlcnZhbHNcbi8vIGludGVydmFscyBhcnJheSBvZiBjb29yZGluYXRlc1xuZnVuY3Rpb24gTXVsdGlJbnRlcnZhbChpbnRlcnZhbHMsIGlzQ2xvbmUpIHtcbiAgLy8gTm90IHZlcnkgbmljZSBidXQgaXQgaXMgaGFyZCB0byBjbG9uZSBpbiBqc1xuICBpZiAoaXNDbG9uZSkge1xuICAgIHRoaXMuaW50ZXJ2YWxzID0gXy5jbG9uZShpbnRlcnZhbHMpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBpZiAoIUFycmF5LmlzQXJyYXkoaW50ZXJ2YWxzKSB8fCBpbnRlcnZhbHMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhpcy5pbnRlcnZhbHMgPSBbXVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgdGhpcy5pbnRlcnZhbHMgPSBbXVxuICB2YXIgY2hlY2tlZEludGVydmFscyA9IFtdXG4gIC8vIFNvIHdlIGNhbiBjaGVjayBpbnRlcnZhbFxuICB2YXIgaW50ZXJ2YWxDb25zdHJ1Y3RvciA9IGludGVydmFsKDAsIDEpLmNvbnN0cnVjdG9yXG4gIGZvciAobGV0IG15SW50ZXJ2YWwgb2YgaW50ZXJ2YWxzKSB7XG4gICAgaWYgKCEgbXlJbnRlcnZhbCBpbnN0YW5jZW9mIGludGVydmFsQ29uc3RydWN0b3IpIHtcbiAgICAgIHRoaXMuaW50ZXJ2YWxzID0gW11cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICAgIGlmICghbXlJbnRlcnZhbC5lbXB0eSkge1xuICAgICAgY2hlY2tlZEludGVydmFscy5wdXNoKG15SW50ZXJ2YWwuY2xvbmUoKSlcbiAgICB9XG4gIH1cblxuICBjaGVja2VkSW50ZXJ2YWxzLnNvcnQoKGkxLCBpMikgPT4gaTEuc3RhcnQgLSBpMi5zdGFydClcblxuICAvLyBOb3cgd2UgbmVlZCB0byBjb2FsZXNjZSBpbnRlcnZhbHMgaWYgbmVlZGVkXG4gIGxldCBuZXh0SW50ZXJ2YWwgPSBudWxsXG4gIGZvciAobGV0IG15SW50ZXJ2YWwgb2YgY2hlY2tlZEludGVydmFscykge1xuICAgIGlmIChuZXh0SW50ZXJ2YWwgPT09IG51bGwpIHtcbiAgICAgIG5leHRJbnRlcnZhbCA9IG15SW50ZXJ2YWxcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFuZXh0SW50ZXJ2YWwuaW50ZXJzZWN0KG15SW50ZXJ2YWwpLmVtcHR5KSB7XG4gICAgICAgIG5leHRJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UobXlJbnRlcnZhbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWxzLnB1c2gobmV4dEludGVydmFsLnN0YXJ0LCBuZXh0SW50ZXJ2YWwuZW5kKVxuICAgICAgICBuZXh0SW50ZXJ2YWwgPSBteUludGVydmFsXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChuZXh0SW50ZXJ2YWwpIHtcbiAgICB0aGlzLmludGVydmFscy5wdXNoKG5leHRJbnRlcnZhbC5zdGFydCwgbmV4dEludGVydmFsLmVuZClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuTXVsdGlJbnRlcnZhbC5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBNdWx0aUludGVydmFsKFtdKVxufVxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICF0aGlzLmludGVydmFscy5sZW5ndGhcbn1cblxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUuaW50ZXJ2YWxDb25zdHJ1Y3RvciA9IGludGVydmFsKDAsIDEpLmNvbnN0cnVjdG9yXG5cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IE11bHRpSW50ZXJ2YWwodGhpcy5pbnRlcnZhbHMsIHRydWUpXG59XG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAobXlJbnRlcnZhbCkge1xuICBpZiAoISBteUludGVydmFsIGluc3RhbmNlb2YgdGhpcy5pbnRlcnZhbENvbnN0cnVjdG9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYW4gaW50ZXJ2YWwnKVxuICB9XG4gIGlmICh0aGlzLmlzRW1wdHkoKSB8fCBteUludGVydmFsLmVtcHR5KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBfcmVtb3ZlKHRoaXMuaW50ZXJ2YWxzLCBteUludGVydmFsLnN0YXJ0LCBteUludGVydmFsLmVuZClcbiAgcmV0dXJuIHRoaXNcbn1cbi8vIFJlbW92ZXMgaW4gcGxhY2VcbmZ1bmN0aW9uIF9yZW1vdmUoaW50ZXJ2YWxzLCBteVN0YXJ0LCBteUVuZCkge1xuICBsZXQgaSA9IDBcbiAgd2hpbGUgKGkgPCBpbnRlcnZhbHMubGVuZ3RoKSB7XG4gICAgY29uc3QgaW50ZXJ2YWxTdGFydCA9IGludGVydmFsc1tpXVxuICAgIGNvbnN0IGludGVydmFsRW5kID0gaW50ZXJ2YWxzW2kgKyAxXVxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15RW5kKSB7XG4gICAgICBicmVhayAvLyBubyBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICAvLyBubyBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxFbmQgPD0gbXlTdGFydCkge1xuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBmdWxsIGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15U3RhcnQgJiYgaW50ZXJ2YWxFbmQgPD0gbXlFbmQpIHtcbiAgICAgIGludGVydmFscy5zcGxpY2UoaSwgMilcbiAgICAgIC8vIGkgZG9lcyBub3QgZ3JvdyB3ZSBkZWNyZWFzZSBsZW5ndGhcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGxlZnQgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlTdGFydCAmJiBpbnRlcnZhbEVuZCA+IG15RW5kKSB7XG4gICAgICBpbnRlcnZhbHNbaV0gPSBteUVuZFxuICAgICAgYnJlYWsgLy8gVGhlcmUgd29uJ3QgYmUgYW55IG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIC8vIHJpZ2h0IGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbEVuZCA8PSBteUVuZCAmJiBpbnRlcnZhbFN0YXJ0IDwgbXlTdGFydCkge1xuICAgICAgaW50ZXJ2YWxzW2kgKyAxXSA9IG15U3RhcnRcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gaW50ZXJzZWN0cyBpbiB0aGUgbWlkZGxlXG4gICAgaWYgKGludGVydmFsRW5kID4gbXlFbmQgJiYgaW50ZXJ2YWxTdGFydCA8IG15U3RhcnQpIHtcbiAgICAgIGludGVydmFscy5zcGxpY2UoaSArIDEsIDAsIG15U3RhcnQsIG15RW5kKVxuICAgICAgYnJlYWsgLy8gdGhlcmUgd29uJ3QgYmUgYW55IG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIGNvbnNvbGUuZXJyb3IoJ1RoaXMgc2hvdWxkIG5vdCBoYXBwZW4nLCBteVN0YXJ0LCBteUVuZCwgaW50ZXJ2YWxTdGFydCwgaW50ZXJ2YWxFbmQpXG4gICAgaSArPSAyXG4gIH1cbiAgcmV0dXJuIGludGVydmFsc1xufVxuXG4vLyBJbiBwbGFjZVxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUubXVsdGlwbGVSZW1vdmUgPSBmdW5jdGlvbiAobXlNdWx0aUludGVydmFsKSB7XG4gIGlmICghIG15TXVsdGlJbnRlcnZhbCBpbnN0YW5jZW9mIE11bHRpSW50ZXJ2YWwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhIG11bHRpIGludGVydmFsJylcbiAgfVxuICBpZiAodGhpcy5pc0VtcHR5KCkgfHwgbXlNdWx0aUludGVydmFsLmlzRW1wdHkoKSkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBteU11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgX3JlbW92ZSh0aGlzLmludGVydmFscywgbXlNdWx0aUludGVydmFsLmludGVydmFsc1tpXSwgbXlNdWx0aUludGVydmFsLmludGVydmFsc1tpICsgMV0pXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuZnVuY3Rpb24gX21lYXN1cmVJbnRlcnNlY3Rpb24gKGludGVydmFscywgbXlTdGFydCwgbXlFbmQpIHtcbiAgbGV0IGkgPSAwXG4gIGxldCBtZWFzdXJlID0gMFxuICB3aGlsZSAoaSA8IGludGVydmFscy5sZW5ndGgpIHtcbiAgICBjb25zdCBpbnRlcnZhbFN0YXJ0ID0gaW50ZXJ2YWxzW2ldXG4gICAgY29uc3QgaW50ZXJ2YWxFbmQgPSBpbnRlcnZhbHNbaSArIDFdXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlFbmQpIHtcbiAgICAgIGJyZWFrIC8vIG5vIG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIC8vIG5vIGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbEVuZCA8PSBteVN0YXJ0KSB7XG4gICAgICBpICs9IDJcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGZ1bGwgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlTdGFydCAmJiBpbnRlcnZhbEVuZCA8PSBteUVuZCkge1xuICAgICAgbWVhc3VyZSArPSB1dGlscy5tZWFzdXJlKGludGVydmFsU3RhcnQsIGludGVydmFsRW5kKVxuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBsZWZ0IGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15U3RhcnQgJiYgaW50ZXJ2YWxFbmQgPiBteUVuZCkge1xuICAgICAgbWVhc3VyZSArPSB1dGlscy5tZWFzdXJlKGludGVydmFsU3RhcnQsIG15RW5kKVxuICAgICAgYnJlYWsgLy8gVGhlcmUgd29uJ3QgYmUgYW55IG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIC8vIHJpZ2h0IGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbEVuZCA8PSBteUVuZCAmJiBpbnRlcnZhbFN0YXJ0IDwgbXlTdGFydCkge1xuICAgICAgbWVhc3VyZSArPSB1dGlscy5tZWFzdXJlKG15U3RhcnQsIGludGVydmFsRW5kKVxuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBpbnRlcnNlY3RzIGluIHRoZSBtaWRkbGVcbiAgICBpZiAoaW50ZXJ2YWxFbmQgPiBteUVuZCAmJiBpbnRlcnZhbFN0YXJ0IDwgbXlTdGFydCkge1xuICAgICAgbWVhc3VyZSArPSB1dGlscy5tZWFzdXJlKG15U3RhcnQsIG15RW5kKVxuICAgICAgYnJlYWsgLy8gdGhlcmUgd29uJ3QgYmUgYW55IG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIGNvbnNvbGUuZXJyb3IoJ1RoaXMgc2hvdWxkIG5vdCBoYXBwZW4nLCBteVN0YXJ0LCBteUVuZCwgaW50ZXJ2YWxTdGFydCwgaW50ZXJ2YWxFbmQpXG4gICAgaSArPSAyXG4gIH1cbiAgcmV0dXJuIG1lYXN1cmVcbn1cblxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUubWVhc3VyZU11bHRpcGxlSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKG11bHRpSW50ZXJ2YWwpIHtcbiAgbGV0IG1lYXN1cmUgPSAwXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbXVsdGlJbnRlcnZhbC5pbnRlcnZhbHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBtZWFzdXJlICs9IF9tZWFzdXJlSW50ZXJzZWN0aW9uKHRoaXMuaW50ZXJ2YWxzLCBtdWx0aUludGVydmFsLmludGVydmFsc1tpXSwgbXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaSsxXSlcbiAgfVxuICByZXR1cm4gbWVhc3VyZVxufVxuXG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5tZWFzdXJlID0gZnVuY3Rpb24gKCkge1xuICBsZXQgbWVhc3VyZSA9IDBcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmludGVydmFscy5sZW5ndGg7IGkgKz0gMikge1xuICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZSh0aGlzLmludGVydmFsc1tpXSwgdGhpcy5pbnRlcnZhbHNbaSArIDFdKVxuICB9XG4gIHJldHVybiBtZWFzdXJlXG59XG5cblxuLy9UT0RPIHRlc3Rcbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmdldE1pbiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuaXNFbXB0eSgpKSByZXR1cm4gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG4gIHJldHVybiB0aGlzLmludGVydmFsc1swXS8vdGhpcy5pbnRlcnZhbHMucmVkdWNlKChtaW4sIGN1cikgPT4gY3VyLnN0YXJ0IDwgbWluID8gY3VyLnN0YXJ0IDogbWluLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG59XG5cbm11bHRpSW50ZXJ2YWwuY29hbGVzY2UgPSBmdW5jdGlvbiAoaW50ZXJ2YWwsIGFub3RoZXJJbnRlcnZhbCkge1xuICBpZiAoaW50ZXJ2YWwuc3RhcnQgPiBhbm90aGVySW50ZXJ2YWwuZW5kIHx8IGFub3RoZXJJbnRlcnZhbC5zdGFydCA+IGludGVydmFsLmVuZCkge1xuICAgIHJldHVybiBtdWx0aUludGVydmFsKFtpbnRlcnZhbCwgYW5vdGhlckludGVydmFsXSlcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbXVsdGlJbnRlcnZhbChbaW50ZXJ2YWwuY29hbGVzY2UoYW5vdGhlckludGVydmFsKV0pXG4gIH1cbn1cbm11bHRpSW50ZXJ2YWwuZW1wdHkgPSBNdWx0aUludGVydmFsLmVtcHR5XG5cbmZ1bmN0aW9uIG11bHRpSW50ZXJ2YWwgKGludGVydmFscykge1xuICByZXR1cm4gbmV3IE11bHRpSW50ZXJ2YWwoaW50ZXJ2YWxzKVxufSIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSB7cmF5SW50ZXJzZWN0aW9ufVxuXG5jb25zdCBmaW5kQmVzdFJheSA9IHJlcXVpcmUoJy4vZmluZC1iZXN0LXJheScpXG5jb25zdCBleHRlbmRlZFBvaW50TWV0aG9kcyA9IHJlcXVpcmUoJy4vZXh0ZW5kZWQtcG9pbnQtbWV0aG9kcycpXG5jb25zdCBtdWx0aUludGVydmFsID0gcmVxdWlyZSgnLi9tdWx0aS1pbnRlcnZhbCcpLm11bHRpSW50ZXJ2YWxcbmNvbnN0IGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG4vLyBCZXR0ZXIgdG8gZ3JhYiB0aGUgbW9kdWxlIGhlcmUgYW5kIGZldGNoIHRoZSBtZXRob2QgaW4gdGhlIGFsZ29yaXRobSwgdGhhdCB3YXkgd2UgY2FuIHN0dWJcbmNvbnN0IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJylcbmNvbnN0IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtc2VnbWVudC1pbnRlcnNlY3Rpb24nKVxuY29uc3QgcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLnJheVJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgcmF5U2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LXNlZ21lbnQtaW50ZXJzZWN0aW9uJykucmF5U2VnbWVudEludGVyc2VjdGlvblxuY29uc3QgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKVxuXG4vLyBUT0RPIHVzZSBzZXRzXG5hc3luYyBmdW5jdGlvbiByYXlJbnRlcnNlY3Rpb24gKHBvaW50c1RvTGFiZWwsIHBvaW50c05vdFRvTGFiZWwpIHtcbiAgcG9pbnRzVG9MYWJlbC5mb3JFYWNoKHA9PiBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwKSlcbiAgY29uc3QgcmVqZWN0ZWRQb2ludHMgPSBfLmZpbHRlcihwb2ludHNUb0xhYmVsLCBwID0+IHAuYXZhaWxhYmxlTWVhc3VyZSA9PT0gMClcbiAgLy8gUCBpbiB0aGUgYXJ0aWNsZVxuICB2YXIgcmVtYWluaW5nUG9pbnRzID0gXy5maWx0ZXIocG9pbnRzVG9MYWJlbCwgcCA9PiBwLmF2YWlsYWJsZU1lYXN1cmUgPiAwKVxuICB2YXIgUDAgPSBwb2ludHNUb0xhYmVsLmNvbmNhdChwb2ludHNOb3RUb0xhYmVsKVxuICBjb25zdCBwb2ludHNMYWJlbGVkID0gW10gLy8gSGVyZSB3ZSBkaWZmZXIgZnJvbSB0aGUgb3JpZ2luYWwgYXJ0aWNsZSwgb25jZSB3ZSBmaW5kIGEgcG9pbnQgaW4gUCB0byBsYWJlbCB3ZSByZW1vdmUgaXQgZnJvbSBQIGFuZCBhZGQgaXQgdG8gcG9pbnRzTGFiZWxlZCwgb3RoZXJ3aXNlIHRoZSBhbGdvcml0aG0gZG9lcyBub3QgZmluaXNoXG4gIHdoaWxlIChyZW1haW5pbmdQb2ludHMubGVuZ3RoICE9PSAwKSB7XG4gICAgbGV0IGJlc3RSYXkgPSBhd2FpdCBmaW5kQmVzdFJheS5maW5kQmVzdFJheShyZW1haW5pbmdQb2ludHMsIHBvaW50c05vdFRvTGFiZWwpXG4gICAgbGV0IHJpaiA9IGJlc3RSYXkucmJlc3RcbiAgICBsZXQgcGkgPSBiZXN0UmF5LnBiZXN0XG4gICAgaWYgKHJpaiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBJdCBjb3VsZCBvbmx5IGhhcHBlbiB0aGF0IHdlIGdldCByaWogdW5kZWZpbmVkIGluIHRoZSBmaXJzdCBpdGVyYXRpb25cbiAgICAgIGlmIChwb2ludHNMYWJlbGVkLmxlbmd0aCAhPT0gMCB8fCByZWplY3RlZFBvaW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGJlaGF2aW91cicpXG4gICAgICB9XG4gICAgICByZXR1cm4ge2Nob3NlbjogW10sIHJlamVjdGVkOiBfLmNsb25lKHBvaW50c1RvTGFiZWwpfVxuICAgIH1cbiAgICBsZXQgdmkgPSB7eDogcmlqLnZlY3Rvci54ICogcmlqLmF2YWlsYWJsZS5nZXRNaW4oKSwgeTogcmlqLnZlY3Rvci55ICogcmlqLmF2YWlsYWJsZS5nZXRNaW4oKX1cbiAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5wcm9tb3RlTGFiZWxUb1JlY3RhbmdsZShwaSwgdmkpXG4gICAgcmVtYWluaW5nUG9pbnRzID0gcmVtYWluaW5nUG9pbnRzLmZpbHRlcihlbCA9PiBlbCAhPT0gcGkpXG4gICAgUDAgPSBQMC5maWx0ZXIoZWwgPT4gZWwgIT09IHBpKVxuICAgIHBvaW50c0xhYmVsZWQucHVzaChwaSlcbiAgICBmb3IgKGxldCBwayBvZiBQMCkge1xuICAgICAgZm9yIChsZXQgcmtsIG9mIHBrLnJheXMpIHtcbiAgICAgICAgbGV0IGxhYmVsSW50ZXJzZWN0aW9uXG4gICAgICAgIGxldCBzZWdtZW50SW50ZXJzZWN0aW9uXG4gICAgICAgIGNvbnN0IGxhYmVsSW50ZXJ2YWwgPSBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbi5sYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbihwaS5yZWN0YW5nbGUsIHBrLmxhYmVsLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3Qgc2VnbWVudEludGVydmFsID0gbGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uLmxhYmVsU2VnbWVudEludGVyc2VjdGlvbihwaS5wb3NpdGlvbiwgdmksIHBrLmxhYmVsLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3QgcmF5SW50ZXJ2YWwgPSByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocGkucmVjdGFuZ2xlLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3QgcmF5U2VnbWVudEludGVydmFsID0gcmF5U2VnbWVudEludGVyc2VjdGlvbihwaS5wb3NpdGlvbiwgdmksIHBrLnBvc2l0aW9uLCBya2wudmVjdG9yKVxuICAgICAgICBsYWJlbEludGVyc2VjdGlvbiA9IGxhYmVsSW50ZXJ2YWwuY29hbGVzY2VJblBsYWNlKHJheUludGVydmFsKVxuICAgICAgICBzZWdtZW50SW50ZXJzZWN0aW9uID0gc2VnbWVudEludGVydmFsLmNvYWxlc2NlSW5QbGFjZShyYXlTZWdtZW50SW50ZXJ2YWwpXG4gICAgICAgIGlmICghbGFiZWxJbnRlcnNlY3Rpb24uZW1wdHkgfHwgIXNlZ21lbnRJbnRlcnNlY3Rpb24uZW1wdHkpIHtcbiAgICAgICAgICBya2wuYXZhaWxhYmxlLm11bHRpcGxlUmVtb3ZlKG11bHRpSW50ZXJ2YWwuY29hbGVzY2UobGFiZWxJbnRlcnNlY3Rpb24sIHNlZ21lbnRJbnRlcnNlY3Rpb24pKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwaylcblxuICAgICAgLy8gVGhlIG9yaWdpbmFsIGFydGljbGUgaXMgbm90IHZlcnkgY2xlYXIgaGVyZS4gSXQgcmVtb3ZlcyB0aGUgcG9pbnQgZnJvbSBQIGJ1dCB0aGUgaXRlcmF0aW9uIHdhcyBvbiBQMC4gSSBzdXBwb3NlIHRoYXQgaWYgdGhlIGludGVncmFsIGlzIDAgYW5kIHRoZSBwb2ludCBpcyBpbiBQIHRoZW4gaXQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IGl0ZXJhdGlvbiBvZiB0aGUgZ3JlZWR5IGFsZ29yaXRobVxuICAgICAgaWYgKHBrLmF2YWlsYWJsZU1lYXN1cmUgPT09IDAgJiYgcmVtYWluaW5nUG9pbnRzLmZpbmRJbmRleChlbCA9PiBlbCA9PT0gcGspICE9PSAtMSl7XG4gICAgICAgIFAwID0gUDAuZmlsdGVyKGVsID0+IGVsICE9PSBwaylcbiAgICAgICAgcmVtYWluaW5nUG9pbnRzID0gcmVtYWluaW5nUG9pbnRzLmZpbHRlcihlbCA9PiBlbCAhPT0gcGspXG4gICAgICAgIHJlamVjdGVkUG9pbnRzLnB1c2gocGspXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB7Y2hvc2VuOiBwb2ludHNMYWJlbGVkLCByZWplY3RlZDogcmVqZWN0ZWRQb2ludHN9XG59IiwiLy8gR2l2ZW4gYSByYXkgYW5kIGEgcmVjdGFuZ2xlLCByZXR1cm4gdGhlIGludGVydmFsIGZyb20gdGhlIGludGVyc2VjdGlvbiB0byBpbmZpbml0eSAoaXQgYmxvY2tzIHRoZSByYXkpXG5tb2R1bGUuZXhwb3J0cyA9IHtyYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb259XG5jb25zdCBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLmxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuXG5mdW5jdGlvbiByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24gKGxrLCB2aSwgcGkpIHtcbiAgLy8gQmFzaWNhbGx5IG1ha2UgYSBmYWtlIGxhYmVsIG9mIDAgaGVpZ2h0IGFuZCB3aWR0aFxuICBjb25zdCBsaSA9IHtoZWlnaHQ6IDAsIHdpZHRoOiAwfVxuICBjb25zdCBpbnRlcnNlY3Rpb24gPSBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbihsaywgbGksIHZpLCBwaSlcbiAgaWYgKGludGVyc2VjdGlvbi5lbXB0eSkge1xuICAgIHJldHVybiBpbnRlcnNlY3Rpb25cbiAgfVxuICByZXR1cm4gaW50ZXJ2YWwoaW50ZXJzZWN0aW9uLnN0YXJ0LCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtyYXlTZWdtZW50SW50ZXJzZWN0aW9ufVxuXG5jb25zdCBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vc2VnbWVudC1zZWdtZW50LWludGVyc2VjdGlvbicpLnNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uXG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuXG4vKlxucGosIHZqIGRlZmluZXMgYSByYXlcbiAqL1xuZnVuY3Rpb24gcmF5U2VnbWVudEludGVyc2VjdGlvbiAocGksIHZpLCBwaiwgdmopIHtcbiAgY29uc3QgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24ocGosIHZqLCBwaSwgdmkpXG4gIGlmIChpbnRlcnNlY3Rpb24gPT09IG51bGwpIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gIGNvbnN0IHt0LCBzfSA9IGludGVyc2VjdGlvblxuICAvLyB0IGlzIHRpbWUgaW4gcmF5LCBzIHBhcmFtZXRlciBvbiB0aGUgc2VnbWVudFxuICBpZiAodCA8PSAwIHx8IHMgPCAwIHx8IHMgPiAxKSB7XG4gICAgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgfVxuICByZXR1cm4gaW50ZXJ2YWwodCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxufSIsIm1vZHVsZS5leHBvcnRzID0ge3NlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9ufVxuLy8gQSBwb2ludCBwaSBtb3ZlcyB3aXRoIHZpLCBhIHNlZ21lbnQgaXMgZGVmaW5lZCB3aXRoIHBqLCB2aiwgd2UgZmluZCB0aGUgdGltZSB0IGF0IHdoaWNoIHRoZSBwb2ludCBpbnRlcnNlY3RzIGFuZCByZXR1cm5zIHBhcmFtZXRlcnMgcyBvbiB0aGUgc2VnbWVudFxuLy8gVE9ETyBjaGFuZ2Ugb3JkZXIgc28gdGhhdCBwaiwgdmogaXMgdGhlIHJheVxuZnVuY3Rpb24gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24gKHBpLCB2aSwgcGosIHZqIC8qIFZlY3RvciBvZiB0aGUgc2VnbWVudCAqLykge1xuICAvLyAodmkgLXZqKSh0LCBzKV5UID0gKHBqIC0gcGkpXG4gIHZhciBkZXQgPSAtKHZpLnggKiB2ai55IC0gdmoueCAqIHZpLnkpXG4gIGlmIChkZXQgPT09IDApIHsgLy8gUGFyYWxsZWwgbGluZXNcbiAgICAvLyBUZXN0IHRoaXNcbiAgICBpZiAoKHBpLnggLSBwai54KSAqIHZqLnkgLSAocGkuaiAtIHBqLnkpICogdmoueCAhPT0gMCkgcmV0dXJuIG51bGwgLy8gTGluZSBkb2VzIG5vdCBiZWxvbmdcbiAgICAvLyBUT0RPIGNvbmN1cnJlbnQgbGluZXNcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFsbGVsIGxpbmVzIG5vdCBhbGxvd2VkJykgLy8gVGhpcyBtdXN0IGJlIGhhbmRsZWQgb3V0IG9mIHRoZSBhbGdvcml0aG1cbiAgfVxuICBjb25zdCB0ID0gKC0ocGoueCAtIHBpLngpICogdmoueSArIChwai55IC0gcGkueSkgKiB2ai54KSAvIGRldFxuICBjb25zdCBzID0gKC0ocGoueCAtIHBpLngpICogdmkueSArIChwai55IC0gcGkueSkgKiB2aS54KSAvIGRldFxuICByZXR1cm4ge3QsIHN9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtjb21wYXJlQXJyYXlzTGV4aWNvZ3JhcGhpY2FsbHksIG1lYXN1cmV9XG5cbmZ1bmN0aW9uIGNvbXBhcmVBcnJheXNMZXhpY29ncmFwaGljYWxseSAoYXJyMSwgYXJyMikge1xuICB2YXIgaSA9IDBcbiAgd2hpbGUgKGkgPCBNYXRoLm1pbihhcnIxLmxlbmd0aCwgYXJyMi5sZW5ndGgpKSB7XG4gICAgaWYgKGFycjFbaV0gIT0gYXJyMltpXSkgcmV0dXJuIGFycjFbaV0gLSBhcnIyW2ldXG4gICAgaSsrXG4gIH1cbiAgcmV0dXJuIGFycjEubGVuZ3RoIC0gYXJyMi5sZW5ndGhcbn1cblxuZnVuY3Rpb24gbWVhc3VyZSAoc3RhcnQsIGVuZCkge1xuICByZXR1cm4gTWF0aC5wb3coMiwgLXN0YXJ0KSAtIE1hdGgucG93KDIsIC1lbmQpXG59Il19
