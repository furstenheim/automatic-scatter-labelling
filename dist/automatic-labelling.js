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
module.exports = { mainAlgorithm };
const work = require('webworkify');
const algorithm = work(require('./main-algorithm.js'));
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
      console.error('src/main-algorithm-loader.js:47:20:\'This event case should not happen\',data.type', 'This event case should not happen', data.type);
  }
};

function endEvent(event) {
  const { processUUID } = event.data;
  const callback = promiseResolutions[processUUID];
  callback(event);
  delete promiseResolutions[processUUID];
}

},{"./main-algorithm.js":10,"webworkify":3}],10:[function(require,module,exports){
(function (global){
let NUMBER_OF_RAYS;
// Called as webworker
module.exports = function (self) {
  importScripts('https://cdn.jsdelivr.net/lodash/4.17.4/lodash.min.js');
  const extendedPointMethods = require('./extended-point-methods');
  console.log('src/main-algorithm.js:6:14:\'main algorithm loaded\'', 'main algorithm loaded');
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
          console.error('src/main-algorithm.js:18:24:\'Not a valid event type\',data.type', 'Not a valid event type', data.type);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pdGVyYXRpdmUtZ3JlZWR5L2Rpc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd2Vid29ya2lmeS9pbmRleC5qcyIsInNyYy9leHRlbmRlZC1wb2ludC1tZXRob2RzLmpzIiwic3JjL2ZpbmQtYmVzdC1yYXkuanMiLCJzcmMvaW50ZXJ2YWwuanMiLCJzcmMvbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9sYWJlbC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy9tYWluLWFsZ29yaXRobS1sb2FkZXIuanMiLCJzcmMvbWFpbi1hbGdvcml0aG0uanMiLCJzcmMvbXVsdGktaW50ZXJ2YWwuanMiLCJzcmMvcmF5LWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktc2VnbWVudC1pbnRlcnNlY3Rpb24uanMiLCJzcmMvc2VnbWVudC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxNQUFNLFNBQVUsT0FBTyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDLE9BQU8sR0FBUCxDQUFoQyxHQUE4QyxPQUFPLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0MsT0FBTyxHQUFQLENBQWhDLEdBQThDLElBQTVHO0FBQ0EsTUFBTSxzQkFBc0IsUUFBUSw2QkFBUixDQUE1QjtBQUNBLE9BQU8sT0FBUCxHQUFpQixvQkFBb0IsYUFBckM7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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LEdBQU8sR0FBRyxDQUFYLElBQWdCLEdBQUcsQ0FBNUMsSUFBaUQsR0FBM0Q7QUFDQSxRQUFNLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBWixJQUFpQixHQUFHLENBQXBCLEdBQXdCLENBQUMsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFYLElBQWdCLEdBQUcsQ0FBNUMsSUFBaUQsR0FBM0Q7QUFDQSxTQUFPLEVBQUMsQ0FBRCxFQUFJLENBQUosRUFBUDtBQUNEOzs7QUNmRCxPQUFPLE9BQVAsR0FBaUIsRUFBQyw4QkFBRCxFQUFpQyxPQUFqQyxFQUFqQjs7QUFFQSxTQUFTLDhCQUFULENBQXlDLElBQXpDLEVBQStDLElBQS9DLEVBQXFEO0FBQ25ELE1BQUksSUFBSSxDQUFSO0FBQ0EsU0FBTyxJQUFJLEtBQUssR0FBTCxDQUFTLEtBQUssTUFBZCxFQUFzQixLQUFLLE1BQTNCLENBQVgsRUFBK0M7QUFDN0MsUUFBSSxLQUFLLENBQUwsS0FBVyxLQUFLLENBQUwsQ0FBZixFQUF3QixPQUFPLEtBQUssQ0FBTCxJQUFVLEtBQUssQ0FBTCxDQUFqQjtBQUN4QjtBQUNEO0FBQ0QsU0FBTyxLQUFLLE1BQUwsR0FBYyxLQUFLLE1BQTFCO0FBQ0Q7O0FBRUQsU0FBUyxPQUFULENBQWtCLEtBQWxCLEVBQXlCLEdBQXpCLEVBQThCO0FBQzVCLFNBQU8sS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLENBQUMsS0FBYixJQUFzQixLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQyxHQUFiLENBQTdCO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgbG9kYXNoID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpXG5jb25zdCBtYWluQWxnb3JpdGhtTG9hZGVyID0gcmVxdWlyZSgnLi9zcmMvbWFpbi1hbGdvcml0aG0tbG9hZGVyJylcbm1vZHVsZS5leHBvcnRzID0gbWFpbkFsZ29yaXRobUxvYWRlci5tYWluQWxnb3JpdGhtIiwiXG5cbi8vIFRPRE8gYWRkIHRoZSBwb3NzaWJpbGl0eSB0byBvd24gc2NvcmUgZnVuY3Rpb25cbi8qKlxuICpcbiAqIEBwYXJhbSBncmVlZHlBbGdvcml0aG0gZnVuY3Rpb24gdGhhdCByZWNlaXZlcyB0d28gYXJyYXlzLCBvbmUgb2YgZWxlbWVudHMgdG8gYmUgY29tcHV0ZWQgYW5kIG9uZSBmb3IgdGhlIHBvaW50cyBmb3IgdGhlIHJlc3Qgb2YgdGhlIGl0ZXJhdGlvbnMuXG4gKiBJdCByZXR1cm5zIGFuIG9iamVjdCB3aXRoIHR3byBlbGVtZW50cywgY2hvc2VuIGFuZCByZWplY3RlZFxuICogQHBhcmFtIHN0YXJ0aW5nRGF0YSBzdGFydGluZyBhcnJheSBvZiBlbGVtZW50c1xuICogQHBhcmFtIHJlc2V0RnVuY3Rpb24gZnVuY3Rpb24gdG8gYmUgYXBwbGllZCB0byBlYWNoIGVsZW1lbnQgYXQgdGhlIHN0YXJ0IG9mIGVhY2ggaXRlcmF0aW9uXG4gKiBAcGFyYW0gcGFyYW1zIGV4dHJhIHBhcmFtc1xuICovXG5sZXQgaXRlcmF0aXZlR3JlZWR5QWxnb3JpdGhtID0gKCgpID0+IHtcbiAgdmFyIF9yZWYgPSBfYXN5bmNUb0dlbmVyYXRvcihmdW5jdGlvbiogKGdyZWVkeUFsZ29yaXRobSwgc3RhcnRpbmdEYXRhLCByZXNldEZ1bmN0aW9uLCBwYXJhbXMgPSB7fSkge1xuICAgIGNvbnN0IE1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA9IHR5cGVvZiBwYXJhbXMuTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TID09PSAnbnVtYmVyJyA/IHBhcmFtcy5NQVhfTlVNQkVSX09GX0lURVJBVElPTlMgOiAxMDA7XG4gICAgLy8gQXQgZXZlcnkgbG9vcCBpZiB3ZSBpbXByb3ZlIHRoZSByZXN1bHQgdGhlbiB3ZSBhcHBseSBzZXJpYWxpemUgZnVuY3Rpb24gdG8gdGhlIHJlc3VsdCB0byBzYXZlIGEgY29weVxuICAgIGNvbnN0IHNlcmlhbGl6ZUZ1bmN0aW9uID0gdHlwZW9mIHBhcmFtcy5zZXJpYWxpemVGdW5jdGlvbiA9PT0gJ2Z1bmN0aW9uJyA/IHBhcmFtcy5zZXJpYWxpemVGdW5jdGlvbiA6IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh4KSk7XG4gICAgfTtcbiAgICAvLyBJbiB0aGUgZ3JlZWR5IHF1ZXVlIHdlIHN0b3JlIGFsbCB0aGUgZWxlbWVudHMgaW4gYXJyYXkgaW4gcmV2ZXJzZSBvcmRlciBvZiBleGVjdXRpb25cbiAgICBjb25zdCBncmVlZHlRdWV1ZSA9IFtzdGFydGluZ0RhdGFdO1xuICAgIGxldCBiZXN0R3JlZWR5UXVldWUgPSBbXTtcbiAgICBsZXQgYmVzdFNjb3JlID0gMDtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IE1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUzsgaisrKSB7XG4gICAgICBsZXQgaXRlcmF0aW9uU2NvcmUgPSAwO1xuICAgICAgZ3JlZWR5UXVldWUuZm9yRWFjaChmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuICAgICAgICBjb2xsZWN0aW9uLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICByZXNldEZ1bmN0aW9uLmNhbGwoZWxlbWVudCwgZWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBjb25zdCBuID0gZ3JlZWR5UXVldWUubGVuZ3RoO1xuICAgICAgZm9yIChsZXQgaSA9IG4gLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCB7IGNob3NlbiwgcmVqZWN0ZWQgfSA9IHlpZWxkIGdyZWVkeUFsZ29yaXRobShncmVlZHlRdWV1ZVtpXSwgZmxhdHRlbihncmVlZHlRdWV1ZS5zbGljZSgwLCBpKSkpO1xuICAgICAgICBpdGVyYXRpb25TY29yZSArPSBjaG9zZW4ubGVuZ3RoO1xuICAgICAgICBpZiAoY2hvc2VuLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgIGdyZWVkeVF1ZXVlW2ldID0gY2hvc2VuO1xuICAgICAgICAgIC8vIGVuZCBvZiB0aGUgcXVldWVcbiAgICAgICAgICBpZiAoaSA9PT0gbiAtIDEpIHtcbiAgICAgICAgICAgIGlmIChyZWplY3RlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZ3JlZWR5UXVldWUucHVzaChyZWplY3RlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdyZWVkeVF1ZXVlW2kgKyAxXSA9IFsuLi5ncmVlZHlRdWV1ZVtpICsgMV0sIC4uLnJlamVjdGVkXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgY2hvc2VuLmxlbmd0aCA9PT0gMCB0aGVuIHRoZXNlIGVsZW1lbnRzIGNvdWxkIG5vdCBiZSBhc3NpZ25lZCBldmVuIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHF1ZXVlLCB3ZSBzaG91bGQgZ2V0IHJpZCBvZiB0aGVtXG4gICAgICAgICAgaWYgKGkgIT09IG4gLSAxKSB7XG4gICAgICAgICAgICBncmVlZHlRdWV1ZVtpXSA9IGdyZWVkeVF1ZXVlW2kgKyAxXTtcbiAgICAgICAgICAgIGdyZWVkeVF1ZXVlW2kgKyAxXSA9IHJlamVjdGVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGl0ZXJhdGlvblNjb3JlID4gYmVzdFNjb3JlKSB7XG4gICAgICAgIGJlc3RTY29yZSA9IGl0ZXJhdGlvblNjb3JlO1xuICAgICAgICAvLyBUaGVyZSBtdXN0IGJlIGEgYmV0dGVyIHdheSB0byBzdG9yZSB0aGUgcmVzdWx0XG4gICAgICAgIC8vIFBsdXMgdGhlIG5hbWUgaXMgYSBiaXQgdHJpY2t5LCBvbmUgZXhwZWN0cyB0aGF0IHRoZSBhbGdvcml0aG0gaW4gaXQgcGFzcyBzZXRzIHRoZSBlbGVtZW50c1xuICAgICAgICBiZXN0R3JlZWR5UXVldWUgPSBzZXJpYWxpemVGdW5jdGlvbihmbGF0dGVuKGdyZWVkeVF1ZXVlKSk7XG4gICAgICB9XG4gICAgICBjb25zdCBncmVlZHlRdWV1ZUxlbmd0aCA9IGdyZWVkeVF1ZXVlLnJlZHVjZShmdW5jdGlvbiAobGVuZ3RoLCBhcnJheSkge1xuICAgICAgICByZXR1cm4gbGVuZ3RoICsgYXJyYXkubGVuZ3RoO1xuICAgICAgfSwgMCk7XG4gICAgICBpZiAoaXRlcmF0aW9uU2NvcmUgPT09IGdyZWVkeVF1ZXVlTGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBiZXN0R3JlZWR5UXVldWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXN0R3JlZWR5UXVldWU7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbiBpdGVyYXRpdmVHcmVlZHlBbGdvcml0aG0oX3gsIF94MiwgX3gzKSB7XG4gICAgcmV0dXJuIF9yZWYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn0pKCk7XG5cbmZ1bmN0aW9uIF9hc3luY1RvR2VuZXJhdG9yKGZuKSB7IHJldHVybiBmdW5jdGlvbiAoKSB7IHZhciBnZW4gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyBmdW5jdGlvbiBzdGVwKGtleSwgYXJnKSB7IHRyeSB7IHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTsgdmFyIHZhbHVlID0gaW5mby52YWx1ZTsgfSBjYXRjaCAoZXJyb3IpIHsgcmVqZWN0KGVycm9yKTsgcmV0dXJuOyB9IGlmIChpbmZvLmRvbmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0gZWxzZSB7IHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7IHN0ZXAoXCJuZXh0XCIsIHZhbHVlKTsgfSwgZnVuY3Rpb24gKGVycikgeyBzdGVwKFwidGhyb3dcIiwgZXJyKTsgfSk7IH0gfSByZXR1cm4gc3RlcChcIm5leHRcIik7IH0pOyB9OyB9XG5cbm1vZHVsZS5leHBvcnRzID0geyBzb2x2ZTogaXRlcmF0aXZlR3JlZWR5QWxnb3JpdGhtIH07XG5cbmZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXlzKSB7XG4gIHJldHVybiBhcnJheXMucmVkdWNlKChhMSwgYTIpID0+IGExLmNvbmNhdChhMiksIFtdKTtcbn0iLCJ2YXIgYnVuZGxlRm4gPSBhcmd1bWVudHNbM107XG52YXIgc291cmNlcyA9IGFyZ3VtZW50c1s0XTtcbnZhciBjYWNoZSA9IGFyZ3VtZW50c1s1XTtcblxudmFyIHN0cmluZ2lmeSA9IEpTT04uc3RyaW5naWZ5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgb3B0aW9ucykge1xuICAgIHZhciB3a2V5O1xuICAgIHZhciBjYWNoZUtleXMgPSBPYmplY3Qua2V5cyhjYWNoZSk7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNhY2hlS2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGtleSA9IGNhY2hlS2V5c1tpXTtcbiAgICAgICAgdmFyIGV4cCA9IGNhY2hlW2tleV0uZXhwb3J0cztcbiAgICAgICAgLy8gVXNpbmcgYmFiZWwgYXMgYSB0cmFuc3BpbGVyIHRvIHVzZSBlc21vZHVsZSwgdGhlIGV4cG9ydCB3aWxsIGFsd2F5c1xuICAgICAgICAvLyBiZSBhbiBvYmplY3Qgd2l0aCB0aGUgZGVmYXVsdCBleHBvcnQgYXMgYSBwcm9wZXJ0eSBvZiBpdC4gVG8gZW5zdXJlXG4gICAgICAgIC8vIHRoZSBleGlzdGluZyBhcGkgYW5kIGJhYmVsIGVzbW9kdWxlIGV4cG9ydHMgYXJlIGJvdGggc3VwcG9ydGVkIHdlXG4gICAgICAgIC8vIGNoZWNrIGZvciBib3RoXG4gICAgICAgIGlmIChleHAgPT09IGZuIHx8IGV4cCAmJiBleHAuZGVmYXVsdCA9PT0gZm4pIHtcbiAgICAgICAgICAgIHdrZXkgPSBrZXk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICghd2tleSkge1xuICAgICAgICB3a2V5ID0gTWF0aC5mbG9vcihNYXRoLnBvdygxNiwgOCkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygxNik7XG4gICAgICAgIHZhciB3Y2FjaGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYWNoZUtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gY2FjaGVLZXlzW2ldO1xuICAgICAgICAgICAgd2NhY2hlW2tleV0gPSBrZXk7XG4gICAgICAgIH1cbiAgICAgICAgc291cmNlc1t3a2V5XSA9IFtcbiAgICAgICAgICAgIEZ1bmN0aW9uKFsncmVxdWlyZScsJ21vZHVsZScsJ2V4cG9ydHMnXSwgJygnICsgZm4gKyAnKShzZWxmKScpLFxuICAgICAgICAgICAgd2NhY2hlXG4gICAgICAgIF07XG4gICAgfVxuICAgIHZhciBza2V5ID0gTWF0aC5mbG9vcihNYXRoLnBvdygxNiwgOCkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygxNik7XG5cbiAgICB2YXIgc2NhY2hlID0ge307IHNjYWNoZVt3a2V5XSA9IHdrZXk7XG4gICAgc291cmNlc1tza2V5XSA9IFtcbiAgICAgICAgRnVuY3Rpb24oWydyZXF1aXJlJ10sIChcbiAgICAgICAgICAgIC8vIHRyeSB0byBjYWxsIGRlZmF1bHQgaWYgZGVmaW5lZCB0byBhbHNvIHN1cHBvcnQgYmFiZWwgZXNtb2R1bGVcbiAgICAgICAgICAgIC8vIGV4cG9ydHNcbiAgICAgICAgICAgICd2YXIgZiA9IHJlcXVpcmUoJyArIHN0cmluZ2lmeSh3a2V5KSArICcpOycgK1xuICAgICAgICAgICAgJyhmLmRlZmF1bHQgPyBmLmRlZmF1bHQgOiBmKShzZWxmKTsnXG4gICAgICAgICkpLFxuICAgICAgICBzY2FjaGVcbiAgICBdO1xuXG4gICAgdmFyIHdvcmtlclNvdXJjZXMgPSB7fTtcbiAgICByZXNvbHZlU291cmNlcyhza2V5KTtcblxuICAgIGZ1bmN0aW9uIHJlc29sdmVTb3VyY2VzKGtleSkge1xuICAgICAgICB3b3JrZXJTb3VyY2VzW2tleV0gPSB0cnVlO1xuXG4gICAgICAgIGZvciAodmFyIGRlcFBhdGggaW4gc291cmNlc1trZXldWzFdKSB7XG4gICAgICAgICAgICB2YXIgZGVwS2V5ID0gc291cmNlc1trZXldWzFdW2RlcFBhdGhdO1xuICAgICAgICAgICAgaWYgKCF3b3JrZXJTb3VyY2VzW2RlcEtleV0pIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlU291cmNlcyhkZXBLZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHNyYyA9ICcoJyArIGJ1bmRsZUZuICsgJykoeydcbiAgICAgICAgKyBPYmplY3Qua2V5cyh3b3JrZXJTb3VyY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ2lmeShrZXkpICsgJzpbJ1xuICAgICAgICAgICAgICAgICsgc291cmNlc1trZXldWzBdXG4gICAgICAgICAgICAgICAgKyAnLCcgKyBzdHJpbmdpZnkoc291cmNlc1trZXldWzFdKSArICddJ1xuICAgICAgICAgICAgO1xuICAgICAgICB9KS5qb2luKCcsJylcbiAgICAgICAgKyAnfSx7fSxbJyArIHN0cmluZ2lmeShza2V5KSArICddKSdcbiAgICA7XG5cbiAgICB2YXIgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMIHx8IHdpbmRvdy5tb3pVUkwgfHwgd2luZG93Lm1zVVJMO1xuXG4gICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbc3JjXSwgeyB0eXBlOiAndGV4dC9qYXZhc2NyaXB0JyB9KTtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmJhcmUpIHsgcmV0dXJuIGJsb2I7IH1cbiAgICB2YXIgd29ya2VyVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICB2YXIgd29ya2VyID0gbmV3IFdvcmtlcih3b3JrZXJVcmwpO1xuICAgIHdvcmtlci5vYmplY3RVUkwgPSB3b3JrZXJVcmw7XG4gICAgcmV0dXJuIHdvcmtlcjtcbn07XG4iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge1xuICB1cGRhdGVBdmFpbGFibGVTcGFjZSxcbiAgcHJvbW90ZUxhYmVsVG9SZWN0YW5nbGUsXG4gIGNvbXB1dGVJbml0aWFsQXZhaWxhYmVTcGFjZXMsXG4gIHJlc2V0QXZhaWxhYmxlU3BhY2UsXG4gIHVwZGF0ZU1pbmltYSxcbiAgdHJhbnNsYXRlTGFiZWxcbn1cblxuY29uc3QgbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL2xhYmVsLXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKS5sYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLnJheVJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgbXVsdGlJbnRlcnZhbCA9IHJlcXVpcmUoJy4vbXVsdGktaW50ZXJ2YWwnKS5tdWx0aUludGVydmFsXG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuLypcbiBBbiBleHRlbmRlZCBwb2ludCBtYXkgY29udGFpbiB0aGUgZm9sbG93aW5nXG4gIHJheXMgYSBjb2xsZWN0aW9uIG9mIHJheXMgc3RhcnRpbmcgZnJvbSB0aGUgcG9pbnQgYXMgd2VsbCBhcyB0aGUgaW50ZXJ2YWxzIHdoZXJlIHRoZXkgYXJlIGFsbG93ZWRcbiAgbGFiZWwgaW4gY2FzZSB0aGUgbGFiZWwgaXMgbm90IHlldCBzZXR0bGVkXG4gIHJlY3RhbmdsZSBpbiBjYXNlIHRoZSBsYWJlbCBpcyBzZXR0bGVkXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZUF2YWlsYWJsZVNwYWNlIChleHRlbmRlZFBvaW50KSB7XG4gIHZhciByYXlzID0gZXh0ZW5kZWRQb2ludC5yYXlzXG4gIHZhciBtZWFzdXJlID0gMFxuICBmb3IgKGxldCByYXkgb2YgcmF5cykge1xuICAgIGxldCByYXlNZWFzdXJlID0gcmF5LmF2YWlsYWJsZS5tZWFzdXJlKClcbiAgICByYXkuYXZhaWxhYmxlTWVhc3VyZSA9IHJheU1lYXN1cmVcbiAgICBtZWFzdXJlICs9IHJheU1lYXN1cmVcbiAgfVxuICBleHRlbmRlZFBvaW50LmF2YWlsYWJsZU1lYXN1cmUgPSBtZWFzdXJlXG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVJbml0aWFsQXZhaWxhYmVTcGFjZXMgKGV4dGVuZGVkUG9pbnRzLCBwYXJhbXMpIHtcbiAgY29uc3QgcmFkaXVzID0gcGFyYW1zLnJhZGl1c1xuICBjb25zdCBiYm94ID0gcGFyYW1zLmJib3hcbiAgZm9yIChsZXQgcGkgb2YgZXh0ZW5kZWRQb2ludHMpIHtcbiAgICBmb3IgKGxldCByaWogb2YgcGkucmF5cykge1xuICAgICAgcmlqLmluaXRpYWxseUF2YWlsYWJsZSA9IG11bHRpSW50ZXJ2YWwoW2ludGVydmFsKDAsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSldKVxuICAgICAgZm9yIChsZXQgcGsgb2YgZXh0ZW5kZWRQb2ludHMpIHtcbiAgICAgICAgY29uc3QgcmVjdGFuZ2xlID0ge3RvcDogcGsucG9zaXRpb24ueSArIHJhZGl1cywgYm90dG9tOiBway5wb3NpdGlvbi55IC0gcmFkaXVzLCBsZWZ0OiBway5wb3NpdGlvbi54IC0gcmFkaXVzLCByaWdodDogcGsucG9zaXRpb24ueCArIHJhZGl1cywgd2lkdGg6IDIgKiByYWRpdXMsIGhlaWdodDogMiAqIHJhZGl1c31cbiAgICAgICAgcmlqLmluaXRpYWxseUF2YWlsYWJsZS5yZW1vdmUobGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocmVjdGFuZ2xlLCBwaS5sYWJlbCwgcmlqLnZlY3RvciwgcGkucG9zaXRpb24pKVxuICAgICAgICBpZiAocGkgIT09IHBrKSB7XG4gICAgICAgICAgcmlqLmluaXRpYWxseUF2YWlsYWJsZS5yZW1vdmUocmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHJlY3RhbmdsZSwgcmlqLnZlY3RvciwgcGkucG9zaXRpb24pKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYmJveCkge1xuICAgICAgICBjb25zdCBsYWJlbENvbnRhaW5lZEludGVydmFsID0gbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24oe3RvcDogLWJib3gudG9wIC0gcGkubGFiZWwuaGVpZ2h0LCBib3R0b206IC1iYm94LmJvdHRvbSArIHBpLmxhYmVsLmhlaWdodCwgbGVmdDogYmJveC5sZWZ0ICsgcGkubGFiZWwud2lkdGgsIHJpZ2h0OiBiYm94LnJpZ2h0IC0gcGkubGFiZWwud2lkdGgsIHdpZHRoOiBiYm94LndpZHRoIC0gMiAqIHBpLmxhYmVsLndpZHRoLCBoZWlnaHQ6IGJib3guaGVpZ2h0IC0gMiAqIHBpLmxhYmVsLmhlaWdodH0sIHBpLmxhYmVsLCByaWoudmVjdG9yLCBwaS5wb3NpdGlvbilcbiAgICAgICAgLy8gV2FudCBsYWJlbHMgaW5zaWRlIG9mIHRoZSBncmFwaFxuICAgICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlLnJlbW92ZShpbnRlcnZhbChsYWJlbENvbnRhaW5lZEludGVydmFsLmVuZCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSlcbiAgICAgIH1cbiAgICAgIHJpai5hdmFpbGFibGUgPSByaWouaW5pdGlhbGx5QXZhaWxhYmxlLmNsb25lKClcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzZXRBdmFpbGFibGVTcGFjZSAoZXh0ZW5kZWRQb2ludCkge1xuICBmb3IgKGxldCByaWogb2YgZXh0ZW5kZWRQb2ludC5yYXlzKSB7XG4gICAgcmlqLmF2YWlsYWJsZSA9IHJpai5pbml0aWFsbHlBdmFpbGFibGUuY2xvbmUoKVxuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZU1pbmltYSAoZXh0ZW5kZWRQb2ludCkge1xuICB2YXIgcmF5cyA9IGV4dGVuZGVkUG9pbnQucmF5c1xuICBmb3IgKGxldCByYXkgb2YgcmF5cykge1xuICAgIHJheS5taW5pbXVtID0gcmF5LmF2YWlsYWJsZS5nZXRNaW4oKVxuICB9XG59XG5cbmZ1bmN0aW9uIHByb21vdGVMYWJlbFRvUmVjdGFuZ2xlIChleHRlbmRlZFBvaW50LCB2aSkge1xuICBleHRlbmRlZFBvaW50LnJlY3RhbmdsZSA9IHRyYW5zbGF0ZUxhYmVsKGV4dGVuZGVkUG9pbnQsIHZpKVxuICBleHRlbmRlZFBvaW50LnNlZ21lbnQgPSB7eDogdmkueCwgeTogdmkueX1cbn1cblxuZnVuY3Rpb24gdHJhbnNsYXRlTGFiZWwgKGV4dGVuZGVkUG9pbnQsIHZpKSB7XG4gIGNvbnN0IHBvaW50ID0gZXh0ZW5kZWRQb2ludC5wb3NpdGlvblxuICBjb25zdCBsYWJlbCA9IGV4dGVuZGVkUG9pbnQubGFiZWxcbiAgcmV0dXJuIHtcbiAgICBoZWlnaHQ6IGxhYmVsLmhlaWdodCxcbiAgICB3aWR0aDogbGFiZWwud2lkdGgsXG4gICAgdG9wOiBwb2ludC55ICsgdmkueSArIGxhYmVsLmhlaWdodCAvIDIsXG4gICAgYm90dG9tOiBwb2ludC55ICsgdmkueSAtIGxhYmVsLmhlaWdodCAvIDIsXG4gICAgbGVmdDogcG9pbnQueCArIHZpLnggLSBsYWJlbC53aWR0aCAvIDIsXG4gICAgcmlnaHQ6IHBvaW50LnggKyB2aS54ICsgbGFiZWwud2lkdGggLyAyXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSB7ZmluZEJlc3RSYXl9XG5cbmNvbnN0IF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbClcblxuY29uc3QgZXh0ZW5kZWRQb2ludE1ldGhvZHMgPSByZXF1aXJlKCcuL2V4dGVuZGVkLXBvaW50LW1ldGhvZHMnKVxuY29uc3QgbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL2xhYmVsLXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKS5sYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgbGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1zZWdtZW50LWludGVyc2VjdGlvbicpLmxhYmVsU2VnbWVudEludGVyc2VjdGlvblxuY29uc3QgcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLnJheVJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgcmF5U2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LXNlZ21lbnQtaW50ZXJzZWN0aW9uJykucmF5U2VnbWVudEludGVyc2VjdGlvblxuY29uc3QgbXVsdGlJbnRlcnZhbCA9IHJlcXVpcmUoJy4vbXVsdGktaW50ZXJ2YWwnKS5tdWx0aUludGVydmFsXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG5hc3luYyBmdW5jdGlvbiBmaW5kQmVzdFJheSAocG9pbnRzVG9MYWJlbCwgcG9pbnRzTm90VG9MYWJlbCkge1xuICAvLyBXZSBmb2xsb3cgdGhlIGFydGljbGUgcGFnZSA0IEFsZ29yaXRobSAxXG4gIHZhciBQID0gcG9pbnRzVG9MYWJlbFxuICB2YXIgUDAgPSBwb2ludHNOb3RUb0xhYmVsLmNvbmNhdChwb2ludHNUb0xhYmVsKVxuICAvLyBpbnQgUCBtaW4gaW4gdGhlIGFydGljbGVcbiAgdmFyIG1pbmltdW1BdmFpbGFibGVTcGFjZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICB2YXIgcmJlc3RcbiAgdmFyIFZiZXN0XG4gIHZhciBwYmVzdCAvLyBUaGlzIGlzIG5vdCBpbiB0aGUgb3JpZ2luYWwgYWxnb3JpdGhtIGJ1dCBhbGxvd3MgdG8gZWFzaWx5IGZpbmQgdGhlIGNvcnJlc3BvbmRpbmcgcG9pbnRcbiAgUDAuZm9yRWFjaChwPT4gZXh0ZW5kZWRQb2ludE1ldGhvZHMudXBkYXRlQXZhaWxhYmxlU3BhY2UocCkpXG4gIFAuZm9yRWFjaChwPT4gZXh0ZW5kZWRQb2ludE1ldGhvZHMudXBkYXRlTWluaW1hKHApKVxuICBjb25zdCBwaSA9IF8ubWluQnkoUCwgJ2F2YWlsYWJsZU1lYXN1cmUnKVxuICBsZXQgbWluZGlrID0gXy5taW5CeShwaS5yYXlzLCAnbWluaW11bScpLm1pbmltdW1cbiAgbGV0IFIgPSBwaS5yYXlzLmZpbHRlcihyID0+IHIuYXZhaWxhYmxlTWVhc3VyZSA+IDApXG4gIHJpamxvb3A6IGZvciAobGV0IHJpaiBvZiBSKSB7XG4gICAgbGV0IFZpaiA9IFtdXG4gICAgbGV0IHNlZ21lbnQgPSB7eDogcmlqLnZlY3Rvci54ICogcmlqLm1pbmltdW0sIHk6IHJpai52ZWN0b3IueSAqIHJpai5taW5pbXVtfVxuICAgIGNvbnN0IHJlY3RhbmdsZSA9IGV4dGVuZGVkUG9pbnRNZXRob2RzLnRyYW5zbGF0ZUxhYmVsKHBpLCBzZWdtZW50KVxuICAgIGZvciAobGV0IHBrIG9mIFAwKSB7XG4gICAgICBpZiAocGsgPT09IHBpKSBjb250aW51ZVxuICAgICAgLy8gTm8gc2Vuc2UgdG8gd2FpdCBmb3IgdGhlIGludGVyc2VjdGlvbiBpZiByYmVzdCBpcyBkZWZpbmVkXG5cbiAgICAgIC8vaW50IHBrXG4gICAgICBsZXQgYXZhaWxhYmxlU3BhY2UgPSBway5hdmFpbGFibGVNZWFzdXJlXG4gICAgICAvLyBOb3QgZG9pbmcgdGhlIHByZWludGVyc2VjdGlvbiBoZXJlLiBTb21ldGhpbmcgZmlzaHkgaW4gdGhlIGFydGljbGUsIGlmIHByZWludGVyc2VjdCBpcyBlbXB0eSB0aGVuICBpbnRlZ3JhbCBway0gaXMgMCB3aGljaCBkb2VzIG5vdCBtYWtlIG11Y2ggc2Vuc2VcbiAgICAgIGZvciAobGV0IHJrbCBvZiBway5yYXlzKSB7XG4gICAgICAgIGxldCBsYWJlbEludGVyc2VjdGlvblxuICAgICAgICBsZXQgc2VnbWVudEludGVyc2VjdGlvblxuICAgICAgICAvLyBXZSBoYXZlIHNwbGl0IGxhYmVsIHJlY3RhbmdsZSBpbnRlcnNlY3Rpb24gaW50byB0d28gYWxnb3JpdGhtcywgbGFiZWwgcmVjdGFuZ2xlIGFuZCBsYWJlbCBzZWdtZW50LiBUaG9zZSB0d28gaW50ZXJ2YWxzIHNob3VsZCBpbnRlcnNlY3Qgc2luY2UgdGhlIHNlZ21lbnQgaW50ZXJzZWN0cyB0aGUgcmVjdGFuZ2xlLCBzbyB3ZSBjYW4gY29hbGVzY2UgdGhlIGludGVydmFsc1xuICAgICAgICBjb25zdCBsYWJlbEludGVydmFsID0gbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocmVjdGFuZ2xlLCBway5sYWJlbCwgcmtsLnZlY3RvciwgcGsucG9zaXRpb24pXG4gICAgICAgIGNvbnN0IHNlZ21lbnRJbnRlcnZhbCA9IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbihwaS5wb3NpdGlvbiwgc2VnbWVudCwgcGsubGFiZWwsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCByYXlJbnRlcnZhbCA9IHJheVJlY3RhbmdsZUludGVyc2VjdGlvbihyZWN0YW5nbGUsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCByYXlTZWdtZW50SW50ZXJ2YWwgPSByYXlTZWdtZW50SW50ZXJzZWN0aW9uKHBpLnBvc2l0aW9uLCBzZWdtZW50LCBway5wb3NpdGlvbiwgcmtsLnZlY3RvcilcbiAgICAgICAgbGFiZWxJbnRlcnNlY3Rpb24gPSBsYWJlbEludGVydmFsLmNvYWxlc2NlSW5QbGFjZShyYXlJbnRlcnZhbClcbiAgICAgICAgc2VnbWVudEludGVyc2VjdGlvbiA9IHNlZ21lbnRJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UocmF5U2VnbWVudEludGVydmFsKVxuICAgICAgICBpZiAoIWxhYmVsSW50ZXJzZWN0aW9uLmVtcHR5IHx8ICFzZWdtZW50SW50ZXJzZWN0aW9uLmVtcHR5KSB7XG4gICAgICAgICAgYXZhaWxhYmxlU3BhY2UgLT0gcmtsLmF2YWlsYWJsZS5tZWFzdXJlTXVsdGlwbGVJbnRlcnNlY3Rpb24obXVsdGlJbnRlcnZhbC5jb2FsZXNjZShsYWJlbEludGVyc2VjdGlvbiwgc2VnbWVudEludGVyc2VjdGlvbikpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgcmF5IGlzIG5vdCBnb29kIGJlY2F1c2Ugd2UgdHJ5IHRvIG1heGltaXplIHRoZSBtaW5pbXVtXG4gICAgICBpZiAocmJlc3QgJiYgYXZhaWxhYmxlU3BhY2UgPCBtaW5pbXVtQXZhaWxhYmxlU3BhY2UpIHtcbiAgICAgICAgY29udGludWUgcmlqbG9vcFxuICAgICAgfVxuICAgICAgVmlqLnB1c2goYXZhaWxhYmxlU3BhY2UpXG4gICAgfVxuICAgIFZpai5zb3J0KChpLGopID0+IGkgLSBqKSAvLyBvcmRlciB0byBjb21wYXJlIGluIGxleGljb2dyYXBoaWNhbCBvcmRlclxuICAgIGlmICghVmJlc3QgfHwgdXRpbHMuY29tcGFyZUFycmF5c0xleGljb2dyYXBoaWNhbGx5KFZpaiwgVmJlc3QpIDwgMCkge1xuICAgICAgcmJlc3QgPSByaWpcbiAgICAgIFZiZXN0ID0gVmlqXG4gICAgICBtaW5pbXVtQXZhaWxhYmxlU3BhY2UgPSBfLm1pbihWaWopXG4gICAgICBwYmVzdCA9IHBpXG4gICAgfVxuICB9XG4gIC8vIFdlIG5lZWQgdG8gcmV0dXJuIGludGVyc2VjdGlvbkRhdGEgYmVjYXVzZSB0aGUgcmVmZXJlbmNlIGhhcyBiZWVuIG5ldXRlcmVkIGluIGZpbmQgcmF5IGludGVyc2VjdGlvblxuICByZXR1cm4ge3JiZXN0OiByYmVzdCwgcGJlc3Q6IHBiZXN0fVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7aW50ZXJ2YWx9XG5mdW5jdGlvbiBJbnRlcnZhbCAoc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgLy8gY29uc29sZS5lcnJvcignV3Jvbmcgb3JkZXIgb2YgaW50ZXJ2YWwnLCBzdGFydCwgZW5kKVxuICAgIHRoaXMuZW1wdHkgPSB0cnVlXG4gICAgdGhpcy5zdGFydCA9IG51bGxcbiAgICB0aGlzLmVuZCA9IG51bGxcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIHRoaXMuc3RhcnQgPSBzdGFydFxuICB0aGlzLmVuZCA9IGVuZFxuICByZXR1cm4gdGhpc1xufVxuXG5JbnRlcnZhbC5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBJbnRlcnZhbCgxLCAtMSlcbn1cbkludGVydmFsLnByb3RvdHlwZS5pbnRlcnNlY3QgPSBmdW5jdGlvbiAoaW50ZXJ2YWwpIHtcbiAgaWYgKHRoaXMuZW1wdHkgfHwgaW50ZXJ2YWwuZW1wdHkpIHJldHVybiBJbnRlcnZhbC5lbXB0eSgpXG4gIHJldHVybiBuZXcgSW50ZXJ2YWwoTWF0aC5tYXgoaW50ZXJ2YWwuc3RhcnQsIHRoaXMuc3RhcnQpLCBNYXRoLm1pbihpbnRlcnZhbC5lbmQsIHRoaXMuZW5kKSlcbn1cblxuSW50ZXJ2YWwucHJvdG90eXBlLmNvYWxlc2NlID0gZnVuY3Rpb24gKGludGVydmFsKSB7XG4gIGlmICh0aGlzLmVtcHR5KSByZXR1cm4gaW50ZXJ2YWxcbiAgaWYgKGludGVydmFsLmVtcHR5KSByZXR1cm4gdGhpc1xuICBpZiAoaW50ZXJ2YWwuc3RhcnQgPiB0aGlzLmVuZCB8fCB0aGlzLnN0YXJ0ID4gaW50ZXJ2YWwuZW5kKSB7XG4gICAgLy8gV2UgcHJvYmFibHkgbmVlZCBhIG11bHRpIGludGVydmFsIGluIHRoaXMgY2FzZVxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNvYWxsZXNjZScpXG4gIH1cbiAgcmV0dXJuIG5ldyBJbnRlcnZhbChNYXRoLm1pbihpbnRlcnZhbC5zdGFydCwgdGhpcy5zdGFydCksIE1hdGgubWF4KGludGVydmFsLmVuZCwgdGhpcy5lbmQpKVxufVxuLy8gVE9ETyByZW1vdmUgY29hbGVzY2UgYW5kIHJlbmFtZSB0aGlzIG1ldGhvZCB0byBjb2FsZXNjZVxuLy8gbW9kaWZpZXMgaW50ZXJ2YWxcbkludGVydmFsLnByb3RvdHlwZS5jb2FsZXNjZUluUGxhY2UgPSBmdW5jdGlvbiAoaW50ZXJ2YWwpIHtcbiAgaWYgKHRoaXMuZW1wdHkpIHJldHVybiBpbnRlcnZhbFxuICBpZiAoaW50ZXJ2YWwuZW1wdHkpIHJldHVybiB0aGlzXG4gIGlmIChpbnRlcnZhbC5zdGFydCA+IHRoaXMuZW5kIHx8IHRoaXMuc3RhcnQgPiBpbnRlcnZhbC5lbmQpIHtcbiAgICAvLyBXZSBwcm9iYWJseSBuZWVkIGEgbXVsdGkgaW50ZXJ2YWwgaW4gdGhpcyBjYXNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY29hbGxlc2NlJylcbiAgfVxuICB0aGlzLnN0YXJ0ID0gTWF0aC5taW4oaW50ZXJ2YWwuc3RhcnQsIHRoaXMuc3RhcnQpXG4gIHRoaXMuZW5kID0gTWF0aC5tYXgoaW50ZXJ2YWwuZW5kLCB0aGlzLmVuZClcbiAgcmV0dXJuIHRoaXNcbn1cbkludGVydmFsLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuZW1wdHkpIHJldHVybiBJbnRlcnZhbC5lbXB0eSgpXG4gIHJldHVybiBuZXcgSW50ZXJ2YWwodGhpcy5zdGFydCwgdGhpcy5lbmQpXG59XG5JbnRlcnZhbC5wcm90b3R5cGUubWVhc3VyZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuZW1wdHkpIHJldHVybiAwXG4gIHJldHVybiBNYXRoLnBvdygyLCAtdGhpcy5zdGFydCkgLSBNYXRoLnBvdygyLCAtdGhpcy5lbmQpXG59XG5mdW5jdGlvbiBpbnRlcnZhbChzdGFydCwgZW5kKSB7XG4gIHJldHVybiBuZXcgSW50ZXJ2YWwoc3RhcnQsIGVuZClcbn1cbmludGVydmFsLmVtcHR5ID0gSW50ZXJ2YWwuZW1wdHkiLCIndXNlIHN0cmljdCdcbnZhciBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxubW9kdWxlLmV4cG9ydHMgPSB7bGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb259XG5cbi8qIFJlY3RhbmdsZSBsayBpbnRlcnNlY3RzIGxhYmVsIGxpIG1vdmluZyBmcm9tIHBpIHdpdGggdmVjdG9yIHZpIGluIHBvc2l0aXZlIHRpbWUgKi9cbi8vIENvbXBhcmUgY2VudGVycyBvZiB0aGUgbGFiZWxzIHRoZXkgbXVzdCBiZSB3aXRoaW4gbGkuaGVpZ2h0IC8gMiArIGxrLmhlaWdodCAvIDIgaW4gdGhlIHZlcnRpY2FsIHZhcmlhYmxlIGFuZCBsaS53aWR0aCAvIDIgKyBsay53aWR0aCAvIDIgaW4gdGhlIGhvcml6b250YWwgdmFyaWFibGUsIGkuZSBzb2x2ZSB8bGsueCAtIChway54ICsgdCAqIHYueCl8IDwgZFxuZnVuY3Rpb24gbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24gKGxrLCBsaSwgdmksIHBpKSB7XG4gIGxldCBtaW4gPSAwXG4gIGxldCBtYXggPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcbiAgaWYgKHZpLnkgIT09IDApIHtcbiAgICBjb25zdCBmaXJzdEludGVyc2VjdGlvbiA9IChsay5oZWlnaHQgLyAyICsgbGkuaGVpZ2h0IC8gMiArIChsay50b3AgKyBsay5ib3R0b20pIC8gMiAtIHBpLnkpIC8gdmkueVxuICAgIGNvbnN0IHNlY29uZEludGVyc2VjdGlvbiA9ICgtbGsuaGVpZ2h0IC8gMiAtIGxpLmhlaWdodCAvIDIgKyAobGsudG9wICsgbGsuYm90dG9tKSAvIDIgLSBwaS55KSAvIHZpLnlcbiAgICAvLyBNdWx0aXBseWluZyBieSBhIG5lZ2F0aXZlIHNpZ24gcmV2ZXJzZXMgYW4gaW5lcXVhbGl0eVxuICAgIGlmICh2aS55ID4gMCkge1xuICAgICAgbWF4ID0gTWF0aC5taW4obWF4LCBmaXJzdEludGVyc2VjdGlvbilcbiAgICAgIG1pbiA9IE1hdGgubWF4KG1pbiwgc2Vjb25kSW50ZXJzZWN0aW9uKVxuICAgIH0gZWxzZSB7XG4gICAgICBtaW4gPSBNYXRoLm1heChtaW4sIGZpcnN0SW50ZXJzZWN0aW9uKVxuICAgICAgbWF4ID0gTWF0aC5taW4obWF4LCBzZWNvbmRJbnRlcnNlY3Rpb24pXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIHZlY3RvciBpcyB2ZXJ0aWNhbCBhbmQgdGhleSB3aWxsIG5ldmVyIGludGVyc2VjdFxuICAgIGlmIChwaS55IC0gKGxrLnRvcCArIGxrLmJvdHRvbSkgLyAyID4gbGsuaGVpZ2h0IC8gMiArIGxpLmhlaWdodCAvIDIpIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gICAgaWYgKHBpLnkgLSAobGsudG9wICsgbGsuYm90dG9tKSAvIDIgPCAtIGxrLmhlaWdodCAvIDIgLSBsaS5oZWlnaHQgLyAyKSByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICB9XG4gIGlmICh2aS54ICE9PSAwKSB7XG4gICAgY29uc3QgdGhpcmRJbnRlcnNlY3Rpb24gPSAobGsud2lkdGggLyAyICsgbGkud2lkdGggLyAyICsgKGxrLnJpZ2h0ICsgbGsubGVmdCkgLyAyIC0gcGkueCkgLyB2aS54XG4gICAgY29uc3QgZm91cnRoSW50ZXJzZWN0aW9uID0gKC0gbGsud2lkdGggLyAyIC0gbGkud2lkdGggLyAyICsgKGxrLnJpZ2h0ICsgbGsubGVmdCkgLyAyIC0gcGkueCkgLyB2aS54XG4gICAgaWYgKHZpLnggPiAwKSB7XG4gICAgICBtYXggPSBNYXRoLm1pbihtYXgsIHRoaXJkSW50ZXJzZWN0aW9uKVxuICAgICAgbWluID0gTWF0aC5tYXgobWluLCBmb3VydGhJbnRlcnNlY3Rpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIG1pbiA9IE1hdGgubWF4KG1pbiwgdGhpcmRJbnRlcnNlY3Rpb24pXG4gICAgICBtYXggPSBNYXRoLm1pbihtYXgsIGZvdXJ0aEludGVyc2VjdGlvbilcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKHBpLnggLSAobGsucmlnaHQgKyBsay5sZWZ0KSAvIDIgPiBsay53aWR0aCAvIDIgKyBsaS53aWR0aCAvIDIpIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gICAgaWYgKHBpLnggLSAobGsucmlnaHQgKyBsay5sZWZ0KSAvIDIgPCAtbGsud2lkdGggLyAyIC0gbGkud2lkdGggLyAyKSByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICB9XG5cbiAgLy8gT25seSBpbnRlcmVzdGVkIGluIHBvc2l0aXZlIHZhbHVlc1xuICByZXR1cm4gaW50ZXJ2YWwobWluLCBtYXgpXG59IiwiJ3VzZSBzdHJpY3QnXG4vLyBGaW5kIGludGVydmFsIGluIHdoaWNoIGFuIGludGVydmFsIGFuZCBhIHNlZ21lbnQgaW50ZXJzZWN0XG5tb2R1bGUuZXhwb3J0cyA9IHtsYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb259XG5cbnZhciBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vc2VnbWVudC1zZWdtZW50LWludGVyc2VjdGlvbicpLnNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uXG52YXIgaW50ZXJ2YWwgPSByZXF1aXJlKCcuL2ludGVydmFsJykuaW50ZXJ2YWxcblxuLy8gTGFiZWwgbGkgbW92ZXMgd2l0aCB2ZWN0b3IgdmkuIFdlIGZpbmQgdGhlIGludGVydmFsIGF0IHdoaWNoIGl0IGludGVyc2VjdHMgdGhlIHNlZ21lbnQgcGssIHZrLiBJZiBwayBpcyBjb250YWluZWQgdGhlbiB0aGUgaW50ZXJ2YWwgZ29lcyB0byBJTkZJTklUWVxuZnVuY3Rpb24gbGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uIChwaywgdmssIGxpLCB2aSwgcGkpIHtcbiAgLy8gdHJhbnNsYXRlIHNvIHdlIGNhbiBhc3N1bWUgdGhhdCBwb2ludCBpcyBpbiB0aGUgY2VudHJlXG4gIHBrID0ge3g6IHBrLnggLSBwaS54LCB5OiBway55IC0gcGkueX1cbiAgLy8gVE9ETyBoYW5kbGUgcGFyYWxsZWwgbGluZXNcbiAgdmFyIHBvaW50Q292ZXJlZFxuICAvLyBUaGUgdGltZSBpbnRlcnZhbCB3aGVyZSB0aGV5IG1lZXQgaXMgY29ubmVjdGVkIHNvIGl0IGlzIGVub3VnaCB0byBmaW5kIHRoZSBlbmQgcG9pbnRzLiBUaGlzIG11c3Qgb2NjdXIgd2hlbiBlaXRoZXIgdGhlIGNvcm5lcnMgb2YgdGhlIGxhYmVsIGludGVyc2VjdCBvciB3aGVuXG4gIGNvbnN0IGludGVyc2VjdGlvbnMgPSBbXVxuICAvLyB0aGUgZW5kIHBvaW50cyBvZiB0aGUgc2VnbWVudCBpbnRlcnNlY3RcbiAgZm9yIChsZXQgeCBvZiBbLSBsaS53aWR0aCAvIDIsIGxpLndpZHRoIC8gMl0pIHtcbiAgICBmb3IgKGxldCB5IG9mIFsgLSBsaS5oZWlnaHQgLyAyLCBsaS5oZWlnaHQgLyAyXSkge1xuICAgICAgbGV0IGludGVyc2VjdGlvbiA9IHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uKHt4LCB5fSwgdmksIHBrLCB2aylcbiAgICAgIC8vIEludGVyc2VjdHMgaW5zaWRlIHRoZSBzZWdtZW50XG4gICAgICBpZiAoaW50ZXJzZWN0aW9uICYmIGludGVyc2VjdGlvbi5zID49IDAgJiYgaW50ZXJzZWN0aW9uLnMgPD0gMSkge1xuICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goaW50ZXJzZWN0aW9uLnQpXG4gICAgICB9XG5cbiAgICAgIC8vIEdpdmVuIGEgcG9pbnQgdG8gd2UgdGFrZSB0aGUgc2lkZSBjb21pbmcgZnJvbSBpdCBpbiBjb3VudGVyIGNsb2Nrd2lzZVxuICAgICAgbGV0IHNpZGVcbiAgICAgIGlmICh4ICogeSA8IDApIHtcbiAgICAgICAgc2lkZSA9IHt4OiAwLCB5OiAtMiAqIHl9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaWRlID0ge3g6IC0yICogeCwgeTogMH1cbiAgICAgIH1cbiAgICAgIGludGVyc2VjdGlvbiA9IHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uKHt4LCB5fSwgc2lkZSwgcGssIHZpKVxuICAgICAgaWYgKGludGVyc2VjdGlvbiAmJiBpbnRlcnNlY3Rpb24udCA+PSAwICYmIGludGVyc2VjdGlvbi50IDw9IDEpIHtcbiAgICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKC1pbnRlcnNlY3Rpb24ucylcbiAgICAgICAgLy8vLyBUaGUgc2lkZSBjb3ZlcnMgdGhlIHBvaW50IGluIHRoZSBmdXR1cmVcbiAgICAgICAgLy9pZiAoaW50ZXJzZWN0aW9uLnMgPCAwKSB7XG4gICAgICAgIC8vICBpbnRlcnNlY3Rpb25zLnB1c2goTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxuICAgICAgICAvL31cbiAgICAgIH1cbiAgICAgIGludGVyc2VjdGlvbiA9IHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uKHt4LCB5fSwgc2lkZSwge3g6IHBrLnggKyB2ay54LCB5OiBway55ICsgdmsueX0sIHZpKVxuICAgICAgaWYgKGludGVyc2VjdGlvbiAmJiBpbnRlcnNlY3Rpb24udCA+PSAwICYmIGludGVyc2VjdGlvbi50IDw9IDEpIHtcbiAgICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKC1pbnRlcnNlY3Rpb24ucylcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdmFyIG1pbiA9IGludGVyc2VjdGlvbnMucmVkdWNlKChhLCBiKSA9PiBNYXRoLm1pbihhLGIpLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gIHZhciBtYXggPSBpbnRlcnNlY3Rpb25zLnJlZHVjZSgoYSwgYikgPT4gTWF0aC5tYXgoYSxiKSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKVxuICBtaW4gPSBNYXRoLm1heChtaW4sIDApXG4gIHJldHVybiBpbnRlcnZhbChtaW4sIG1heClcblxufSIsIm1vZHVsZS5leHBvcnRzID0ge21haW5BbGdvcml0aG19XG5jb25zdCB3b3JrID0gcmVxdWlyZSgnd2Vid29ya2lmeScpXG5jb25zdCBhbGdvcml0aG0gPSB3b3JrKHJlcXVpcmUoJy4vbWFpbi1hbGdvcml0aG0uanMnKSlcbmNvbnN0IHByb21pc2VSZXNvbHV0aW9ucyA9IHt9XG5mdW5jdGlvbiBtYWluQWxnb3JpdGhtIChleHRlbmRlZFBvaW50cywgcGFyYW1zID0ge30pIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBleHRlbmRlZFBvaW50cyA9IGV4dGVuZGVkUG9pbnRzLm1hcChwID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBwLmlkLFxuICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgIHg6IHAucG9zaXRpb24ueCxcbiAgICAgICAgICB5OiAtcC5wb3NpdGlvbi55IC8vIFRoZSBhbGdvcml0aG0gZXhwZWN0cyB5IHRvIGdyb3cgdXB3YXJkc1xuICAgICAgICB9LFxuICAgICAgICBsYWJlbDogcC5sYWJlbFxuICAgICAgfVxuICAgIH0pXG4gICAgY29uc3QgcHJvY2Vzc1VVSUQgPSBwYXJzZUludChNYXRoLnJhbmRvbSgpICogMTAwMDAwMCkudG9TdHJpbmcoKSAvLyBubyBuZWVkIGZvciBhbnl0aGluZyBmYW5jeVxuICAgIGFsZ29yaXRobS5wb3N0TWVzc2FnZSh7XG4gICAgICB0eXBlOiAnc3RhcnQnLFxuICAgICAgZXh0ZW5kZWRQb2ludHMsXG4gICAgICBwYXJhbXMsXG4gICAgICBwcm9jZXNzVVVJRFxuICAgIH0pXG4gICAgcHJvbWlzZVJlc29sdXRpb25zW3Byb2Nlc3NVVUlEXSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gZXZlbnQuZGF0YS5yZXN1bHQubWFwKHAgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBwLmlkLFxuICAgICAgICAgIHJlY3RhbmdsZToge1xuICAgICAgICAgICAgbGVmdDogcC5yZWN0YW5nbGUubGVmdCxcbiAgICAgICAgICAgIHJpZ2h0OiBwLnJlY3RhbmdsZS5yaWdodCxcbiAgICAgICAgICAgIHRvcDogLXAucmVjdGFuZ2xlLnRvcCxcbiAgICAgICAgICAgIGJvdHRvbTogLXAucmVjdGFuZ2xlLmJvdHRvbVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVybiByZXNvbHZlKHJlc3VsdClcbiAgICB9XG4gIH0pXG59XG5hbGdvcml0aG0ub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhXG4gIHN3aXRjaCAoZGF0YS50eXBlKSB7XG4gICAgY2FzZSAnZW5kJzpcbiAgICAgIGVuZEV2ZW50KGV2ZW50KVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5lcnJvcignVGhpcyBldmVudCBjYXNlIHNob3VsZCBub3QgaGFwcGVuJywgZGF0YS50eXBlKVxuICB9XG59XG5cbmZ1bmN0aW9uIGVuZEV2ZW50IChldmVudCkge1xuICBjb25zdCB7cHJvY2Vzc1VVSUR9ID0gZXZlbnQuZGF0YVxuICBjb25zdCBjYWxsYmFjayA9IHByb21pc2VSZXNvbHV0aW9uc1twcm9jZXNzVVVJRF1cbiAgY2FsbGJhY2soZXZlbnQpXG4gIGRlbGV0ZSBwcm9taXNlUmVzb2x1dGlvbnNbcHJvY2Vzc1VVSURdXG59IiwibGV0IE5VTUJFUl9PRl9SQVlTXG4vLyBDYWxsZWQgYXMgd2Vid29ya2VyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzZWxmKSB7XG4gIGltcG9ydFNjcmlwdHMoJ2h0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9sb2Rhc2gvNC4xNy40L2xvZGFzaC5taW4uanMnKVxuICBjb25zdCBleHRlbmRlZFBvaW50TWV0aG9kcyA9IHJlcXVpcmUoJy4vZXh0ZW5kZWQtcG9pbnQtbWV0aG9kcycpXG4gIGNvbnNvbGUubG9nKCdtYWluIGFsZ29yaXRobSBsb2FkZWQnKVxuICBjb25zdCBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpXG4gIGNvbnN0IHJheUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LWludGVyc2VjdGlvbicpLnJheUludGVyc2VjdGlvblxuICBjb25zdCBpdGVyYXRpdmVHcmVlZHkgPSByZXF1aXJlKCdpdGVyYXRpdmUtZ3JlZWR5JylcbiAgaWYgKHR5cGVvZiBwb3N0TWVzc2FnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzZWxmLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGRhdGEgPSBldmVudC5kYXRhXG4gICAgICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgbGF1bmNoTWFpbkFsZ29yaXRobUZyb21FdmVudChldmVudClcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBhIHZhbGlkIGV2ZW50IHR5cGUnLCBkYXRhLnR5cGUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbGF1bmNoTWFpbkFsZ29yaXRobUZyb21FdmVudCAoZXZlbnQpIHtcbiAgICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YVxuICAgIGNvbnN0IGV4dGVuZGVkUG9pbnRzID0gZGF0YS5leHRlbmRlZFBvaW50c1xuICAgIGNvbnN0IHBhcmFtcyA9IGRhdGEucGFyYW1zXG4gICAgY29uc3QgcHJvY2Vzc1VVSUQgPSBkYXRhLnByb2Nlc3NVVUlEIC8vIHdlIHVzZSB0aGlzIGluIGNhc2UgdGhlIGFsZ29yaWhtIGlzIHJlcXVpcmVkIHNldmVyYWwgdGltZXNcbiAgICBtYWluQWxnb3JpdGhtKGV4dGVuZGVkUG9pbnRzLCBwYXJhbXMpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnZW5kJyxcbiAgICAgICAgICBwcm9jZXNzVVVJRCxcbiAgICAgICAgICByZXN1bHRcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBtYWluQWxnb3JpdGhtIChleHRlbmRlZFBvaW50cywgcGFyYW1zID0ge30pIHtcbiAgICBOVU1CRVJfT0ZfUkFZUyA9IF8uaXNOdW1iZXIocGFyYW1zLk5VTUJFUl9PRl9SQVlTKSA/IHBhcmFtcy5OVU1CRVJfT0ZfUkFZUyA6IDNcbiAgICBjb25zdCBNQVhfTlVNQkVSX09GX0lURVJBVElPTlMgPSBfLmlzTnVtYmVyKHBhcmFtcy5NQVhfTlVNQkVSX09GX0lURVJBVElPTlMpID8gcGFyYW1zLk1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA6IDFcbiAgICBjb21wdXRlUmF5cyhleHRlbmRlZFBvaW50cylcbiAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5jb21wdXRlSW5pdGlhbEF2YWlsYWJlU3BhY2VzKGV4dGVuZGVkUG9pbnRzLCB7cmFkaXVzOiBwYXJhbXMucmFkaXVzIHx8IDIsIGJib3g6IHBhcmFtcy5iYm94fSlcbiAgICBleHRlbmRlZFBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5yZXNldEF2YWlsYWJsZVNwYWNlKHApXG4gICAgICBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwKVxuICAgIH0pXG4gICAgY29uc3QgcG9zc2libGVQb2ludHMgPSBleHRlbmRlZFBvaW50cy5maWx0ZXIocCA9PiBwLmF2YWlsYWJsZU1lYXN1cmUgPiAwKVxuICAgIHJldHVybiBpdGVyYXRpdmVHcmVlZHkuc29sdmUoXy5wYXJ0aWFsUmlnaHQocmF5SW50ZXJzZWN0aW9uKSwgcG9zc2libGVQb2ludHMsIHJlc2V0RnVuY3Rpb24sIHtzZXJpYWxpemVGdW5jdGlvbiwgTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXB1dGVSYXlzIChleHRlbmRlZFBvaW50cykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXh0ZW5kZWRQb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBwaSA9IGV4dGVuZGVkUG9pbnRzW2ldXG4gICAgICBwaS5yYXlzID0gW11cbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgTlVNQkVSX09GX1JBWVM7IGorKykge1xuICAgICAgICBwaS5yYXlzLnB1c2goIHtcbiAgICAgICAgICBpbmRleDogaSpOVU1CRVJfT0ZfUkFZUyAqIE5VTUJFUl9PRl9SQVlTICo0ICsgaiAqIE5VTUJFUl9PRl9SQVlTICogNCxcbiAgICAgICAgICBzZWxmSW5kZXg6IGosXG4gICAgICAgICAgdmVjdG9yIDoge1xuICAgICAgICAgICAgeDogTWF0aC5zaW4oMiAqIE1hdGguUEkgKiBqIC8gTlVNQkVSX09GX1JBWVMpLFxuICAgICAgICAgICAgeTogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBqIC8gTlVNQkVSX09GX1JBWVMpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4vLyBBdCBlYWNoIGl0ZXJhdGlvbiBvZiBpdGVyYXRpdmUgZ3JlZWR5IGlmIHRoZSBzb2x1dGlvbiBpcyBiZXR0ZXIgd2Ugc2VyaWFsaXplIHdoYXQgd2Ugb2J0YWluZWRcbiAgZnVuY3Rpb24gc2VyaWFsaXplRnVuY3Rpb24gKGFycmF5T2ZQb2ludHMpIHtcbiAgICAvLyBXaGVuIHdlIGxhYmVsIGEgcG9pbnQgd2UgcHJvbW90ZSBsYWJlbCB0byByZWN0YW5nbGUgYW5kIHdlIHJlc2V0IGl0IGF0IGVhY2ggaXRlcmF0aW9uXG4gICAgY29uc3QgbGFiZWxlZFBvaW50cyA9IGFycmF5T2ZQb2ludHMuZmlsdGVyKHBvaW50ID0+ICEhcG9pbnQucmVjdGFuZ2xlKVxuICAgIC8vIFRvIHNlcmlhbGl6ZSB3ZSBuZWVkIGFuIGlkXG4gICAgcmV0dXJuIGxhYmVsZWRQb2ludHMubWFwKHBvaW50ID0+IHsgcmV0dXJuIHtpZDogcG9pbnQuaWQsIHJlY3RhbmdsZTogXy5jbG9uZShwb2ludC5yZWN0YW5nbGUpfSB9KVxuICB9XG5cbi8vIEF0IGVhY2ggaXRlcmF0aW9uIG9mIGl0ZXJhdGl2ZSBncmVlZHkgd2UgcmVzZXQgdGhlIGNvbmRpdGlvbnNcbiAgZnVuY3Rpb24gcmVzZXRGdW5jdGlvbiAoZ2VuZXJhbGl6ZWRQb2ludCkge1xuICAgIGdlbmVyYWxpemVkUG9pbnQucmVjdGFuZ2xlID0gbnVsbFxuICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnJlc2V0QXZhaWxhYmxlU3BhY2UoZ2VuZXJhbGl6ZWRQb2ludClcbiAgfVxufVxuXG4iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge211bHRpSW50ZXJ2YWx9XG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbmNvbnN0IF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbClcbi8vRGlzam9pbnQgdW5pb24gb2Ygc2V2ZXJhbCBpbnRlcnZhbHNcbi8vIGludGVydmFscyBhcnJheSBvZiBjb29yZGluYXRlc1xuZnVuY3Rpb24gTXVsdGlJbnRlcnZhbChpbnRlcnZhbHMsIGlzQ2xvbmUpIHtcbiAgLy8gTm90IHZlcnkgbmljZSBidXQgaXQgaXMgaGFyZCB0byBjbG9uZSBpbiBqc1xuICBpZiAoaXNDbG9uZSkge1xuICAgIHRoaXMuaW50ZXJ2YWxzID0gXy5jbG9uZShpbnRlcnZhbHMpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBpZiAoIUFycmF5LmlzQXJyYXkoaW50ZXJ2YWxzKSB8fCBpbnRlcnZhbHMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhpcy5pbnRlcnZhbHMgPSBbXVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgdGhpcy5pbnRlcnZhbHMgPSBbXVxuICB2YXIgY2hlY2tlZEludGVydmFscyA9IFtdXG4gIC8vIFNvIHdlIGNhbiBjaGVjayBpbnRlcnZhbFxuICB2YXIgaW50ZXJ2YWxDb25zdHJ1Y3RvciA9IGludGVydmFsKDAsIDEpLmNvbnN0cnVjdG9yXG4gIGZvciAobGV0IG15SW50ZXJ2YWwgb2YgaW50ZXJ2YWxzKSB7XG4gICAgaWYgKCEgbXlJbnRlcnZhbCBpbnN0YW5jZW9mIGludGVydmFsQ29uc3RydWN0b3IpIHtcbiAgICAgIHRoaXMuaW50ZXJ2YWxzID0gW11cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICAgIGlmICghbXlJbnRlcnZhbC5lbXB0eSkge1xuICAgICAgY2hlY2tlZEludGVydmFscy5wdXNoKG15SW50ZXJ2YWwuY2xvbmUoKSlcbiAgICB9XG4gIH1cblxuICBjaGVja2VkSW50ZXJ2YWxzLnNvcnQoKGkxLCBpMikgPT4gaTEuc3RhcnQgLSBpMi5zdGFydClcblxuICAvLyBOb3cgd2UgbmVlZCB0byBjb2FsZXNjZSBpbnRlcnZhbHMgaWYgbmVlZGVkXG4gIGxldCBuZXh0SW50ZXJ2YWwgPSBudWxsXG4gIGZvciAobGV0IG15SW50ZXJ2YWwgb2YgY2hlY2tlZEludGVydmFscykge1xuICAgIGlmIChuZXh0SW50ZXJ2YWwgPT09IG51bGwpIHtcbiAgICAgIG5leHRJbnRlcnZhbCA9IG15SW50ZXJ2YWxcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFuZXh0SW50ZXJ2YWwuaW50ZXJzZWN0KG15SW50ZXJ2YWwpLmVtcHR5KSB7XG4gICAgICAgIG5leHRJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UobXlJbnRlcnZhbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWxzLnB1c2gobmV4dEludGVydmFsLnN0YXJ0LCBuZXh0SW50ZXJ2YWwuZW5kKVxuICAgICAgICBuZXh0SW50ZXJ2YWwgPSBteUludGVydmFsXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChuZXh0SW50ZXJ2YWwpIHtcbiAgICB0aGlzLmludGVydmFscy5wdXNoKG5leHRJbnRlcnZhbC5zdGFydCwgbmV4dEludGVydmFsLmVuZClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuTXVsdGlJbnRlcnZhbC5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBNdWx0aUludGVydmFsKFtdKVxufVxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICF0aGlzLmludGVydmFscy5sZW5ndGhcbn1cblxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUuaW50ZXJ2YWxDb25zdHJ1Y3RvciA9IGludGVydmFsKDAsIDEpLmNvbnN0cnVjdG9yXG5cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IE11bHRpSW50ZXJ2YWwodGhpcy5pbnRlcnZhbHMsIHRydWUpXG59XG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAobXlJbnRlcnZhbCkge1xuICBpZiAoISBteUludGVydmFsIGluc3RhbmNlb2YgdGhpcy5pbnRlcnZhbENvbnN0cnVjdG9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYW4gaW50ZXJ2YWwnKVxuICB9XG4gIGlmICh0aGlzLmlzRW1wdHkoKSB8fCBteUludGVydmFsLmVtcHR5KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBfcmVtb3ZlKHRoaXMuaW50ZXJ2YWxzLCBteUludGVydmFsLnN0YXJ0LCBteUludGVydmFsLmVuZClcbiAgcmV0dXJuIHRoaXNcbn1cbi8vIFJlbW92ZXMgaW4gcGxhY2VcbmZ1bmN0aW9uIF9yZW1vdmUoaW50ZXJ2YWxzLCBteVN0YXJ0LCBteUVuZCkge1xuICBsZXQgaSA9IDBcbiAgd2hpbGUgKGkgPCBpbnRlcnZhbHMubGVuZ3RoKSB7XG4gICAgY29uc3QgaW50ZXJ2YWxTdGFydCA9IGludGVydmFsc1tpXVxuICAgIGNvbnN0IGludGVydmFsRW5kID0gaW50ZXJ2YWxzW2kgKyAxXVxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15RW5kKSB7XG4gICAgICBicmVhayAvLyBubyBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICAvLyBubyBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxFbmQgPD0gbXlTdGFydCkge1xuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBmdWxsIGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15U3RhcnQgJiYgaW50ZXJ2YWxFbmQgPD0gbXlFbmQpIHtcbiAgICAgIGludGVydmFscy5zcGxpY2UoaSwgMilcbiAgICAgIC8vIGkgZG9lcyBub3QgZ3JvdyB3ZSBkZWNyZWFzZSBsZW5ndGhcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGxlZnQgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlTdGFydCAmJiBpbnRlcnZhbEVuZCA+IG15RW5kKSB7XG4gICAgICBpbnRlcnZhbHNbaV0gPSBteUVuZFxuICAgICAgYnJlYWsgLy8gVGhlcmUgd29uJ3QgYmUgYW55IG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIC8vIHJpZ2h0IGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbEVuZCA8PSBteUVuZCAmJiBpbnRlcnZhbFN0YXJ0IDwgbXlTdGFydCkge1xuICAgICAgaW50ZXJ2YWxzW2kgKyAxXSA9IG15U3RhcnRcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gaW50ZXJzZWN0cyBpbiB0aGUgbWlkZGxlXG4gICAgaWYgKGludGVydmFsRW5kID4gbXlFbmQgJiYgaW50ZXJ2YWxTdGFydCA8IG15U3RhcnQpIHtcbiAgICAgIGludGVydmFscy5zcGxpY2UoaSArIDEsIDAsIG15U3RhcnQsIG15RW5kKVxuICAgICAgYnJlYWsgLy8gdGhlcmUgd29uJ3QgYmUgYW55IG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIGNvbnNvbGUuZXJyb3IoJ1RoaXMgc2hvdWxkIG5vdCBoYXBwZW4nLCBteVN0YXJ0LCBteUVuZCwgaW50ZXJ2YWxTdGFydCwgaW50ZXJ2YWxFbmQpXG4gICAgaSArPSAyXG4gIH1cbiAgcmV0dXJuIGludGVydmFsc1xufVxuXG4vLyBJbiBwbGFjZVxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUubXVsdGlwbGVSZW1vdmUgPSBmdW5jdGlvbiAobXlNdWx0aUludGVydmFsKSB7XG4gIGlmICghIG15TXVsdGlJbnRlcnZhbCBpbnN0YW5jZW9mIE11bHRpSW50ZXJ2YWwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhIG11bHRpIGludGVydmFsJylcbiAgfVxuICBpZiAodGhpcy5pc0VtcHR5KCkgfHwgbXlNdWx0aUludGVydmFsLmlzRW1wdHkoKSkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBteU11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgX3JlbW92ZSh0aGlzLmludGVydmFscywgbXlNdWx0aUludGVydmFsLmludGVydmFsc1tpXSwgbXlNdWx0aUludGVydmFsLmludGVydmFsc1tpICsgMV0pXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuZnVuY3Rpb24gX21lYXN1cmVJbnRlcnNlY3Rpb24gKGludGVydmFscywgbXlTdGFydCwgbXlFbmQpIHtcbiAgbGV0IGkgPSAwXG4gIGxldCBtZWFzdXJlID0gMFxuICB3aGlsZSAoaSA8IGludGVydmFscy5sZW5ndGgpIHtcbiAgICBjb25zdCBpbnRlcnZhbFN0YXJ0ID0gaW50ZXJ2YWxzW2ldXG4gICAgY29uc3QgaW50ZXJ2YWxFbmQgPSBpbnRlcnZhbHNbaSArIDFdXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlFbmQpIHtcbiAgICAgIGJyZWFrIC8vIG5vIG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIC8vIG5vIGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbEVuZCA8PSBteVN0YXJ0KSB7XG4gICAgICBpICs9IDJcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGZ1bGwgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlTdGFydCAmJiBpbnRlcnZhbEVuZCA8PSBteUVuZCkge1xuICAgICAgbWVhc3VyZSArPSB1dGlscy5tZWFzdXJlKGludGVydmFsU3RhcnQsIGludGVydmFsRW5kKVxuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBsZWZ0IGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15U3RhcnQgJiYgaW50ZXJ2YWxFbmQgPiBteUVuZCkge1xuICAgICAgbWVhc3VyZSArPSB1dGlscy5tZWFzdXJlKGludGVydmFsU3RhcnQsIG15RW5kKVxuICAgICAgYnJlYWsgLy8gVGhlcmUgd29uJ3QgYmUgYW55IG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIC8vIHJpZ2h0IGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbEVuZCA8PSBteUVuZCAmJiBpbnRlcnZhbFN0YXJ0IDwgbXlTdGFydCkge1xuICAgICAgbWVhc3VyZSArPSB1dGlscy5tZWFzdXJlKG15U3RhcnQsIGludGVydmFsRW5kKVxuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBpbnRlcnNlY3RzIGluIHRoZSBtaWRkbGVcbiAgICBpZiAoaW50ZXJ2YWxFbmQgPiBteUVuZCAmJiBpbnRlcnZhbFN0YXJ0IDwgbXlTdGFydCkge1xuICAgICAgbWVhc3VyZSArPSB1dGlscy5tZWFzdXJlKG15U3RhcnQsIG15RW5kKVxuICAgICAgYnJlYWsgLy8gdGhlcmUgd29uJ3QgYmUgYW55IG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIGNvbnNvbGUuZXJyb3IoJ1RoaXMgc2hvdWxkIG5vdCBoYXBwZW4nLCBteVN0YXJ0LCBteUVuZCwgaW50ZXJ2YWxTdGFydCwgaW50ZXJ2YWxFbmQpXG4gICAgaSArPSAyXG4gIH1cbiAgcmV0dXJuIG1lYXN1cmVcbn1cblxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUubWVhc3VyZU11bHRpcGxlSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKG11bHRpSW50ZXJ2YWwpIHtcbiAgbGV0IG1lYXN1cmUgPSAwXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbXVsdGlJbnRlcnZhbC5pbnRlcnZhbHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBtZWFzdXJlICs9IF9tZWFzdXJlSW50ZXJzZWN0aW9uKHRoaXMuaW50ZXJ2YWxzLCBtdWx0aUludGVydmFsLmludGVydmFsc1tpXSwgbXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaSsxXSlcbiAgfVxuICByZXR1cm4gbWVhc3VyZVxufVxuXG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5tZWFzdXJlID0gZnVuY3Rpb24gKCkge1xuICBsZXQgbWVhc3VyZSA9IDBcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmludGVydmFscy5sZW5ndGg7IGkgKz0gMikge1xuICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZSh0aGlzLmludGVydmFsc1tpXSwgdGhpcy5pbnRlcnZhbHNbaSArIDFdKVxuICB9XG4gIHJldHVybiBtZWFzdXJlXG59XG5cblxuLy9UT0RPIHRlc3Rcbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmdldE1pbiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuaXNFbXB0eSgpKSByZXR1cm4gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG4gIHJldHVybiB0aGlzLmludGVydmFsc1swXS8vdGhpcy5pbnRlcnZhbHMucmVkdWNlKChtaW4sIGN1cikgPT4gY3VyLnN0YXJ0IDwgbWluID8gY3VyLnN0YXJ0IDogbWluLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG59XG5cbm11bHRpSW50ZXJ2YWwuY29hbGVzY2UgPSBmdW5jdGlvbiAoaW50ZXJ2YWwsIGFub3RoZXJJbnRlcnZhbCkge1xuICBpZiAoaW50ZXJ2YWwuc3RhcnQgPiBhbm90aGVySW50ZXJ2YWwuZW5kIHx8IGFub3RoZXJJbnRlcnZhbC5zdGFydCA+IGludGVydmFsLmVuZCkge1xuICAgIHJldHVybiBtdWx0aUludGVydmFsKFtpbnRlcnZhbCwgYW5vdGhlckludGVydmFsXSlcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbXVsdGlJbnRlcnZhbChbaW50ZXJ2YWwuY29hbGVzY2UoYW5vdGhlckludGVydmFsKV0pXG4gIH1cbn1cbm11bHRpSW50ZXJ2YWwuZW1wdHkgPSBNdWx0aUludGVydmFsLmVtcHR5XG5cbmZ1bmN0aW9uIG11bHRpSW50ZXJ2YWwgKGludGVydmFscykge1xuICByZXR1cm4gbmV3IE11bHRpSW50ZXJ2YWwoaW50ZXJ2YWxzKVxufSIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSB7cmF5SW50ZXJzZWN0aW9ufVxuXG5jb25zdCBmaW5kQmVzdFJheSA9IHJlcXVpcmUoJy4vZmluZC1iZXN0LXJheScpXG5jb25zdCBleHRlbmRlZFBvaW50TWV0aG9kcyA9IHJlcXVpcmUoJy4vZXh0ZW5kZWQtcG9pbnQtbWV0aG9kcycpXG5jb25zdCBtdWx0aUludGVydmFsID0gcmVxdWlyZSgnLi9tdWx0aS1pbnRlcnZhbCcpLm11bHRpSW50ZXJ2YWxcbmNvbnN0IGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG4vLyBCZXR0ZXIgdG8gZ3JhYiB0aGUgbW9kdWxlIGhlcmUgYW5kIGZldGNoIHRoZSBtZXRob2QgaW4gdGhlIGFsZ29yaXRobSwgdGhhdCB3YXkgd2UgY2FuIHN0dWJcbmNvbnN0IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJylcbmNvbnN0IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtc2VnbWVudC1pbnRlcnNlY3Rpb24nKVxuY29uc3QgcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLnJheVJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgcmF5U2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LXNlZ21lbnQtaW50ZXJzZWN0aW9uJykucmF5U2VnbWVudEludGVyc2VjdGlvblxuY29uc3QgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKVxuXG4vLyBUT0RPIHVzZSBzZXRzXG5hc3luYyBmdW5jdGlvbiByYXlJbnRlcnNlY3Rpb24gKHBvaW50c1RvTGFiZWwsIHBvaW50c05vdFRvTGFiZWwpIHtcbiAgcG9pbnRzVG9MYWJlbC5mb3JFYWNoKHA9PiBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwKSlcbiAgY29uc3QgcmVqZWN0ZWRQb2ludHMgPSBfLmZpbHRlcihwb2ludHNUb0xhYmVsLCBwID0+IHAuYXZhaWxhYmxlTWVhc3VyZSA9PT0gMClcbiAgLy8gUCBpbiB0aGUgYXJ0aWNsZVxuICB2YXIgcmVtYWluaW5nUG9pbnRzID0gXy5maWx0ZXIocG9pbnRzVG9MYWJlbCwgcCA9PiBwLmF2YWlsYWJsZU1lYXN1cmUgPiAwKVxuICB2YXIgUDAgPSBwb2ludHNUb0xhYmVsLmNvbmNhdChwb2ludHNOb3RUb0xhYmVsKVxuICBjb25zdCBwb2ludHNMYWJlbGVkID0gW10gLy8gSGVyZSB3ZSBkaWZmZXIgZnJvbSB0aGUgb3JpZ2luYWwgYXJ0aWNsZSwgb25jZSB3ZSBmaW5kIGEgcG9pbnQgaW4gUCB0byBsYWJlbCB3ZSByZW1vdmUgaXQgZnJvbSBQIGFuZCBhZGQgaXQgdG8gcG9pbnRzTGFiZWxlZCwgb3RoZXJ3aXNlIHRoZSBhbGdvcml0aG0gZG9lcyBub3QgZmluaXNoXG4gIHdoaWxlIChyZW1haW5pbmdQb2ludHMubGVuZ3RoICE9PSAwKSB7XG4gICAgbGV0IGJlc3RSYXkgPSBhd2FpdCBmaW5kQmVzdFJheS5maW5kQmVzdFJheShyZW1haW5pbmdQb2ludHMsIHBvaW50c05vdFRvTGFiZWwpXG4gICAgbGV0IHJpaiA9IGJlc3RSYXkucmJlc3RcbiAgICBsZXQgcGkgPSBiZXN0UmF5LnBiZXN0XG4gICAgaWYgKHJpaiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBJdCBjb3VsZCBvbmx5IGhhcHBlbiB0aGF0IHdlIGdldCByaWogdW5kZWZpbmVkIGluIHRoZSBmaXJzdCBpdGVyYXRpb25cbiAgICAgIGlmIChwb2ludHNMYWJlbGVkLmxlbmd0aCAhPT0gMCB8fCByZWplY3RlZFBvaW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGJlaGF2aW91cicpXG4gICAgICB9XG4gICAgICByZXR1cm4ge2Nob3NlbjogW10sIHJlamVjdGVkOiBfLmNsb25lKHBvaW50c1RvTGFiZWwpfVxuICAgIH1cbiAgICBsZXQgdmkgPSB7eDogcmlqLnZlY3Rvci54ICogcmlqLmF2YWlsYWJsZS5nZXRNaW4oKSwgeTogcmlqLnZlY3Rvci55ICogcmlqLmF2YWlsYWJsZS5nZXRNaW4oKX1cbiAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5wcm9tb3RlTGFiZWxUb1JlY3RhbmdsZShwaSwgdmkpXG4gICAgcmVtYWluaW5nUG9pbnRzID0gcmVtYWluaW5nUG9pbnRzLmZpbHRlcihlbCA9PiBlbCAhPT0gcGkpXG4gICAgUDAgPSBQMC5maWx0ZXIoZWwgPT4gZWwgIT09IHBpKVxuICAgIHBvaW50c0xhYmVsZWQucHVzaChwaSlcbiAgICBmb3IgKGxldCBwayBvZiBQMCkge1xuICAgICAgZm9yIChsZXQgcmtsIG9mIHBrLnJheXMpIHtcbiAgICAgICAgbGV0IGxhYmVsSW50ZXJzZWN0aW9uXG4gICAgICAgIGxldCBzZWdtZW50SW50ZXJzZWN0aW9uXG4gICAgICAgIGNvbnN0IGxhYmVsSW50ZXJ2YWwgPSBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbi5sYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbihwaS5yZWN0YW5nbGUsIHBrLmxhYmVsLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3Qgc2VnbWVudEludGVydmFsID0gbGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uLmxhYmVsU2VnbWVudEludGVyc2VjdGlvbihwaS5wb3NpdGlvbiwgdmksIHBrLmxhYmVsLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3QgcmF5SW50ZXJ2YWwgPSByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocGkucmVjdGFuZ2xlLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3QgcmF5U2VnbWVudEludGVydmFsID0gcmF5U2VnbWVudEludGVyc2VjdGlvbihwaS5wb3NpdGlvbiwgdmksIHBrLnBvc2l0aW9uLCBya2wudmVjdG9yKVxuICAgICAgICBsYWJlbEludGVyc2VjdGlvbiA9IGxhYmVsSW50ZXJ2YWwuY29hbGVzY2VJblBsYWNlKHJheUludGVydmFsKVxuICAgICAgICBzZWdtZW50SW50ZXJzZWN0aW9uID0gc2VnbWVudEludGVydmFsLmNvYWxlc2NlSW5QbGFjZShyYXlTZWdtZW50SW50ZXJ2YWwpXG4gICAgICAgIGlmICghbGFiZWxJbnRlcnNlY3Rpb24uZW1wdHkgfHwgIXNlZ21lbnRJbnRlcnNlY3Rpb24uZW1wdHkpIHtcbiAgICAgICAgICBya2wuYXZhaWxhYmxlLm11bHRpcGxlUmVtb3ZlKG11bHRpSW50ZXJ2YWwuY29hbGVzY2UobGFiZWxJbnRlcnNlY3Rpb24sIHNlZ21lbnRJbnRlcnNlY3Rpb24pKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwaylcblxuICAgICAgLy8gVGhlIG9yaWdpbmFsIGFydGljbGUgaXMgbm90IHZlcnkgY2xlYXIgaGVyZS4gSXQgcmVtb3ZlcyB0aGUgcG9pbnQgZnJvbSBQIGJ1dCB0aGUgaXRlcmF0aW9uIHdhcyBvbiBQMC4gSSBzdXBwb3NlIHRoYXQgaWYgdGhlIGludGVncmFsIGlzIDAgYW5kIHRoZSBwb2ludCBpcyBpbiBQIHRoZW4gaXQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IGl0ZXJhdGlvbiBvZiB0aGUgZ3JlZWR5IGFsZ29yaXRobVxuICAgICAgaWYgKHBrLmF2YWlsYWJsZU1lYXN1cmUgPT09IDAgJiYgcmVtYWluaW5nUG9pbnRzLmZpbmRJbmRleChlbCA9PiBlbCA9PT0gcGspICE9PSAtMSl7XG4gICAgICAgIFAwID0gUDAuZmlsdGVyKGVsID0+IGVsICE9PSBwaylcbiAgICAgICAgcmVtYWluaW5nUG9pbnRzID0gcmVtYWluaW5nUG9pbnRzLmZpbHRlcihlbCA9PiBlbCAhPT0gcGspXG4gICAgICAgIHJlamVjdGVkUG9pbnRzLnB1c2gocGspXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB7Y2hvc2VuOiBwb2ludHNMYWJlbGVkLCByZWplY3RlZDogcmVqZWN0ZWRQb2ludHN9XG59IiwiLy8gR2l2ZW4gYSByYXkgYW5kIGEgcmVjdGFuZ2xlLCByZXR1cm4gdGhlIGludGVydmFsIGZyb20gdGhlIGludGVyc2VjdGlvbiB0byBpbmZpbml0eSAoaXQgYmxvY2tzIHRoZSByYXkpXG5tb2R1bGUuZXhwb3J0cyA9IHtyYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb259XG5jb25zdCBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLmxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuXG5mdW5jdGlvbiByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24gKGxrLCB2aSwgcGkpIHtcbiAgLy8gQmFzaWNhbGx5IG1ha2UgYSBmYWtlIGxhYmVsIG9mIDAgaGVpZ2h0IGFuZCB3aWR0aFxuICBjb25zdCBsaSA9IHtoZWlnaHQ6IDAsIHdpZHRoOiAwfVxuICBjb25zdCBpbnRlcnNlY3Rpb24gPSBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbihsaywgbGksIHZpLCBwaSlcbiAgaWYgKGludGVyc2VjdGlvbi5lbXB0eSkge1xuICAgIHJldHVybiBpbnRlcnNlY3Rpb25cbiAgfVxuICByZXR1cm4gaW50ZXJ2YWwoaW50ZXJzZWN0aW9uLnN0YXJ0LCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtyYXlTZWdtZW50SW50ZXJzZWN0aW9ufVxuXG5jb25zdCBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vc2VnbWVudC1zZWdtZW50LWludGVyc2VjdGlvbicpLnNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uXG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuXG4vKlxucGosIHZqIGRlZmluZXMgYSByYXlcbiAqL1xuZnVuY3Rpb24gcmF5U2VnbWVudEludGVyc2VjdGlvbiAocGksIHZpLCBwaiwgdmopIHtcbiAgY29uc3QgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24ocGosIHZqLCBwaSwgdmkpXG4gIGlmIChpbnRlcnNlY3Rpb24gPT09IG51bGwpIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gIGNvbnN0IHt0LCBzfSA9IGludGVyc2VjdGlvblxuICAvLyB0IGlzIHRpbWUgaW4gcmF5LCBzIHBhcmFtZXRlciBvbiB0aGUgc2VnbWVudFxuICBpZiAodCA8PSAwIHx8IHMgPCAwIHx8IHMgPiAxKSB7XG4gICAgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgfVxuICByZXR1cm4gaW50ZXJ2YWwodCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxufSIsIm1vZHVsZS5leHBvcnRzID0ge3NlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9ufVxuLy8gQSBwb2ludCBwaSBtb3ZlcyB3aXRoIHZpLCBhIHNlZ21lbnQgaXMgZGVmaW5lZCB3aXRoIHBqLCB2aiwgd2UgZmluZCB0aGUgdGltZSB0IGF0IHdoaWNoIHRoZSBwb2ludCBpbnRlcnNlY3RzIGFuZCByZXR1cm5zIHBhcmFtZXRlcnMgcyBvbiB0aGUgc2VnbWVudFxuLy8gVE9ETyBjaGFuZ2Ugb3JkZXIgc28gdGhhdCBwaiwgdmogaXMgdGhlIHJheVxuZnVuY3Rpb24gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24gKHBpLCB2aSwgcGosIHZqIC8qIFZlY3RvciBvZiB0aGUgc2VnbWVudCAqLykge1xuICAvLyAodmkgLXZqKSh0LCBzKV5UID0gKHBqIC0gcGkpXG4gIHZhciBkZXQgPSAtKHZpLnggKiB2ai55IC0gdmoueCAqIHZpLnkpXG4gIGlmIChkZXQgPT09IDApIHsgLy8gUGFyYWxsZWwgbGluZXNcbiAgICAvLyBUZXN0IHRoaXNcbiAgICBpZiAoKHBpLnggLSBwai54KSAqIHZqLnkgLSAocGkuaiAtIHBqLnkpICogdmoueCAhPT0gMCkgcmV0dXJuIG51bGwgLy8gTGluZSBkb2VzIG5vdCBiZWxvbmdcbiAgICAvLyBUT0RPIGNvbmN1cnJlbnQgbGluZXNcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFsbGVsIGxpbmVzIG5vdCBhbGxvd2VkJykgLy8gVGhpcyBtdXN0IGJlIGhhbmRsZWQgb3V0IG9mIHRoZSBhbGdvcml0aG1cbiAgfVxuICBjb25zdCB0ID0gKC0ocGoueCAtIHBpLngpICogdmoueSArIChwai55IC0gcGkueSkgKiB2ai54KSAvIGRldFxuICBjb25zdCBzID0gKC0ocGoueCAtIHBpLngpICogdmkueSArIChwai55IC0gcGkueSkgKiB2aS54KSAvIGRldFxuICByZXR1cm4ge3QsIHN9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtjb21wYXJlQXJyYXlzTGV4aWNvZ3JhcGhpY2FsbHksIG1lYXN1cmV9XG5cbmZ1bmN0aW9uIGNvbXBhcmVBcnJheXNMZXhpY29ncmFwaGljYWxseSAoYXJyMSwgYXJyMikge1xuICB2YXIgaSA9IDBcbiAgd2hpbGUgKGkgPCBNYXRoLm1pbihhcnIxLmxlbmd0aCwgYXJyMi5sZW5ndGgpKSB7XG4gICAgaWYgKGFycjFbaV0gIT0gYXJyMltpXSkgcmV0dXJuIGFycjFbaV0gLSBhcnIyW2ldXG4gICAgaSsrXG4gIH1cbiAgcmV0dXJuIGFycjEubGVuZ3RoIC0gYXJyMi5sZW5ndGhcbn1cblxuZnVuY3Rpb24gbWVhc3VyZSAoc3RhcnQsIGVuZCkge1xuICByZXR1cm4gTWF0aC5wb3coMiwgLXN0YXJ0KSAtIE1hdGgucG93KDIsIC1lbmQpXG59Il19
