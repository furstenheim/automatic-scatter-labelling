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
    top: point.y + vi.y + label.height / 2 + label.offsetY,
    bottom: point.y + vi.y - label.height / 2 + label.offsetY,
    left: point.x + vi.x - label.width / 2 + label.offsetX,
    right: point.x + vi.x + label.width / 2 + label.offsetX
  };
}

},{"./interval":6,"./label-rectangle-intersection":7,"./multi-interval":11,"./ray-rectangle-intersection":13}],5:[function(require,module,exports){
'use strict';

module.exports = { findBestRay };

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
  const pi = P.reduce((i, j) => i.availableMeasure < j.availableMeasure ? i : j);
  let R = pi.rays.filter(r => r.availableMeasure > 0);
  rijloop: for (let rij of R) {
    let Vij = [];
    let segment = { x: rij.vector.x * rij.minimum, y: rij.vector.y * rij.minimum };
    const rectangle = extendedPointMethods.translateLabel(pi, segment);
    for (let pk of P0) {
      if (pk === pi) continue;
      // No sense to wait for the intersection if rbest is defined

      // int pk
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
      minimumAvailableSpace = Vij.reduce((i, j) => Math.min(i, j), Number.POSITIVE_INFINITY);
      pbest = pi;
    }
  }
  // We need to return intersectionData because the reference has been neutered in find ray intersection
  return { rbest: rbest, pbest: pbest };
}

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
    const firstIntersection = (lk.height / 2 + li.height / 2 - li.offsetY + (lk.top + lk.bottom) / 2 - pi.y) / vi.y;
    const secondIntersection = (-lk.height / 2 - li.height / 2 - li.offsetY + (lk.top + lk.bottom) / 2 - pi.y) / vi.y;
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
    if (li.offsetY + pi.y - (lk.top + lk.bottom) / 2 > lk.height / 2 + li.height / 2) return interval.empty();
    if (li.offsetY + pi.y - (lk.top + lk.bottom) / 2 < -lk.height / 2 - li.height / 2) return interval.empty();
  }
  if (vi.x !== 0) {
    const thirdIntersection = (lk.width / 2 + li.width / 2 + (lk.right + lk.left) / 2 - pi.x - li.offsetX) / vi.x;
    const fourthIntersection = (-lk.width / 2 - li.width / 2 + (lk.right + lk.left) / 2 - pi.x - li.offsetX) / vi.x;
    if (vi.x > 0) {
      max = Math.min(max, thirdIntersection);
      min = Math.max(min, fourthIntersection);
    } else {
      min = Math.max(min, thirdIntersection);
      max = Math.min(max, fourthIntersection);
    }
  } else {
    if (pi.x + li.offsetX - (lk.right + lk.left) / 2 > lk.width / 2 + li.width / 2) return interval.empty();
    if (pi.x + li.offsetX - (lk.right + lk.left) / 2 < -lk.width / 2 - li.width / 2) return interval.empty();
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
  pk = { x: pk.x - pi.x - li.offsetX, y: pk.y - pi.y - li.offsetY };
  // TODO handle parallel lines
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
        label: {
          height: p.label.height,
          width: p.label.width,
          offsetX: p.label.offsetX || 0,
          offsetY: p.label.offsetY || 0
        }
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
      console.error('src/main-algorithm-loader.js:52:20:\'This event case should not happen\',data.type', 'This event case should not happen', data.type);
  }
};

function endEvent(event) {
  const { processUUID } = event.data;
  const callback = promiseResolutions[processUUID];
  callback(event);
  delete promiseResolutions[processUUID];
}

},{"./main-algorithm.js":10,"webworkify":3}],10:[function(require,module,exports){
let NUMBER_OF_RAYS;
// Called as webworker
module.exports = function (self) {
  const extendedPointMethods = require('./extended-point-methods');
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
          console.error('src/main-algorithm.js:15:24:\'Not a valid event type\',data.type', 'Not a valid event type', data.type);
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
    NUMBER_OF_RAYS = typeof params.NUMBER_OF_RAYS === 'number' ? params.NUMBER_OF_RAYS : 3;
    const MAX_NUMBER_OF_ITERATIONS = typeof params.MAX_NUMBER_OF_ITERATIONS === 'number' ? params.MAX_NUMBER_OF_ITERATIONS : 1;
    computeRays(extendedPoints);
    extendedPointMethods.computeInitialAvailabeSpaces(extendedPoints, { radius: params.radius || 2, bbox: params.bbox });
    extendedPoints.forEach(function (p) {
      extendedPointMethods.resetAvailableSpace(p);
      extendedPointMethods.updateAvailableSpace(p);
    });
    const possiblePoints = extendedPoints.filter(p => p.availableMeasure > 0);
    return iterativeGreedy.solve(rayIntersection, possiblePoints, resetFunction, { serializeFunction, MAX_NUMBER_OF_ITERATIONS });
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
      return { id: point.id, rectangle: Object.assign({}, point.rectangle) };
    });
  }

  // At each iteration of iterative greedy we reset the conditions
  function resetFunction(generalizedPoint) {
    generalizedPoint.rectangle = null;
    extendedPointMethods.resetAvailableSpace(generalizedPoint);
  }
};

},{"./extended-point-methods":4,"./ray-intersection":12,"iterative-greedy":2}],11:[function(require,module,exports){
'use strict';

module.exports = { multiInterval };
const interval = require('./interval').interval;
const utils = require('./utils');
// Disjoint union of several intervals
// intervals array of coordinates
function MultiInterval(intervals, isClone) {
  // Not very nice but it is hard to clone in js
  if (isClone) {
    this.intervals = [...intervals];
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
    console.error('src/multi-interval.js:110:18:\'This should not happen\',myStart,myEnd,intervalStart,intervalEnd', 'This should not happen', myStart, myEnd, intervalStart, intervalEnd);
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
    console.error('src/multi-interval.js:166:18:\'This should not happen\',myStart,myEnd,intervalStart,intervalEnd', 'This should not happen', myStart, myEnd, intervalStart, intervalEnd);
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

// TODO test
MultiInterval.prototype.getMin = function () {
  if (this.isEmpty()) return Number.POSITIVE_INFINITY;
  return this.intervals[0];
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

},{"./interval":6,"./utils":16}],12:[function(require,module,exports){
'use strict';

module.exports = { rayIntersection };

const findBestRay = require('./find-best-ray');
const extendedPointMethods = require('./extended-point-methods');
const multiInterval = require('./multi-interval').multiInterval;
// Better to grab the module here and fetch the method in the algorithm, that way we can stub
const labelRectangleIntersection = require('./label-rectangle-intersection');
const labelSegmentIntersection = require('./label-segment-intersection');
const rayRectangleIntersection = require('./ray-rectangle-intersection').rayRectangleIntersection;
const raySegmentIntersection = require('./ray-segment-intersection').raySegmentIntersection;

// TODO use sets
async function rayIntersection(pointsToLabel, pointsNotToLabel) {
  pointsToLabel.forEach(p => extendedPointMethods.updateAvailableSpace(p));
  const rejectedPoints = pointsToLabel.filter(p => p.availableMeasure === 0);
  // P in the article
  var remainingPoints = pointsToLabel.filter(p => p.availableMeasure > 0);
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
      return { chosen: [], rejected: [...pointsToLabel] };
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

},{"./extended-point-methods":4,"./find-best-ray":5,"./label-rectangle-intersection":7,"./label-segment-intersection":8,"./multi-interval":11,"./ray-rectangle-intersection":13,"./ray-segment-intersection":14}],13:[function(require,module,exports){
// Given a ray and a rectangle, return the interval from the intersection to infinity (it blocks the ray)
module.exports = { rayRectangleIntersection };
const labelRectangleIntersection = require('./label-rectangle-intersection').labelRectangleIntersection;
const interval = require('./interval').interval;

function rayRectangleIntersection(lk, vi, pi) {
  // Basically make a fake label of 0 height and width
  const li = { height: 0, offsetX: 0, offsetY: 0, width: 0 };
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
    if (arr1[i] !== arr2[i]) return arr1[i] - arr2[i];
    i++;
  }
  return arr1.length - arr2.length;
}

function measure(start, end) {
  return Math.pow(2, -start) - Math.pow(2, -end);
}

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pdGVyYXRpdmUtZ3JlZWR5L2Rpc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd2Vid29ya2lmeS9pbmRleC5qcyIsInNyYy9leHRlbmRlZC1wb2ludC1tZXRob2RzLmpzIiwic3JjL2ZpbmQtYmVzdC1yYXkuanMiLCJzcmMvaW50ZXJ2YWwuanMiLCJzcmMvbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9sYWJlbC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy9tYWluLWFsZ29yaXRobS1sb2FkZXIuanMiLCJzcmMvbWFpbi1hbGdvcml0aG0uanMiLCJzcmMvbXVsdGktaW50ZXJ2YWwuanMiLCJzcmMvcmF5LWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktc2VnbWVudC1pbnRlcnNlY3Rpb24uanMiLCJzcmMvc2VnbWVudC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxNQUFNLFNBQVUsT0FBTyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDLE9BQU8sR0FBUCxDQUFoQyxHQUE4QyxPQUFPLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0MsT0FBTyxHQUFQLENBQWhDLEdBQThDLElBQTVHO0FBQ0EsTUFBTSxzQkFBc0IsUUFBUSw2QkFBUixDQUE1QjtBQUNBLE9BQU8sT0FBUCxHQUFpQixvQkFBb0IsYUFBckM7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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LENBQTVDLElBQWlELEdBQTNEO0FBQ0EsU0FBTyxFQUFDLENBQUQsRUFBSSxDQUFKLEVBQVA7QUFDRDs7O0FDZkQsT0FBTyxPQUFQLEdBQWlCLEVBQUMsOEJBQUQsRUFBaUMsT0FBakMsRUFBakI7O0FBRUEsU0FBUyw4QkFBVCxDQUF5QyxJQUF6QyxFQUErQyxJQUEvQyxFQUFxRDtBQUNuRCxNQUFJLElBQUksQ0FBUjtBQUNBLFNBQU8sSUFBSSxLQUFLLEdBQUwsQ0FBUyxLQUFLLE1BQWQsRUFBc0IsS0FBSyxNQUEzQixDQUFYLEVBQStDO0FBQzdDLFFBQUksS0FBSyxDQUFMLE1BQVksS0FBSyxDQUFMLENBQWhCLEVBQXlCLE9BQU8sS0FBSyxDQUFMLElBQVUsS0FBSyxDQUFMLENBQWpCO0FBQ3pCO0FBQ0Q7QUFDRCxTQUFPLEtBQUssTUFBTCxHQUFjLEtBQUssTUFBMUI7QUFDRDs7QUFFRCxTQUFTLE9BQVQsQ0FBa0IsS0FBbEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDNUIsU0FBTyxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQyxLQUFiLElBQXNCLEtBQUssR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFDLEdBQWIsQ0FBN0I7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBsb2Rhc2ggPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbClcbmNvbnN0IG1haW5BbGdvcml0aG1Mb2FkZXIgPSByZXF1aXJlKCcuL3NyYy9tYWluLWFsZ29yaXRobS1sb2FkZXInKVxubW9kdWxlLmV4cG9ydHMgPSBtYWluQWxnb3JpdGhtTG9hZGVyLm1haW5BbGdvcml0aG0iLCJcblxuLy8gVE9ETyBhZGQgdGhlIHBvc3NpYmlsaXR5IHRvIG93biBzY29yZSBmdW5jdGlvblxuLyoqXG4gKlxuICogQHBhcmFtIGdyZWVkeUFsZ29yaXRobSBmdW5jdGlvbiB0aGF0IHJlY2VpdmVzIHR3byBhcnJheXMsIG9uZSBvZiBlbGVtZW50cyB0byBiZSBjb21wdXRlZCBhbmQgb25lIGZvciB0aGUgcG9pbnRzIGZvciB0aGUgcmVzdCBvZiB0aGUgaXRlcmF0aW9ucy5cbiAqIEl0IHJldHVybnMgYW4gb2JqZWN0IHdpdGggdHdvIGVsZW1lbnRzLCBjaG9zZW4gYW5kIHJlamVjdGVkXG4gKiBAcGFyYW0gc3RhcnRpbmdEYXRhIHN0YXJ0aW5nIGFycmF5IG9mIGVsZW1lbnRzXG4gKiBAcGFyYW0gcmVzZXRGdW5jdGlvbiBmdW5jdGlvbiB0byBiZSBhcHBsaWVkIHRvIGVhY2ggZWxlbWVudCBhdCB0aGUgc3RhcnQgb2YgZWFjaCBpdGVyYXRpb25cbiAqIEBwYXJhbSBwYXJhbXMgZXh0cmEgcGFyYW1zXG4gKi9cbmxldCBpdGVyYXRpdmVHcmVlZHlBbGdvcml0aG0gPSAoKCkgPT4ge1xuICB2YXIgX3JlZiA9IF9hc3luY1RvR2VuZXJhdG9yKGZ1bmN0aW9uKiAoZ3JlZWR5QWxnb3JpdGhtLCBzdGFydGluZ0RhdGEsIHJlc2V0RnVuY3Rpb24sIHBhcmFtcyA9IHt9KSB7XG4gICAgY29uc3QgTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TID0gdHlwZW9mIHBhcmFtcy5NQVhfTlVNQkVSX09GX0lURVJBVElPTlMgPT09ICdudW1iZXInID8gcGFyYW1zLk1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA6IDEwMDtcbiAgICAvLyBBdCBldmVyeSBsb29wIGlmIHdlIGltcHJvdmUgdGhlIHJlc3VsdCB0aGVuIHdlIGFwcGx5IHNlcmlhbGl6ZSBmdW5jdGlvbiB0byB0aGUgcmVzdWx0IHRvIHNhdmUgYSBjb3B5XG4gICAgY29uc3Qgc2VyaWFsaXplRnVuY3Rpb24gPSB0eXBlb2YgcGFyYW1zLnNlcmlhbGl6ZUZ1bmN0aW9uID09PSAnZnVuY3Rpb24nID8gcGFyYW1zLnNlcmlhbGl6ZUZ1bmN0aW9uIDogZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHgpKTtcbiAgICB9O1xuICAgIC8vIEluIHRoZSBncmVlZHkgcXVldWUgd2Ugc3RvcmUgYWxsIHRoZSBlbGVtZW50cyBpbiBhcnJheSBpbiByZXZlcnNlIG9yZGVyIG9mIGV4ZWN1dGlvblxuICAgIGNvbnN0IGdyZWVkeVF1ZXVlID0gW3N0YXJ0aW5nRGF0YV07XG4gICAgbGV0IGJlc3RHcmVlZHlRdWV1ZSA9IFtdO1xuICAgIGxldCBiZXN0U2NvcmUgPSAwO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TOyBqKyspIHtcbiAgICAgIGxldCBpdGVyYXRpb25TY29yZSA9IDA7XG4gICAgICBncmVlZHlRdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XG4gICAgICAgIGNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgIHJlc2V0RnVuY3Rpb24uY2FsbChlbGVtZW50LCBlbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IG4gPSBncmVlZHlRdWV1ZS5sZW5ndGg7XG4gICAgICBmb3IgKGxldCBpID0gbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IHsgY2hvc2VuLCByZWplY3RlZCB9ID0geWllbGQgZ3JlZWR5QWxnb3JpdGhtKGdyZWVkeVF1ZXVlW2ldLCBmbGF0dGVuKGdyZWVkeVF1ZXVlLnNsaWNlKDAsIGkpKSk7XG4gICAgICAgIGl0ZXJhdGlvblNjb3JlICs9IGNob3Nlbi5sZW5ndGg7XG4gICAgICAgIGlmIChjaG9zZW4ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgZ3JlZWR5UXVldWVbaV0gPSBjaG9zZW47XG4gICAgICAgICAgLy8gZW5kIG9mIHRoZSBxdWV1ZVxuICAgICAgICAgIGlmIChpID09PSBuIC0gMSkge1xuICAgICAgICAgICAgaWYgKHJlamVjdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICBncmVlZHlRdWV1ZS5wdXNoKHJlamVjdGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ3JlZWR5UXVldWVbaSArIDFdID0gWy4uLmdyZWVkeVF1ZXVlW2kgKyAxXSwgLi4ucmVqZWN0ZWRdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBjaG9zZW4ubGVuZ3RoID09PSAwIHRoZW4gdGhlc2UgZWxlbWVudHMgY291bGQgbm90IGJlIGFzc2lnbmVkIGV2ZW4gYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgcXVldWUsIHdlIHNob3VsZCBnZXQgcmlkIG9mIHRoZW1cbiAgICAgICAgICBpZiAoaSAhPT0gbiAtIDEpIHtcbiAgICAgICAgICAgIGdyZWVkeVF1ZXVlW2ldID0gZ3JlZWR5UXVldWVbaSArIDFdO1xuICAgICAgICAgICAgZ3JlZWR5UXVldWVbaSArIDFdID0gcmVqZWN0ZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXRlcmF0aW9uU2NvcmUgPiBiZXN0U2NvcmUpIHtcbiAgICAgICAgYmVzdFNjb3JlID0gaXRlcmF0aW9uU2NvcmU7XG4gICAgICAgIC8vIFRoZXJlIG11c3QgYmUgYSBiZXR0ZXIgd2F5IHRvIHN0b3JlIHRoZSByZXN1bHRcbiAgICAgICAgLy8gUGx1cyB0aGUgbmFtZSBpcyBhIGJpdCB0cmlja3ksIG9uZSBleHBlY3RzIHRoYXQgdGhlIGFsZ29yaXRobSBpbiBpdCBwYXNzIHNldHMgdGhlIGVsZW1lbnRzXG4gICAgICAgIGJlc3RHcmVlZHlRdWV1ZSA9IHNlcmlhbGl6ZUZ1bmN0aW9uKGZsYXR0ZW4oZ3JlZWR5UXVldWUpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGdyZWVkeVF1ZXVlTGVuZ3RoID0gZ3JlZWR5UXVldWUucmVkdWNlKGZ1bmN0aW9uIChsZW5ndGgsIGFycmF5KSB7XG4gICAgICAgIHJldHVybiBsZW5ndGggKyBhcnJheS5sZW5ndGg7XG4gICAgICB9LCAwKTtcbiAgICAgIGlmIChpdGVyYXRpb25TY29yZSA9PT0gZ3JlZWR5UXVldWVMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGJlc3RHcmVlZHlRdWV1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJlc3RHcmVlZHlRdWV1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGl0ZXJhdGl2ZUdyZWVkeUFsZ29yaXRobShfeCwgX3gyLCBfeDMpIHtcbiAgICByZXR1cm4gX3JlZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufSkoKTtcblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHsgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdmFyIGdlbiA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IGZ1bmN0aW9uIHN0ZXAoa2V5LCBhcmcpIHsgdHJ5IHsgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpOyB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlOyB9IGNhdGNoIChlcnJvcikgeyByZWplY3QoZXJyb3IpOyByZXR1cm47IH0gaWYgKGluZm8uZG9uZSkgeyByZXNvbHZlKHZhbHVlKTsgfSBlbHNlIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHsgc3RlcChcIm5leHRcIiwgdmFsdWUpOyB9LCBmdW5jdGlvbiAoZXJyKSB7IHN0ZXAoXCJ0aHJvd1wiLCBlcnIpOyB9KTsgfSB9IHJldHVybiBzdGVwKFwibmV4dFwiKTsgfSk7IH07IH1cblxubW9kdWxlLmV4cG9ydHMgPSB7IHNvbHZlOiBpdGVyYXRpdmVHcmVlZHlBbGdvcml0aG0gfTtcblxuZnVuY3Rpb24gZmxhdHRlbihhcnJheXMpIHtcbiAgcmV0dXJuIGFycmF5cy5yZWR1Y2UoKGExLCBhMikgPT4gYTEuY29uY2F0KGEyKSwgW10pO1xufSIsInZhciBidW5kbGVGbiA9IGFyZ3VtZW50c1szXTtcbnZhciBzb3VyY2VzID0gYXJndW1lbnRzWzRdO1xudmFyIGNhY2hlID0gYXJndW1lbnRzWzVdO1xuXG52YXIgc3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCBvcHRpb25zKSB7XG4gICAgdmFyIHdrZXk7XG4gICAgdmFyIGNhY2hlS2V5cyA9IE9iamVjdC5rZXlzKGNhY2hlKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2FjaGVLZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0gY2FjaGVLZXlzW2ldO1xuICAgICAgICB2YXIgZXhwID0gY2FjaGVba2V5XS5leHBvcnRzO1xuICAgICAgICAvLyBVc2luZyBiYWJlbCBhcyBhIHRyYW5zcGlsZXIgdG8gdXNlIGVzbW9kdWxlLCB0aGUgZXhwb3J0IHdpbGwgYWx3YXlzXG4gICAgICAgIC8vIGJlIGFuIG9iamVjdCB3aXRoIHRoZSBkZWZhdWx0IGV4cG9ydCBhcyBhIHByb3BlcnR5IG9mIGl0LiBUbyBlbnN1cmVcbiAgICAgICAgLy8gdGhlIGV4aXN0aW5nIGFwaSBhbmQgYmFiZWwgZXNtb2R1bGUgZXhwb3J0cyBhcmUgYm90aCBzdXBwb3J0ZWQgd2VcbiAgICAgICAgLy8gY2hlY2sgZm9yIGJvdGhcbiAgICAgICAgaWYgKGV4cCA9PT0gZm4gfHwgZXhwICYmIGV4cC5kZWZhdWx0ID09PSBmbikge1xuICAgICAgICAgICAgd2tleSA9IGtleTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF3a2V5KSB7XG4gICAgICAgIHdrZXkgPSBNYXRoLmZsb29yKE1hdGgucG93KDE2LCA4KSAqIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgdmFyIHdjYWNoZSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNhY2hlS2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBjYWNoZUtleXNbaV07XG4gICAgICAgICAgICB3Y2FjaGVba2V5XSA9IGtleTtcbiAgICAgICAgfVxuICAgICAgICBzb3VyY2VzW3drZXldID0gW1xuICAgICAgICAgICAgRnVuY3Rpb24oWydyZXF1aXJlJywnbW9kdWxlJywnZXhwb3J0cyddLCAnKCcgKyBmbiArICcpKHNlbGYpJyksXG4gICAgICAgICAgICB3Y2FjaGVcbiAgICAgICAgXTtcbiAgICB9XG4gICAgdmFyIHNrZXkgPSBNYXRoLmZsb29yKE1hdGgucG93KDE2LCA4KSAqIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKDE2KTtcblxuICAgIHZhciBzY2FjaGUgPSB7fTsgc2NhY2hlW3drZXldID0gd2tleTtcbiAgICBzb3VyY2VzW3NrZXldID0gW1xuICAgICAgICBGdW5jdGlvbihbJ3JlcXVpcmUnXSwgKFxuICAgICAgICAgICAgLy8gdHJ5IHRvIGNhbGwgZGVmYXVsdCBpZiBkZWZpbmVkIHRvIGFsc28gc3VwcG9ydCBiYWJlbCBlc21vZHVsZVxuICAgICAgICAgICAgLy8gZXhwb3J0c1xuICAgICAgICAgICAgJ3ZhciBmID0gcmVxdWlyZSgnICsgc3RyaW5naWZ5KHdrZXkpICsgJyk7JyArXG4gICAgICAgICAgICAnKGYuZGVmYXVsdCA/IGYuZGVmYXVsdCA6IGYpKHNlbGYpOydcbiAgICAgICAgKSksXG4gICAgICAgIHNjYWNoZVxuICAgIF07XG5cbiAgICB2YXIgd29ya2VyU291cmNlcyA9IHt9O1xuICAgIHJlc29sdmVTb3VyY2VzKHNrZXkpO1xuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZVNvdXJjZXMoa2V5KSB7XG4gICAgICAgIHdvcmtlclNvdXJjZXNba2V5XSA9IHRydWU7XG5cbiAgICAgICAgZm9yICh2YXIgZGVwUGF0aCBpbiBzb3VyY2VzW2tleV1bMV0pIHtcbiAgICAgICAgICAgIHZhciBkZXBLZXkgPSBzb3VyY2VzW2tleV1bMV1bZGVwUGF0aF07XG4gICAgICAgICAgICBpZiAoIXdvcmtlclNvdXJjZXNbZGVwS2V5XSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmVTb3VyY2VzKGRlcEtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc3JjID0gJygnICsgYnVuZGxlRm4gKyAnKSh7J1xuICAgICAgICArIE9iamVjdC5rZXlzKHdvcmtlclNvdXJjZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5naWZ5KGtleSkgKyAnOlsnXG4gICAgICAgICAgICAgICAgKyBzb3VyY2VzW2tleV1bMF1cbiAgICAgICAgICAgICAgICArICcsJyArIHN0cmluZ2lmeShzb3VyY2VzW2tleV1bMV0pICsgJ10nXG4gICAgICAgICAgICA7XG4gICAgICAgIH0pLmpvaW4oJywnKVxuICAgICAgICArICd9LHt9LFsnICsgc3RyaW5naWZ5KHNrZXkpICsgJ10pJ1xuICAgIDtcblxuICAgIHZhciBVUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkwgfHwgd2luZG93Lm1velVSTCB8fCB3aW5kb3cubXNVUkw7XG5cbiAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtzcmNdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuYmFyZSkgeyByZXR1cm4gYmxvYjsgfVxuICAgIHZhciB3b3JrZXJVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIHZhciB3b3JrZXIgPSBuZXcgV29ya2VyKHdvcmtlclVybCk7XG4gICAgd29ya2VyLm9iamVjdFVSTCA9IHdvcmtlclVybDtcbiAgICByZXR1cm4gd29ya2VyO1xufTtcbiIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHVwZGF0ZUF2YWlsYWJsZVNwYWNlLFxuICBwcm9tb3RlTGFiZWxUb1JlY3RhbmdsZSxcbiAgY29tcHV0ZUluaXRpYWxBdmFpbGFiZVNwYWNlcyxcbiAgcmVzZXRBdmFpbGFibGVTcGFjZSxcbiAgdXBkYXRlTWluaW1hLFxuICB0cmFuc2xhdGVMYWJlbFxufVxuXG5jb25zdCBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLmxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykucmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCBtdWx0aUludGVydmFsID0gcmVxdWlyZSgnLi9tdWx0aS1pbnRlcnZhbCcpLm11bHRpSW50ZXJ2YWxcbmNvbnN0IGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG4vKlxuIEFuIGV4dGVuZGVkIHBvaW50IG1heSBjb250YWluIHRoZSBmb2xsb3dpbmdcbiAgcmF5cyBhIGNvbGxlY3Rpb24gb2YgcmF5cyBzdGFydGluZyBmcm9tIHRoZSBwb2ludCBhcyB3ZWxsIGFzIHRoZSBpbnRlcnZhbHMgd2hlcmUgdGhleSBhcmUgYWxsb3dlZFxuICBsYWJlbCBpbiBjYXNlIHRoZSBsYWJlbCBpcyBub3QgeWV0IHNldHRsZWRcbiAgcmVjdGFuZ2xlIGluIGNhc2UgdGhlIGxhYmVsIGlzIHNldHRsZWRcbiAqL1xuZnVuY3Rpb24gdXBkYXRlQXZhaWxhYmxlU3BhY2UgKGV4dGVuZGVkUG9pbnQpIHtcbiAgdmFyIHJheXMgPSBleHRlbmRlZFBvaW50LnJheXNcbiAgdmFyIG1lYXN1cmUgPSAwXG4gIGZvciAobGV0IHJheSBvZiByYXlzKSB7XG4gICAgbGV0IHJheU1lYXN1cmUgPSByYXkuYXZhaWxhYmxlLm1lYXN1cmUoKVxuICAgIHJheS5hdmFpbGFibGVNZWFzdXJlID0gcmF5TWVhc3VyZVxuICAgIG1lYXN1cmUgKz0gcmF5TWVhc3VyZVxuICB9XG4gIGV4dGVuZGVkUG9pbnQuYXZhaWxhYmxlTWVhc3VyZSA9IG1lYXN1cmVcbn1cblxuZnVuY3Rpb24gY29tcHV0ZUluaXRpYWxBdmFpbGFiZVNwYWNlcyAoZXh0ZW5kZWRQb2ludHMsIHBhcmFtcykge1xuICBjb25zdCByYWRpdXMgPSBwYXJhbXMucmFkaXVzXG4gIGNvbnN0IGJib3ggPSBwYXJhbXMuYmJveFxuICBmb3IgKGxldCBwaSBvZiBleHRlbmRlZFBvaW50cykge1xuICAgIGZvciAobGV0IHJpaiBvZiBwaS5yYXlzKSB7XG4gICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlID0gbXVsdGlJbnRlcnZhbChbaW50ZXJ2YWwoMCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKV0pXG4gICAgICBmb3IgKGxldCBwayBvZiBleHRlbmRlZFBvaW50cykge1xuICAgICAgICBjb25zdCByZWN0YW5nbGUgPSB7dG9wOiBway5wb3NpdGlvbi55ICsgcmFkaXVzLCBib3R0b206IHBrLnBvc2l0aW9uLnkgLSByYWRpdXMsIGxlZnQ6IHBrLnBvc2l0aW9uLnggLSByYWRpdXMsIHJpZ2h0OiBway5wb3NpdGlvbi54ICsgcmFkaXVzLCB3aWR0aDogMiAqIHJhZGl1cywgaGVpZ2h0OiAyICogcmFkaXVzfVxuICAgICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlLnJlbW92ZShsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbihyZWN0YW5nbGUsIHBpLmxhYmVsLCByaWoudmVjdG9yLCBwaS5wb3NpdGlvbikpXG4gICAgICAgIGlmIChwaSAhPT0gcGspIHtcbiAgICAgICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlLnJlbW92ZShyYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocmVjdGFuZ2xlLCByaWoudmVjdG9yLCBwaS5wb3NpdGlvbikpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChiYm94KSB7XG4gICAgICAgIGNvbnN0IGxhYmVsQ29udGFpbmVkSW50ZXJ2YWwgPSBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbih7dG9wOiAtYmJveC50b3AgLSBwaS5sYWJlbC5oZWlnaHQsIGJvdHRvbTogLWJib3guYm90dG9tICsgcGkubGFiZWwuaGVpZ2h0LCBsZWZ0OiBiYm94LmxlZnQgKyBwaS5sYWJlbC53aWR0aCwgcmlnaHQ6IGJib3gucmlnaHQgLSBwaS5sYWJlbC53aWR0aCwgd2lkdGg6IGJib3gud2lkdGggLSAyICogcGkubGFiZWwud2lkdGgsIGhlaWdodDogYmJveC5oZWlnaHQgLSAyICogcGkubGFiZWwuaGVpZ2h0fSwgcGkubGFiZWwsIHJpai52ZWN0b3IsIHBpLnBvc2l0aW9uKVxuICAgICAgICAvLyBXYW50IGxhYmVscyBpbnNpZGUgb2YgdGhlIGdyYXBoXG4gICAgICAgIHJpai5pbml0aWFsbHlBdmFpbGFibGUucmVtb3ZlKGludGVydmFsKGxhYmVsQ29udGFpbmVkSW50ZXJ2YWwuZW5kLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpKVxuICAgICAgfVxuICAgICAgcmlqLmF2YWlsYWJsZSA9IHJpai5pbml0aWFsbHlBdmFpbGFibGUuY2xvbmUoKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZXNldEF2YWlsYWJsZVNwYWNlIChleHRlbmRlZFBvaW50KSB7XG4gIGZvciAobGV0IHJpaiBvZiBleHRlbmRlZFBvaW50LnJheXMpIHtcbiAgICByaWouYXZhaWxhYmxlID0gcmlqLmluaXRpYWxseUF2YWlsYWJsZS5jbG9uZSgpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlTWluaW1hIChleHRlbmRlZFBvaW50KSB7XG4gIHZhciByYXlzID0gZXh0ZW5kZWRQb2ludC5yYXlzXG4gIGZvciAobGV0IHJheSBvZiByYXlzKSB7XG4gICAgcmF5Lm1pbmltdW0gPSByYXkuYXZhaWxhYmxlLmdldE1pbigpXG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvbW90ZUxhYmVsVG9SZWN0YW5nbGUgKGV4dGVuZGVkUG9pbnQsIHZpKSB7XG4gIGV4dGVuZGVkUG9pbnQucmVjdGFuZ2xlID0gdHJhbnNsYXRlTGFiZWwoZXh0ZW5kZWRQb2ludCwgdmkpXG4gIGV4dGVuZGVkUG9pbnQuc2VnbWVudCA9IHt4OiB2aS54LCB5OiB2aS55fVxufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGVMYWJlbCAoZXh0ZW5kZWRQb2ludCwgdmkpIHtcbiAgY29uc3QgcG9pbnQgPSBleHRlbmRlZFBvaW50LnBvc2l0aW9uXG4gIGNvbnN0IGxhYmVsID0gZXh0ZW5kZWRQb2ludC5sYWJlbFxuICByZXR1cm4ge1xuICAgIGhlaWdodDogbGFiZWwuaGVpZ2h0LFxuICAgIHdpZHRoOiBsYWJlbC53aWR0aCxcbiAgICB0b3A6IHBvaW50LnkgKyB2aS55ICsgbGFiZWwuaGVpZ2h0IC8gMiArIGxhYmVsLm9mZnNldFksXG4gICAgYm90dG9tOiBwb2ludC55ICsgdmkueSAtIGxhYmVsLmhlaWdodCAvIDIgKyBsYWJlbC5vZmZzZXRZLFxuICAgIGxlZnQ6IHBvaW50LnggKyB2aS54IC0gbGFiZWwud2lkdGggLyAyICsgbGFiZWwub2Zmc2V0WCxcbiAgICByaWdodDogcG9pbnQueCArIHZpLnggKyBsYWJlbC53aWR0aCAvIDIgKyBsYWJlbC5vZmZzZXRYXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSB7ZmluZEJlc3RSYXl9XG5cbmNvbnN0IGV4dGVuZGVkUG9pbnRNZXRob2RzID0gcmVxdWlyZSgnLi9leHRlbmRlZC1wb2ludC1tZXRob2RzJylcbmNvbnN0IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykubGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb25cbmNvbnN0IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtc2VnbWVudC1pbnRlcnNlY3Rpb24nKS5sYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb25cbmNvbnN0IHJheVJlY3RhbmdsZUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKS5yYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb25cbmNvbnN0IHJheVNlZ21lbnRJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1zZWdtZW50LWludGVyc2VjdGlvbicpLnJheVNlZ21lbnRJbnRlcnNlY3Rpb25cbmNvbnN0IG11bHRpSW50ZXJ2YWwgPSByZXF1aXJlKCcuL211bHRpLWludGVydmFsJykubXVsdGlJbnRlcnZhbFxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuYXN5bmMgZnVuY3Rpb24gZmluZEJlc3RSYXkgKHBvaW50c1RvTGFiZWwsIHBvaW50c05vdFRvTGFiZWwpIHtcbiAgLy8gV2UgZm9sbG93IHRoZSBhcnRpY2xlIHBhZ2UgNCBBbGdvcml0aG0gMVxuICB2YXIgUCA9IHBvaW50c1RvTGFiZWxcbiAgdmFyIFAwID0gcG9pbnRzTm90VG9MYWJlbC5jb25jYXQocG9pbnRzVG9MYWJlbClcbiAgLy8gaW50IFAgbWluIGluIHRoZSBhcnRpY2xlXG4gIHZhciBtaW5pbXVtQXZhaWxhYmxlU3BhY2UgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcbiAgdmFyIHJiZXN0XG4gIHZhciBWYmVzdFxuICB2YXIgcGJlc3QgLy8gVGhpcyBpcyBub3QgaW4gdGhlIG9yaWdpbmFsIGFsZ29yaXRobSBidXQgYWxsb3dzIHRvIGVhc2lseSBmaW5kIHRoZSBjb3JyZXNwb25kaW5nIHBvaW50XG4gIFAwLmZvckVhY2gocCA9PiBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwKSlcbiAgUC5mb3JFYWNoKHAgPT4gZXh0ZW5kZWRQb2ludE1ldGhvZHMudXBkYXRlTWluaW1hKHApKVxuICBjb25zdCBwaSA9IFAucmVkdWNlKChpLCBqKSA9PiBpLmF2YWlsYWJsZU1lYXN1cmUgPCBqLmF2YWlsYWJsZU1lYXN1cmUgPyBpIDogailcbiAgbGV0IFIgPSBwaS5yYXlzLmZpbHRlcihyID0+IHIuYXZhaWxhYmxlTWVhc3VyZSA+IDApXG4gIHJpamxvb3A6IGZvciAobGV0IHJpaiBvZiBSKSB7XG4gICAgbGV0IFZpaiA9IFtdXG4gICAgbGV0IHNlZ21lbnQgPSB7eDogcmlqLnZlY3Rvci54ICogcmlqLm1pbmltdW0sIHk6IHJpai52ZWN0b3IueSAqIHJpai5taW5pbXVtfVxuICAgIGNvbnN0IHJlY3RhbmdsZSA9IGV4dGVuZGVkUG9pbnRNZXRob2RzLnRyYW5zbGF0ZUxhYmVsKHBpLCBzZWdtZW50KVxuICAgIGZvciAobGV0IHBrIG9mIFAwKSB7XG4gICAgICBpZiAocGsgPT09IHBpKSBjb250aW51ZVxuICAgICAgLy8gTm8gc2Vuc2UgdG8gd2FpdCBmb3IgdGhlIGludGVyc2VjdGlvbiBpZiByYmVzdCBpcyBkZWZpbmVkXG5cbiAgICAgIC8vIGludCBwa1xuICAgICAgbGV0IGF2YWlsYWJsZVNwYWNlID0gcGsuYXZhaWxhYmxlTWVhc3VyZVxuICAgICAgLy8gTm90IGRvaW5nIHRoZSBwcmVpbnRlcnNlY3Rpb24gaGVyZS4gU29tZXRoaW5nIGZpc2h5IGluIHRoZSBhcnRpY2xlLCBpZiBwcmVpbnRlcnNlY3QgaXMgZW1wdHkgdGhlbiAgaW50ZWdyYWwgcGstIGlzIDAgd2hpY2ggZG9lcyBub3QgbWFrZSBtdWNoIHNlbnNlXG4gICAgICBmb3IgKGxldCBya2wgb2YgcGsucmF5cykge1xuICAgICAgICBsZXQgbGFiZWxJbnRlcnNlY3Rpb25cbiAgICAgICAgbGV0IHNlZ21lbnRJbnRlcnNlY3Rpb25cbiAgICAgICAgLy8gV2UgaGF2ZSBzcGxpdCBsYWJlbCByZWN0YW5nbGUgaW50ZXJzZWN0aW9uIGludG8gdHdvIGFsZ29yaXRobXMsIGxhYmVsIHJlY3RhbmdsZSBhbmQgbGFiZWwgc2VnbWVudC4gVGhvc2UgdHdvIGludGVydmFscyBzaG91bGQgaW50ZXJzZWN0IHNpbmNlIHRoZSBzZWdtZW50IGludGVyc2VjdHMgdGhlIHJlY3RhbmdsZSwgc28gd2UgY2FuIGNvYWxlc2NlIHRoZSBpbnRlcnZhbHNcbiAgICAgICAgY29uc3QgbGFiZWxJbnRlcnZhbCA9IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHJlY3RhbmdsZSwgcGsubGFiZWwsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCBzZWdtZW50SW50ZXJ2YWwgPSBsYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb24ocGkucG9zaXRpb24sIHNlZ21lbnQsIHBrLmxhYmVsLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3QgcmF5SW50ZXJ2YWwgPSByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocmVjdGFuZ2xlLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3QgcmF5U2VnbWVudEludGVydmFsID0gcmF5U2VnbWVudEludGVyc2VjdGlvbihwaS5wb3NpdGlvbiwgc2VnbWVudCwgcGsucG9zaXRpb24sIHJrbC52ZWN0b3IpXG4gICAgICAgIGxhYmVsSW50ZXJzZWN0aW9uID0gbGFiZWxJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UocmF5SW50ZXJ2YWwpXG4gICAgICAgIHNlZ21lbnRJbnRlcnNlY3Rpb24gPSBzZWdtZW50SW50ZXJ2YWwuY29hbGVzY2VJblBsYWNlKHJheVNlZ21lbnRJbnRlcnZhbClcbiAgICAgICAgaWYgKCFsYWJlbEludGVyc2VjdGlvbi5lbXB0eSB8fCAhc2VnbWVudEludGVyc2VjdGlvbi5lbXB0eSkge1xuICAgICAgICAgIGF2YWlsYWJsZVNwYWNlIC09IHJrbC5hdmFpbGFibGUubWVhc3VyZU11bHRpcGxlSW50ZXJzZWN0aW9uKG11bHRpSW50ZXJ2YWwuY29hbGVzY2UobGFiZWxJbnRlcnNlY3Rpb24sIHNlZ21lbnRJbnRlcnNlY3Rpb24pKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBUaGlzIHJheSBpcyBub3QgZ29vZCBiZWNhdXNlIHdlIHRyeSB0byBtYXhpbWl6ZSB0aGUgbWluaW11bVxuICAgICAgaWYgKHJiZXN0ICYmIGF2YWlsYWJsZVNwYWNlIDwgbWluaW11bUF2YWlsYWJsZVNwYWNlKSB7XG4gICAgICAgIGNvbnRpbnVlIHJpamxvb3BcbiAgICAgIH1cbiAgICAgIFZpai5wdXNoKGF2YWlsYWJsZVNwYWNlKVxuICAgIH1cbiAgICBWaWouc29ydCgoaSwgaikgPT4gaSAtIGopIC8vIG9yZGVyIHRvIGNvbXBhcmUgaW4gbGV4aWNvZ3JhcGhpY2FsIG9yZGVyXG4gICAgaWYgKCFWYmVzdCB8fCB1dGlscy5jb21wYXJlQXJyYXlzTGV4aWNvZ3JhcGhpY2FsbHkoVmlqLCBWYmVzdCkgPCAwKSB7XG4gICAgICByYmVzdCA9IHJpalxuICAgICAgVmJlc3QgPSBWaWpcbiAgICAgIG1pbmltdW1BdmFpbGFibGVTcGFjZSA9IFZpai5yZWR1Y2UoKGksIGopID0+IE1hdGgubWluKGksIGopLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gICAgICBwYmVzdCA9IHBpXG4gICAgfVxuICB9XG4gIC8vIFdlIG5lZWQgdG8gcmV0dXJuIGludGVyc2VjdGlvbkRhdGEgYmVjYXVzZSB0aGUgcmVmZXJlbmNlIGhhcyBiZWVuIG5ldXRlcmVkIGluIGZpbmQgcmF5IGludGVyc2VjdGlvblxuICByZXR1cm4ge3JiZXN0OiByYmVzdCwgcGJlc3Q6IHBiZXN0fVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7aW50ZXJ2YWx9XG5mdW5jdGlvbiBJbnRlcnZhbCAoc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgLy8gY29uc29sZS5lcnJvcignV3Jvbmcgb3JkZXIgb2YgaW50ZXJ2YWwnLCBzdGFydCwgZW5kKVxuICAgIHRoaXMuZW1wdHkgPSB0cnVlXG4gICAgdGhpcy5zdGFydCA9IG51bGxcbiAgICB0aGlzLmVuZCA9IG51bGxcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIHRoaXMuc3RhcnQgPSBzdGFydFxuICB0aGlzLmVuZCA9IGVuZFxuICByZXR1cm4gdGhpc1xufVxuXG5JbnRlcnZhbC5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBJbnRlcnZhbCgxLCAtMSlcbn1cbkludGVydmFsLnByb3RvdHlwZS5pbnRlcnNlY3QgPSBmdW5jdGlvbiAoaW50ZXJ2YWwpIHtcbiAgaWYgKHRoaXMuZW1wdHkgfHwgaW50ZXJ2YWwuZW1wdHkpIHJldHVybiBJbnRlcnZhbC5lbXB0eSgpXG4gIHJldHVybiBuZXcgSW50ZXJ2YWwoTWF0aC5tYXgoaW50ZXJ2YWwuc3RhcnQsIHRoaXMuc3RhcnQpLCBNYXRoLm1pbihpbnRlcnZhbC5lbmQsIHRoaXMuZW5kKSlcbn1cblxuSW50ZXJ2YWwucHJvdG90eXBlLmNvYWxlc2NlID0gZnVuY3Rpb24gKGludGVydmFsKSB7XG4gIGlmICh0aGlzLmVtcHR5KSByZXR1cm4gaW50ZXJ2YWxcbiAgaWYgKGludGVydmFsLmVtcHR5KSByZXR1cm4gdGhpc1xuICBpZiAoaW50ZXJ2YWwuc3RhcnQgPiB0aGlzLmVuZCB8fCB0aGlzLnN0YXJ0ID4gaW50ZXJ2YWwuZW5kKSB7XG4gICAgLy8gV2UgcHJvYmFibHkgbmVlZCBhIG11bHRpIGludGVydmFsIGluIHRoaXMgY2FzZVxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNvYWxsZXNjZScpXG4gIH1cbiAgcmV0dXJuIG5ldyBJbnRlcnZhbChNYXRoLm1pbihpbnRlcnZhbC5zdGFydCwgdGhpcy5zdGFydCksIE1hdGgubWF4KGludGVydmFsLmVuZCwgdGhpcy5lbmQpKVxufVxuLy8gVE9ETyByZW1vdmUgY29hbGVzY2UgYW5kIHJlbmFtZSB0aGlzIG1ldGhvZCB0byBjb2FsZXNjZVxuLy8gbW9kaWZpZXMgaW50ZXJ2YWxcbkludGVydmFsLnByb3RvdHlwZS5jb2FsZXNjZUluUGxhY2UgPSBmdW5jdGlvbiAoaW50ZXJ2YWwpIHtcbiAgaWYgKHRoaXMuZW1wdHkpIHJldHVybiBpbnRlcnZhbFxuICBpZiAoaW50ZXJ2YWwuZW1wdHkpIHJldHVybiB0aGlzXG4gIGlmIChpbnRlcnZhbC5zdGFydCA+IHRoaXMuZW5kIHx8IHRoaXMuc3RhcnQgPiBpbnRlcnZhbC5lbmQpIHtcbiAgICAvLyBXZSBwcm9iYWJseSBuZWVkIGEgbXVsdGkgaW50ZXJ2YWwgaW4gdGhpcyBjYXNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY29hbGxlc2NlJylcbiAgfVxuICB0aGlzLnN0YXJ0ID0gTWF0aC5taW4oaW50ZXJ2YWwuc3RhcnQsIHRoaXMuc3RhcnQpXG4gIHRoaXMuZW5kID0gTWF0aC5tYXgoaW50ZXJ2YWwuZW5kLCB0aGlzLmVuZClcbiAgcmV0dXJuIHRoaXNcbn1cbkludGVydmFsLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuZW1wdHkpIHJldHVybiBJbnRlcnZhbC5lbXB0eSgpXG4gIHJldHVybiBuZXcgSW50ZXJ2YWwodGhpcy5zdGFydCwgdGhpcy5lbmQpXG59XG5JbnRlcnZhbC5wcm90b3R5cGUubWVhc3VyZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuZW1wdHkpIHJldHVybiAwXG4gIHJldHVybiBNYXRoLnBvdygyLCAtdGhpcy5zdGFydCkgLSBNYXRoLnBvdygyLCAtdGhpcy5lbmQpXG59XG5mdW5jdGlvbiBpbnRlcnZhbChzdGFydCwgZW5kKSB7XG4gIHJldHVybiBuZXcgSW50ZXJ2YWwoc3RhcnQsIGVuZClcbn1cbmludGVydmFsLmVtcHR5ID0gSW50ZXJ2YWwuZW1wdHkiLCIndXNlIHN0cmljdCdcbnZhciBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxubW9kdWxlLmV4cG9ydHMgPSB7bGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb259XG5cbi8qIFJlY3RhbmdsZSBsayBpbnRlcnNlY3RzIGxhYmVsIGxpIG1vdmluZyBmcm9tIHBpIHdpdGggdmVjdG9yIHZpIGluIHBvc2l0aXZlIHRpbWUgKi9cbi8vIENvbXBhcmUgY2VudGVycyBvZiB0aGUgbGFiZWxzIHRoZXkgbXVzdCBiZSB3aXRoaW4gbGkuaGVpZ2h0IC8gMiArIGxrLmhlaWdodCAvIDIgaW4gdGhlIHZlcnRpY2FsIHZhcmlhYmxlIGFuZCBsaS53aWR0aCAvIDIgKyBsay53aWR0aCAvIDIgaW4gdGhlIGhvcml6b250YWwgdmFyaWFibGUsIGkuZSBzb2x2ZSB8bGsueCAtIChway54ICsgdCAqIHYueCl8IDwgZFxuZnVuY3Rpb24gbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24gKGxrLCBsaSwgdmksIHBpKSB7XG4gIGxldCBtaW4gPSAwXG4gIGxldCBtYXggPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcbiAgaWYgKHZpLnkgIT09IDApIHtcbiAgICBjb25zdCBmaXJzdEludGVyc2VjdGlvbiA9IChsay5oZWlnaHQgLyAyICsgbGkuaGVpZ2h0IC8gMiAtIGxpLm9mZnNldFkgKyAobGsudG9wICsgbGsuYm90dG9tKSAvIDIgLSBwaS55KSAvIHZpLnlcbiAgICBjb25zdCBzZWNvbmRJbnRlcnNlY3Rpb24gPSAoLWxrLmhlaWdodCAvIDIgLSBsaS5oZWlnaHQgLyAyIC0gbGkub2Zmc2V0WSArIChsay50b3AgKyBsay5ib3R0b20pIC8gMiAtIHBpLnkpIC8gdmkueVxuICAgIC8vIE11bHRpcGx5aW5nIGJ5IGEgbmVnYXRpdmUgc2lnbiByZXZlcnNlcyBhbiBpbmVxdWFsaXR5XG4gICAgaWYgKHZpLnkgPiAwKSB7XG4gICAgICBtYXggPSBNYXRoLm1pbihtYXgsIGZpcnN0SW50ZXJzZWN0aW9uKVxuICAgICAgbWluID0gTWF0aC5tYXgobWluLCBzZWNvbmRJbnRlcnNlY3Rpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIG1pbiA9IE1hdGgubWF4KG1pbiwgZmlyc3RJbnRlcnNlY3Rpb24pXG4gICAgICBtYXggPSBNYXRoLm1pbihtYXgsIHNlY29uZEludGVyc2VjdGlvbilcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gdmVjdG9yIGlzIHZlcnRpY2FsIGFuZCB0aGV5IHdpbGwgbmV2ZXIgaW50ZXJzZWN0XG4gICAgaWYgKGxpLm9mZnNldFkgKyBwaS55IC0gKGxrLnRvcCArIGxrLmJvdHRvbSkgLyAyID4gbGsuaGVpZ2h0IC8gMiArIGxpLmhlaWdodCAvIDIpIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gICAgaWYgKGxpLm9mZnNldFkgKyBwaS55IC0gKGxrLnRvcCArIGxrLmJvdHRvbSkgLyAyIDwgLWxrLmhlaWdodCAvIDIgLSBsaS5oZWlnaHQgLyAyKSByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICB9XG4gIGlmICh2aS54ICE9PSAwKSB7XG4gICAgY29uc3QgdGhpcmRJbnRlcnNlY3Rpb24gPSAobGsud2lkdGggLyAyICsgbGkud2lkdGggLyAyICsgKGxrLnJpZ2h0ICsgbGsubGVmdCkgLyAyIC0gcGkueCAtIGxpLm9mZnNldFgpIC8gdmkueFxuICAgIGNvbnN0IGZvdXJ0aEludGVyc2VjdGlvbiA9ICgtbGsud2lkdGggLyAyIC0gbGkud2lkdGggLyAyICsgKGxrLnJpZ2h0ICsgbGsubGVmdCkgLyAyIC0gcGkueCAtIGxpLm9mZnNldFgpIC8gdmkueFxuICAgIGlmICh2aS54ID4gMCkge1xuICAgICAgbWF4ID0gTWF0aC5taW4obWF4LCB0aGlyZEludGVyc2VjdGlvbilcbiAgICAgIG1pbiA9IE1hdGgubWF4KG1pbiwgZm91cnRoSW50ZXJzZWN0aW9uKVxuICAgIH0gZWxzZSB7XG4gICAgICBtaW4gPSBNYXRoLm1heChtaW4sIHRoaXJkSW50ZXJzZWN0aW9uKVxuICAgICAgbWF4ID0gTWF0aC5taW4obWF4LCBmb3VydGhJbnRlcnNlY3Rpb24pXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChwaS54ICsgbGkub2Zmc2V0WCAtIChsay5yaWdodCArIGxrLmxlZnQpIC8gMiA+IGxrLndpZHRoIC8gMiArIGxpLndpZHRoIC8gMikgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgICBpZiAocGkueCArIGxpLm9mZnNldFggLSAobGsucmlnaHQgKyBsay5sZWZ0KSAvIDIgPCAtbGsud2lkdGggLyAyIC0gbGkud2lkdGggLyAyKSByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICB9XG5cbiAgLy8gT25seSBpbnRlcmVzdGVkIGluIHBvc2l0aXZlIHZhbHVlc1xuICByZXR1cm4gaW50ZXJ2YWwobWluLCBtYXgpXG59XG4iLCIndXNlIHN0cmljdCdcbi8vIEZpbmQgaW50ZXJ2YWwgaW4gd2hpY2ggYW4gaW50ZXJ2YWwgYW5kIGEgc2VnbWVudCBpbnRlcnNlY3Rcbm1vZHVsZS5leHBvcnRzID0ge2xhYmVsU2VnbWVudEludGVyc2VjdGlvbn1cblxudmFyIHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9zZWdtZW50LXNlZ21lbnQtaW50ZXJzZWN0aW9uJykuc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb25cbnZhciBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuXG4vLyBMYWJlbCBsaSBtb3ZlcyB3aXRoIHZlY3RvciB2aS4gV2UgZmluZCB0aGUgaW50ZXJ2YWwgYXQgd2hpY2ggaXQgaW50ZXJzZWN0cyB0aGUgc2VnbWVudCBwaywgdmsuIElmIHBrIGlzIGNvbnRhaW5lZCB0aGVuIHRoZSBpbnRlcnZhbCBnb2VzIHRvIElORklOSVRZXG5mdW5jdGlvbiBsYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb24gKHBrLCB2aywgbGksIHZpLCBwaSkge1xuICAvLyB0cmFuc2xhdGUgc28gd2UgY2FuIGFzc3VtZSB0aGF0IHBvaW50IGlzIGluIHRoZSBjZW50cmVcbiAgcGsgPSB7eDogcGsueCAtIHBpLnggLSBsaS5vZmZzZXRYLCB5OiBway55IC0gcGkueSAtIGxpLm9mZnNldFl9XG4gIC8vIFRPRE8gaGFuZGxlIHBhcmFsbGVsIGxpbmVzXG4gIC8vIFRoZSB0aW1lIGludGVydmFsIHdoZXJlIHRoZXkgbWVldCBpcyBjb25uZWN0ZWQgc28gaXQgaXMgZW5vdWdoIHRvIGZpbmQgdGhlIGVuZCBwb2ludHMuIFRoaXMgbXVzdCBvY2N1ciB3aGVuIGVpdGhlciB0aGUgY29ybmVycyBvZiB0aGUgbGFiZWwgaW50ZXJzZWN0IG9yIHdoZW5cbiAgY29uc3QgaW50ZXJzZWN0aW9ucyA9IFtdXG4gIC8vIHRoZSBlbmQgcG9pbnRzIG9mIHRoZSBzZWdtZW50IGludGVyc2VjdFxuICBmb3IgKGxldCB4IG9mIFstbGkud2lkdGggLyAyLCBsaS53aWR0aCAvIDJdKSB7XG4gICAgZm9yIChsZXQgeSBvZiBbLWxpLmhlaWdodCAvIDIsIGxpLmhlaWdodCAvIDJdKSB7XG4gICAgICBsZXQgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24oe3gsIHl9LCB2aSwgcGssIHZrKVxuICAgICAgLy8gSW50ZXJzZWN0cyBpbnNpZGUgdGhlIHNlZ21lbnRcbiAgICAgIGlmIChpbnRlcnNlY3Rpb24gJiYgaW50ZXJzZWN0aW9uLnMgPj0gMCAmJiBpbnRlcnNlY3Rpb24ucyA8PSAxKSB7XG4gICAgICAgIGludGVyc2VjdGlvbnMucHVzaChpbnRlcnNlY3Rpb24udClcbiAgICAgIH1cblxuICAgICAgLy8gR2l2ZW4gYSBwb2ludCB0byB3ZSB0YWtlIHRoZSBzaWRlIGNvbWluZyBmcm9tIGl0IGluIGNvdW50ZXIgY2xvY2t3aXNlXG4gICAgICBsZXQgc2lkZVxuICAgICAgaWYgKHggKiB5IDwgMCkge1xuICAgICAgICBzaWRlID0ge3g6IDAsIHk6IC0yICogeX1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpZGUgPSB7eDogLTIgKiB4LCB5OiAwfVxuICAgICAgfVxuICAgICAgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24oe3gsIHl9LCBzaWRlLCBwaywgdmkpXG4gICAgICBpZiAoaW50ZXJzZWN0aW9uICYmIGludGVyc2VjdGlvbi50ID49IDAgJiYgaW50ZXJzZWN0aW9uLnQgPD0gMSkge1xuICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goLWludGVyc2VjdGlvbi5zKVxuICAgICAgICAvLy8vIFRoZSBzaWRlIGNvdmVycyB0aGUgcG9pbnQgaW4gdGhlIGZ1dHVyZVxuICAgICAgICAvL2lmIChpbnRlcnNlY3Rpb24ucyA8IDApIHtcbiAgICAgICAgLy8gIGludGVyc2VjdGlvbnMucHVzaChOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gICAgICAgIC8vfVxuICAgICAgfVxuICAgICAgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24oe3gsIHl9LCBzaWRlLCB7eDogcGsueCArIHZrLngsIHk6IHBrLnkgKyB2ay55fSwgdmkpXG4gICAgICBpZiAoaW50ZXJzZWN0aW9uICYmIGludGVyc2VjdGlvbi50ID49IDAgJiYgaW50ZXJzZWN0aW9uLnQgPD0gMSkge1xuICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goLWludGVyc2VjdGlvbi5zKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICB2YXIgbWluID0gaW50ZXJzZWN0aW9ucy5yZWR1Y2UoKGEsIGIpID0+IE1hdGgubWluKGEsIGIpLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gIHZhciBtYXggPSBpbnRlcnNlY3Rpb25zLnJlZHVjZSgoYSwgYikgPT4gTWF0aC5tYXgoYSwgYiksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSlcbiAgbWluID0gTWF0aC5tYXgobWluLCAwKVxuICByZXR1cm4gaW50ZXJ2YWwobWluLCBtYXgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHttYWluQWxnb3JpdGhtfVxuY29uc3Qgd29yayA9IHJlcXVpcmUoJ3dlYndvcmtpZnknKVxuY29uc3QgYWxnb3JpdGhtID0gd29yayhyZXF1aXJlKCcuL21haW4tYWxnb3JpdGhtLmpzJykpXG5jb25zdCBwcm9taXNlUmVzb2x1dGlvbnMgPSB7fVxuZnVuY3Rpb24gbWFpbkFsZ29yaXRobSAoZXh0ZW5kZWRQb2ludHMsIHBhcmFtcyA9IHt9KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgZXh0ZW5kZWRQb2ludHMgPSBleHRlbmRlZFBvaW50cy5tYXAocCA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogcC5pZCxcbiAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICB4OiBwLnBvc2l0aW9uLngsXG4gICAgICAgICAgeTogLXAucG9zaXRpb24ueSAvLyBUaGUgYWxnb3JpdGhtIGV4cGVjdHMgeSB0byBncm93IHVwd2FyZHNcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICBoZWlnaHQ6IHAubGFiZWwuaGVpZ2h0LFxuICAgICAgICAgIHdpZHRoOiBwLmxhYmVsLndpZHRoLFxuICAgICAgICAgIG9mZnNldFg6IHAubGFiZWwub2Zmc2V0WCB8fCAwLFxuICAgICAgICAgIG9mZnNldFk6IHAubGFiZWwub2Zmc2V0WSB8fCAwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIGNvbnN0IHByb2Nlc3NVVUlEID0gcGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApLnRvU3RyaW5nKCkgLy8gbm8gbmVlZCBmb3IgYW55dGhpbmcgZmFuY3lcbiAgICBhbGdvcml0aG0ucG9zdE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogJ3N0YXJ0JyxcbiAgICAgIGV4dGVuZGVkUG9pbnRzLFxuICAgICAgcGFyYW1zLFxuICAgICAgcHJvY2Vzc1VVSURcbiAgICB9KVxuICAgIHByb21pc2VSZXNvbHV0aW9uc1twcm9jZXNzVVVJRF0gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGV2ZW50LmRhdGEucmVzdWx0Lm1hcChwID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogcC5pZCxcbiAgICAgICAgICByZWN0YW5nbGU6IHtcbiAgICAgICAgICAgIGxlZnQ6IHAucmVjdGFuZ2xlLmxlZnQsXG4gICAgICAgICAgICByaWdodDogcC5yZWN0YW5nbGUucmlnaHQsXG4gICAgICAgICAgICB0b3A6IC1wLnJlY3RhbmdsZS50b3AsXG4gICAgICAgICAgICBib3R0b206IC1wLnJlY3RhbmdsZS5ib3R0b21cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICByZXR1cm4gcmVzb2x2ZShyZXN1bHQpXG4gICAgfVxuICB9KVxufVxuYWxnb3JpdGhtLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YVxuICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgIGNhc2UgJ2VuZCc6XG4gICAgICBlbmRFdmVudChldmVudClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoaXMgZXZlbnQgY2FzZSBzaG91bGQgbm90IGhhcHBlbicsIGRhdGEudHlwZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmRFdmVudCAoZXZlbnQpIHtcbiAgY29uc3Qge3Byb2Nlc3NVVUlEfSA9IGV2ZW50LmRhdGFcbiAgY29uc3QgY2FsbGJhY2sgPSBwcm9taXNlUmVzb2x1dGlvbnNbcHJvY2Vzc1VVSURdXG4gIGNhbGxiYWNrKGV2ZW50KVxuICBkZWxldGUgcHJvbWlzZVJlc29sdXRpb25zW3Byb2Nlc3NVVUlEXVxufSIsImxldCBOVU1CRVJfT0ZfUkFZU1xuLy8gQ2FsbGVkIGFzIHdlYndvcmtlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2VsZikge1xuICBjb25zdCBleHRlbmRlZFBvaW50TWV0aG9kcyA9IHJlcXVpcmUoJy4vZXh0ZW5kZWQtcG9pbnQtbWV0aG9kcycpXG4gIGNvbnN0IHJheUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LWludGVyc2VjdGlvbicpLnJheUludGVyc2VjdGlvblxuICBjb25zdCBpdGVyYXRpdmVHcmVlZHkgPSByZXF1aXJlKCdpdGVyYXRpdmUtZ3JlZWR5JylcbiAgaWYgKHR5cGVvZiBwb3N0TWVzc2FnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzZWxmLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGRhdGEgPSBldmVudC5kYXRhXG4gICAgICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgbGF1bmNoTWFpbkFsZ29yaXRobUZyb21FdmVudChldmVudClcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBhIHZhbGlkIGV2ZW50IHR5cGUnLCBkYXRhLnR5cGUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbGF1bmNoTWFpbkFsZ29yaXRobUZyb21FdmVudCAoZXZlbnQpIHtcbiAgICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YVxuICAgIGNvbnN0IGV4dGVuZGVkUG9pbnRzID0gZGF0YS5leHRlbmRlZFBvaW50c1xuICAgIGNvbnN0IHBhcmFtcyA9IGRhdGEucGFyYW1zXG4gICAgY29uc3QgcHJvY2Vzc1VVSUQgPSBkYXRhLnByb2Nlc3NVVUlEIC8vIHdlIHVzZSB0aGlzIGluIGNhc2UgdGhlIGFsZ29yaWhtIGlzIHJlcXVpcmVkIHNldmVyYWwgdGltZXNcbiAgICBtYWluQWxnb3JpdGhtKGV4dGVuZGVkUG9pbnRzLCBwYXJhbXMpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnZW5kJyxcbiAgICAgICAgICBwcm9jZXNzVVVJRCxcbiAgICAgICAgICByZXN1bHRcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBtYWluQWxnb3JpdGhtIChleHRlbmRlZFBvaW50cywgcGFyYW1zID0ge30pIHtcbiAgICBOVU1CRVJfT0ZfUkFZUyA9ICh0eXBlb2YgcGFyYW1zLk5VTUJFUl9PRl9SQVlTID09PSAnbnVtYmVyJykgPyBwYXJhbXMuTlVNQkVSX09GX1JBWVMgOiAzXG4gICAgY29uc3QgTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TID0gKHR5cGVvZiBwYXJhbXMuTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TID09PSAnbnVtYmVyJykgPyBwYXJhbXMuTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TIDogMVxuICAgIGNvbXB1dGVSYXlzKGV4dGVuZGVkUG9pbnRzKVxuICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLmNvbXB1dGVJbml0aWFsQXZhaWxhYmVTcGFjZXMoZXh0ZW5kZWRQb2ludHMsIHtyYWRpdXM6IHBhcmFtcy5yYWRpdXMgfHwgMiwgYmJveDogcGFyYW1zLmJib3h9KVxuICAgIGV4dGVuZGVkUG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcbiAgICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnJlc2V0QXZhaWxhYmxlU3BhY2UocClcbiAgICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnVwZGF0ZUF2YWlsYWJsZVNwYWNlKHApXG4gICAgfSlcbiAgICBjb25zdCBwb3NzaWJsZVBvaW50cyA9IGV4dGVuZGVkUG9pbnRzLmZpbHRlcihwID0+IHAuYXZhaWxhYmxlTWVhc3VyZSA+IDApXG4gICAgcmV0dXJuIGl0ZXJhdGl2ZUdyZWVkeS5zb2x2ZShyYXlJbnRlcnNlY3Rpb24sIHBvc3NpYmxlUG9pbnRzLCByZXNldEZ1bmN0aW9uLCB7c2VyaWFsaXplRnVuY3Rpb24sIE1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OU30pXG4gIH1cblxuICBmdW5jdGlvbiBjb21wdXRlUmF5cyAoZXh0ZW5kZWRQb2ludHMpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4dGVuZGVkUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgcGkgPSBleHRlbmRlZFBvaW50c1tpXVxuICAgICAgcGkucmF5cyA9IFtdXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IE5VTUJFUl9PRl9SQVlTOyBqKyspIHtcbiAgICAgICAgcGkucmF5cy5wdXNoKHtcbiAgICAgICAgICBpbmRleDogaSAqIE5VTUJFUl9PRl9SQVlTICogTlVNQkVSX09GX1JBWVMgKiA0ICsgaiAqIE5VTUJFUl9PRl9SQVlTICogNCxcbiAgICAgICAgICBzZWxmSW5kZXg6IGosXG4gICAgICAgICAgdmVjdG9yOiB7XG4gICAgICAgICAgICB4OiBNYXRoLnNpbigyICogTWF0aC5QSSAqIGogLyBOVU1CRVJfT0ZfUkFZUyksXG4gICAgICAgICAgICB5OiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGogLyBOVU1CRVJfT0ZfUkFZUylcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbi8vIEF0IGVhY2ggaXRlcmF0aW9uIG9mIGl0ZXJhdGl2ZSBncmVlZHkgaWYgdGhlIHNvbHV0aW9uIGlzIGJldHRlciB3ZSBzZXJpYWxpemUgd2hhdCB3ZSBvYnRhaW5lZFxuICBmdW5jdGlvbiBzZXJpYWxpemVGdW5jdGlvbiAoYXJyYXlPZlBvaW50cykge1xuICAgIC8vIFdoZW4gd2UgbGFiZWwgYSBwb2ludCB3ZSBwcm9tb3RlIGxhYmVsIHRvIHJlY3RhbmdsZSBhbmQgd2UgcmVzZXQgaXQgYXQgZWFjaCBpdGVyYXRpb25cbiAgICBjb25zdCBsYWJlbGVkUG9pbnRzID0gYXJyYXlPZlBvaW50cy5maWx0ZXIocG9pbnQgPT4gISFwb2ludC5yZWN0YW5nbGUpXG4gICAgLy8gVG8gc2VyaWFsaXplIHdlIG5lZWQgYW4gaWRcbiAgICByZXR1cm4gbGFiZWxlZFBvaW50cy5tYXAocG9pbnQgPT4geyByZXR1cm4ge2lkOiBwb2ludC5pZCwgcmVjdGFuZ2xlOiBPYmplY3QuYXNzaWduKHt9LCBwb2ludC5yZWN0YW5nbGUpfSB9KVxuICB9XG5cbi8vIEF0IGVhY2ggaXRlcmF0aW9uIG9mIGl0ZXJhdGl2ZSBncmVlZHkgd2UgcmVzZXQgdGhlIGNvbmRpdGlvbnNcbiAgZnVuY3Rpb24gcmVzZXRGdW5jdGlvbiAoZ2VuZXJhbGl6ZWRQb2ludCkge1xuICAgIGdlbmVyYWxpemVkUG9pbnQucmVjdGFuZ2xlID0gbnVsbFxuICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnJlc2V0QXZhaWxhYmxlU3BhY2UoZ2VuZXJhbGl6ZWRQb2ludClcbiAgfVxufVxuXG4iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge211bHRpSW50ZXJ2YWx9XG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbi8vIERpc2pvaW50IHVuaW9uIG9mIHNldmVyYWwgaW50ZXJ2YWxzXG4vLyBpbnRlcnZhbHMgYXJyYXkgb2YgY29vcmRpbmF0ZXNcbmZ1bmN0aW9uIE11bHRpSW50ZXJ2YWwgKGludGVydmFscywgaXNDbG9uZSkge1xuICAvLyBOb3QgdmVyeSBuaWNlIGJ1dCBpdCBpcyBoYXJkIHRvIGNsb25lIGluIGpzXG4gIGlmIChpc0Nsb25lKSB7XG4gICAgdGhpcy5pbnRlcnZhbHMgPSBbLi4uaW50ZXJ2YWxzXVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgaWYgKCFBcnJheS5pc0FycmF5KGludGVydmFscykgfHwgaW50ZXJ2YWxzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMuaW50ZXJ2YWxzID0gW11cbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIHRoaXMuaW50ZXJ2YWxzID0gW11cbiAgdmFyIGNoZWNrZWRJbnRlcnZhbHMgPSBbXVxuICAvLyBTbyB3ZSBjYW4gY2hlY2sgaW50ZXJ2YWxcbiAgdmFyIGludGVydmFsQ29uc3RydWN0b3IgPSBpbnRlcnZhbCgwLCAxKS5jb25zdHJ1Y3RvclxuICBmb3IgKGxldCBteUludGVydmFsIG9mIGludGVydmFscykge1xuICAgIGlmICghbXlJbnRlcnZhbCBpbnN0YW5jZW9mIGludGVydmFsQ29uc3RydWN0b3IpIHtcbiAgICAgIHRoaXMuaW50ZXJ2YWxzID0gW11cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICAgIGlmICghbXlJbnRlcnZhbC5lbXB0eSkge1xuICAgICAgY2hlY2tlZEludGVydmFscy5wdXNoKG15SW50ZXJ2YWwuY2xvbmUoKSlcbiAgICB9XG4gIH1cblxuICBjaGVja2VkSW50ZXJ2YWxzLnNvcnQoKGkxLCBpMikgPT4gaTEuc3RhcnQgLSBpMi5zdGFydClcblxuICAvLyBOb3cgd2UgbmVlZCB0byBjb2FsZXNjZSBpbnRlcnZhbHMgaWYgbmVlZGVkXG4gIGxldCBuZXh0SW50ZXJ2YWwgPSBudWxsXG4gIGZvciAobGV0IG15SW50ZXJ2YWwgb2YgY2hlY2tlZEludGVydmFscykge1xuICAgIGlmIChuZXh0SW50ZXJ2YWwgPT09IG51bGwpIHtcbiAgICAgIG5leHRJbnRlcnZhbCA9IG15SW50ZXJ2YWxcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFuZXh0SW50ZXJ2YWwuaW50ZXJzZWN0KG15SW50ZXJ2YWwpLmVtcHR5KSB7XG4gICAgICAgIG5leHRJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UobXlJbnRlcnZhbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWxzLnB1c2gobmV4dEludGVydmFsLnN0YXJ0LCBuZXh0SW50ZXJ2YWwuZW5kKVxuICAgICAgICBuZXh0SW50ZXJ2YWwgPSBteUludGVydmFsXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChuZXh0SW50ZXJ2YWwpIHtcbiAgICB0aGlzLmludGVydmFscy5wdXNoKG5leHRJbnRlcnZhbC5zdGFydCwgbmV4dEludGVydmFsLmVuZClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuTXVsdGlJbnRlcnZhbC5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBNdWx0aUludGVydmFsKFtdKVxufVxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICF0aGlzLmludGVydmFscy5sZW5ndGhcbn1cblxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUuaW50ZXJ2YWxDb25zdHJ1Y3RvciA9IGludGVydmFsKDAsIDEpLmNvbnN0cnVjdG9yXG5cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IE11bHRpSW50ZXJ2YWwodGhpcy5pbnRlcnZhbHMsIHRydWUpXG59XG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAobXlJbnRlcnZhbCkge1xuICBpZiAoIW15SW50ZXJ2YWwgaW5zdGFuY2VvZiB0aGlzLmludGVydmFsQ29uc3RydWN0b3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhbiBpbnRlcnZhbCcpXG4gIH1cbiAgaWYgKHRoaXMuaXNFbXB0eSgpIHx8IG15SW50ZXJ2YWwuZW1wdHkpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIF9yZW1vdmUodGhpcy5pbnRlcnZhbHMsIG15SW50ZXJ2YWwuc3RhcnQsIG15SW50ZXJ2YWwuZW5kKVxuICByZXR1cm4gdGhpc1xufVxuLy8gUmVtb3ZlcyBpbiBwbGFjZVxuZnVuY3Rpb24gX3JlbW92ZShpbnRlcnZhbHMsIG15U3RhcnQsIG15RW5kKSB7XG4gIGxldCBpID0gMFxuICB3aGlsZSAoaSA8IGludGVydmFscy5sZW5ndGgpIHtcbiAgICBjb25zdCBpbnRlcnZhbFN0YXJ0ID0gaW50ZXJ2YWxzW2ldXG4gICAgY29uc3QgaW50ZXJ2YWxFbmQgPSBpbnRlcnZhbHNbaSArIDFdXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlFbmQpIHtcbiAgICAgIGJyZWFrIC8vIG5vIG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIC8vIG5vIGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbEVuZCA8PSBteVN0YXJ0KSB7XG4gICAgICBpICs9IDJcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGZ1bGwgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlTdGFydCAmJiBpbnRlcnZhbEVuZCA8PSBteUVuZCkge1xuICAgICAgaW50ZXJ2YWxzLnNwbGljZShpLCAyKVxuICAgICAgLy8gaSBkb2VzIG5vdCBncm93IHdlIGRlY3JlYXNlIGxlbmd0aFxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gbGVmdCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxTdGFydCA+PSBteVN0YXJ0ICYmIGludGVydmFsRW5kID4gbXlFbmQpIHtcbiAgICAgIGludGVydmFsc1tpXSA9IG15RW5kXG4gICAgICBicmVhayAvLyBUaGVyZSB3b24ndCBiZSBhbnkgbW9yZSBpbnRlcnNlY3Rpb25cbiAgICB9XG4gICAgLy8gcmlnaHQgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsRW5kIDw9IG15RW5kICYmIGludGVydmFsU3RhcnQgPCBteVN0YXJ0KSB7XG4gICAgICBpbnRlcnZhbHNbaSArIDFdID0gbXlTdGFydFxuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBpbnRlcnNlY3RzIGluIHRoZSBtaWRkbGVcbiAgICBpZiAoaW50ZXJ2YWxFbmQgPiBteUVuZCAmJiBpbnRlcnZhbFN0YXJ0IDwgbXlTdGFydCkge1xuICAgICAgaW50ZXJ2YWxzLnNwbGljZShpICsgMSwgMCwgbXlTdGFydCwgbXlFbmQpXG4gICAgICBicmVhayAvLyB0aGVyZSB3b24ndCBiZSBhbnkgbW9yZSBpbnRlcnNlY3Rpb25cbiAgICB9XG4gICAgY29uc29sZS5lcnJvcignVGhpcyBzaG91bGQgbm90IGhhcHBlbicsIG15U3RhcnQsIG15RW5kLCBpbnRlcnZhbFN0YXJ0LCBpbnRlcnZhbEVuZClcbiAgICBpICs9IDJcbiAgfVxuICByZXR1cm4gaW50ZXJ2YWxzXG59XG5cbi8vIEluIHBsYWNlXG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5tdWx0aXBsZVJlbW92ZSA9IGZ1bmN0aW9uIChteU11bHRpSW50ZXJ2YWwpIHtcbiAgaWYgKCFteU11bHRpSW50ZXJ2YWwgaW5zdGFuY2VvZiBNdWx0aUludGVydmFsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBtdWx0aSBpbnRlcnZhbCcpXG4gIH1cbiAgaWYgKHRoaXMuaXNFbXB0eSgpIHx8IG15TXVsdGlJbnRlcnZhbC5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbXlNdWx0aUludGVydmFsLmludGVydmFscy5sZW5ndGg7IGkgKz0gMikge1xuICAgIF9yZW1vdmUodGhpcy5pbnRlcnZhbHMsIG15TXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaV0sIG15TXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaSArIDFdKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbmZ1bmN0aW9uIF9tZWFzdXJlSW50ZXJzZWN0aW9uIChpbnRlcnZhbHMsIG15U3RhcnQsIG15RW5kKSB7XG4gIGxldCBpID0gMFxuICBsZXQgbWVhc3VyZSA9IDBcbiAgd2hpbGUgKGkgPCBpbnRlcnZhbHMubGVuZ3RoKSB7XG4gICAgY29uc3QgaW50ZXJ2YWxTdGFydCA9IGludGVydmFsc1tpXVxuICAgIGNvbnN0IGludGVydmFsRW5kID0gaW50ZXJ2YWxzW2kgKyAxXVxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15RW5kKSB7XG4gICAgICBicmVhayAvLyBubyBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICAvLyBubyBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxFbmQgPD0gbXlTdGFydCkge1xuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBmdWxsIGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15U3RhcnQgJiYgaW50ZXJ2YWxFbmQgPD0gbXlFbmQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShpbnRlcnZhbFN0YXJ0LCBpbnRlcnZhbEVuZClcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gbGVmdCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxTdGFydCA+PSBteVN0YXJ0ICYmIGludGVydmFsRW5kID4gbXlFbmQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShpbnRlcnZhbFN0YXJ0LCBteUVuZClcbiAgICAgIGJyZWFrIC8vIFRoZXJlIHdvbid0IGJlIGFueSBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICAvLyByaWdodCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxFbmQgPD0gbXlFbmQgJiYgaW50ZXJ2YWxTdGFydCA8IG15U3RhcnQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShteVN0YXJ0LCBpbnRlcnZhbEVuZClcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gaW50ZXJzZWN0cyBpbiB0aGUgbWlkZGxlXG4gICAgaWYgKGludGVydmFsRW5kID4gbXlFbmQgJiYgaW50ZXJ2YWxTdGFydCA8IG15U3RhcnQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShteVN0YXJ0LCBteUVuZClcbiAgICAgIGJyZWFrIC8vIHRoZXJlIHdvbid0IGJlIGFueSBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICBjb25zb2xlLmVycm9yKCdUaGlzIHNob3VsZCBub3QgaGFwcGVuJywgbXlTdGFydCwgbXlFbmQsIGludGVydmFsU3RhcnQsIGludGVydmFsRW5kKVxuICAgIGkgKz0gMlxuICB9XG4gIHJldHVybiBtZWFzdXJlXG59XG5cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLm1lYXN1cmVNdWx0aXBsZUludGVyc2VjdGlvbiA9IGZ1bmN0aW9uIChtdWx0aUludGVydmFsKSB7XG4gIGxldCBtZWFzdXJlID0gMFxuICBmb3IgKGxldCBpID0gMDsgaSA8IG11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgbWVhc3VyZSArPSBfbWVhc3VyZUludGVyc2VjdGlvbih0aGlzLmludGVydmFscywgbXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaV0sIG11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzW2krMV0pXG4gIH1cbiAgcmV0dXJuIG1lYXN1cmVcbn1cblxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUubWVhc3VyZSA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0IG1lYXN1cmUgPSAwXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnRlcnZhbHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBtZWFzdXJlICs9IHV0aWxzLm1lYXN1cmUodGhpcy5pbnRlcnZhbHNbaV0sIHRoaXMuaW50ZXJ2YWxzW2kgKyAxXSlcbiAgfVxuICByZXR1cm4gbWVhc3VyZVxufVxuXG4vLyBUT0RPIHRlc3Rcbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmdldE1pbiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuaXNFbXB0eSgpKSByZXR1cm4gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG4gIHJldHVybiB0aGlzLmludGVydmFsc1swXVxufVxuXG5tdWx0aUludGVydmFsLmNvYWxlc2NlID0gZnVuY3Rpb24gKGludGVydmFsLCBhbm90aGVySW50ZXJ2YWwpIHtcbiAgaWYgKGludGVydmFsLnN0YXJ0ID4gYW5vdGhlckludGVydmFsLmVuZCB8fCBhbm90aGVySW50ZXJ2YWwuc3RhcnQgPiBpbnRlcnZhbC5lbmQpIHtcbiAgICByZXR1cm4gbXVsdGlJbnRlcnZhbChbaW50ZXJ2YWwsIGFub3RoZXJJbnRlcnZhbF0pXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG11bHRpSW50ZXJ2YWwoW2ludGVydmFsLmNvYWxlc2NlKGFub3RoZXJJbnRlcnZhbCldKVxuICB9XG59XG5tdWx0aUludGVydmFsLmVtcHR5ID0gTXVsdGlJbnRlcnZhbC5lbXB0eVxuXG5mdW5jdGlvbiBtdWx0aUludGVydmFsIChpbnRlcnZhbHMpIHtcbiAgcmV0dXJuIG5ldyBNdWx0aUludGVydmFsKGludGVydmFscylcbn1cbiIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSB7cmF5SW50ZXJzZWN0aW9ufVxuXG5jb25zdCBmaW5kQmVzdFJheSA9IHJlcXVpcmUoJy4vZmluZC1iZXN0LXJheScpXG5jb25zdCBleHRlbmRlZFBvaW50TWV0aG9kcyA9IHJlcXVpcmUoJy4vZXh0ZW5kZWQtcG9pbnQtbWV0aG9kcycpXG5jb25zdCBtdWx0aUludGVydmFsID0gcmVxdWlyZSgnLi9tdWx0aS1pbnRlcnZhbCcpLm11bHRpSW50ZXJ2YWxcbi8vIEJldHRlciB0byBncmFiIHRoZSBtb2R1bGUgaGVyZSBhbmQgZmV0Y2ggdGhlIG1ldGhvZCBpbiB0aGUgYWxnb3JpdGhtLCB0aGF0IHdheSB3ZSBjYW4gc3R1YlxuY29uc3QgbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL2xhYmVsLXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKVxuY29uc3QgbGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1zZWdtZW50LWludGVyc2VjdGlvbicpXG5jb25zdCByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykucmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCByYXlTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktc2VnbWVudC1pbnRlcnNlY3Rpb24nKS5yYXlTZWdtZW50SW50ZXJzZWN0aW9uXG5cbi8vIFRPRE8gdXNlIHNldHNcbmFzeW5jIGZ1bmN0aW9uIHJheUludGVyc2VjdGlvbiAocG9pbnRzVG9MYWJlbCwgcG9pbnRzTm90VG9MYWJlbCkge1xuICBwb2ludHNUb0xhYmVsLmZvckVhY2gocD0+IGV4dGVuZGVkUG9pbnRNZXRob2RzLnVwZGF0ZUF2YWlsYWJsZVNwYWNlKHApKVxuICBjb25zdCByZWplY3RlZFBvaW50cyA9IHBvaW50c1RvTGFiZWwuZmlsdGVyKHAgPT4gcC5hdmFpbGFibGVNZWFzdXJlID09PSAwKVxuICAvLyBQIGluIHRoZSBhcnRpY2xlXG4gIHZhciByZW1haW5pbmdQb2ludHMgPSBwb2ludHNUb0xhYmVsLmZpbHRlcihwID0+IHAuYXZhaWxhYmxlTWVhc3VyZSA+IDApXG4gIHZhciBQMCA9IHBvaW50c1RvTGFiZWwuY29uY2F0KHBvaW50c05vdFRvTGFiZWwpXG4gIGNvbnN0IHBvaW50c0xhYmVsZWQgPSBbXSAvLyBIZXJlIHdlIGRpZmZlciBmcm9tIHRoZSBvcmlnaW5hbCBhcnRpY2xlLCBvbmNlIHdlIGZpbmQgYSBwb2ludCBpbiBQIHRvIGxhYmVsIHdlIHJlbW92ZSBpdCBmcm9tIFAgYW5kIGFkZCBpdCB0byBwb2ludHNMYWJlbGVkLCBvdGhlcndpc2UgdGhlIGFsZ29yaXRobSBkb2VzIG5vdCBmaW5pc2hcbiAgd2hpbGUgKHJlbWFpbmluZ1BvaW50cy5sZW5ndGggIT09IDApIHtcbiAgICBsZXQgYmVzdFJheSA9IGF3YWl0IGZpbmRCZXN0UmF5LmZpbmRCZXN0UmF5KHJlbWFpbmluZ1BvaW50cywgcG9pbnRzTm90VG9MYWJlbClcbiAgICBsZXQgcmlqID0gYmVzdFJheS5yYmVzdFxuICAgIGxldCBwaSA9IGJlc3RSYXkucGJlc3RcbiAgICBpZiAocmlqID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEl0IGNvdWxkIG9ubHkgaGFwcGVuIHRoYXQgd2UgZ2V0IHJpaiB1bmRlZmluZWQgaW4gdGhlIGZpcnN0IGl0ZXJhdGlvblxuICAgICAgaWYgKHBvaW50c0xhYmVsZWQubGVuZ3RoICE9PSAwIHx8IHJlamVjdGVkUG9pbnRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgYmVoYXZpb3VyJylcbiAgICAgIH1cbiAgICAgIHJldHVybiB7Y2hvc2VuOiBbXSwgcmVqZWN0ZWQ6IFsuLi5wb2ludHNUb0xhYmVsXX1cbiAgICB9XG4gICAgbGV0IHZpID0ge3g6IHJpai52ZWN0b3IueCAqIHJpai5hdmFpbGFibGUuZ2V0TWluKCksIHk6IHJpai52ZWN0b3IueSAqIHJpai5hdmFpbGFibGUuZ2V0TWluKCl9XG4gICAgZXh0ZW5kZWRQb2ludE1ldGhvZHMucHJvbW90ZUxhYmVsVG9SZWN0YW5nbGUocGksIHZpKVxuICAgIHJlbWFpbmluZ1BvaW50cyA9IHJlbWFpbmluZ1BvaW50cy5maWx0ZXIoZWwgPT4gZWwgIT09IHBpKVxuICAgIFAwID0gUDAuZmlsdGVyKGVsID0+IGVsICE9PSBwaSlcbiAgICBwb2ludHNMYWJlbGVkLnB1c2gocGkpXG4gICAgZm9yIChsZXQgcGsgb2YgUDApIHtcbiAgICAgIGZvciAobGV0IHJrbCBvZiBway5yYXlzKSB7XG4gICAgICAgIGxldCBsYWJlbEludGVyc2VjdGlvblxuICAgICAgICBsZXQgc2VnbWVudEludGVyc2VjdGlvblxuICAgICAgICBjb25zdCBsYWJlbEludGVydmFsID0gbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24ubGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocGkucmVjdGFuZ2xlLCBway5sYWJlbCwgcmtsLnZlY3RvciwgcGsucG9zaXRpb24pXG4gICAgICAgIGNvbnN0IHNlZ21lbnRJbnRlcnZhbCA9IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbi5sYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb24ocGkucG9zaXRpb24sIHZpLCBway5sYWJlbCwgcmtsLnZlY3RvciwgcGsucG9zaXRpb24pXG4gICAgICAgIGNvbnN0IHJheUludGVydmFsID0gcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHBpLnJlY3RhbmdsZSwgcmtsLnZlY3RvciwgcGsucG9zaXRpb24pXG4gICAgICAgIGNvbnN0IHJheVNlZ21lbnRJbnRlcnZhbCA9IHJheVNlZ21lbnRJbnRlcnNlY3Rpb24ocGkucG9zaXRpb24sIHZpLCBway5wb3NpdGlvbiwgcmtsLnZlY3RvcilcbiAgICAgICAgbGFiZWxJbnRlcnNlY3Rpb24gPSBsYWJlbEludGVydmFsLmNvYWxlc2NlSW5QbGFjZShyYXlJbnRlcnZhbClcbiAgICAgICAgc2VnbWVudEludGVyc2VjdGlvbiA9IHNlZ21lbnRJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UocmF5U2VnbWVudEludGVydmFsKVxuICAgICAgICBpZiAoIWxhYmVsSW50ZXJzZWN0aW9uLmVtcHR5IHx8ICFzZWdtZW50SW50ZXJzZWN0aW9uLmVtcHR5KSB7XG4gICAgICAgICAgcmtsLmF2YWlsYWJsZS5tdWx0aXBsZVJlbW92ZShtdWx0aUludGVydmFsLmNvYWxlc2NlKGxhYmVsSW50ZXJzZWN0aW9uLCBzZWdtZW50SW50ZXJzZWN0aW9uKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZXh0ZW5kZWRQb2ludE1ldGhvZHMudXBkYXRlQXZhaWxhYmxlU3BhY2UocGspXG5cbiAgICAgIC8vIFRoZSBvcmlnaW5hbCBhcnRpY2xlIGlzIG5vdCB2ZXJ5IGNsZWFyIGhlcmUuIEl0IHJlbW92ZXMgdGhlIHBvaW50IGZyb20gUCBidXQgdGhlIGl0ZXJhdGlvbiB3YXMgb24gUDAuIEkgc3VwcG9zZSB0aGF0IGlmIHRoZSBpbnRlZ3JhbCBpcyAwIGFuZCB0aGUgcG9pbnQgaXMgaW4gUCB0aGVuIGl0IHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmV4dCBpdGVyYXRpb24gb2YgdGhlIGdyZWVkeSBhbGdvcml0aG1cbiAgICAgIGlmIChway5hdmFpbGFibGVNZWFzdXJlID09PSAwICYmIHJlbWFpbmluZ1BvaW50cy5maW5kSW5kZXgoZWwgPT4gZWwgPT09IHBrKSAhPT0gLTEpe1xuICAgICAgICBQMCA9IFAwLmZpbHRlcihlbCA9PiBlbCAhPT0gcGspXG4gICAgICAgIHJlbWFpbmluZ1BvaW50cyA9IHJlbWFpbmluZ1BvaW50cy5maWx0ZXIoZWwgPT4gZWwgIT09IHBrKVxuICAgICAgICByZWplY3RlZFBvaW50cy5wdXNoKHBrKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ge2Nob3NlbjogcG9pbnRzTGFiZWxlZCwgcmVqZWN0ZWQ6IHJlamVjdGVkUG9pbnRzfVxufSIsIi8vIEdpdmVuIGEgcmF5IGFuZCBhIHJlY3RhbmdsZSwgcmV0dXJuIHRoZSBpbnRlcnZhbCBmcm9tIHRoZSBpbnRlcnNlY3Rpb24gdG8gaW5maW5pdHkgKGl0IGJsb2NrcyB0aGUgcmF5KVxubW9kdWxlLmV4cG9ydHMgPSB7cmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9ufVxuY29uc3QgbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL2xhYmVsLXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKS5sYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgaW50ZXJ2YWwgPSByZXF1aXJlKCcuL2ludGVydmFsJykuaW50ZXJ2YWxcblxuZnVuY3Rpb24gcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uIChsaywgdmksIHBpKSB7XG4gIC8vIEJhc2ljYWxseSBtYWtlIGEgZmFrZSBsYWJlbCBvZiAwIGhlaWdodCBhbmQgd2lkdGhcbiAgY29uc3QgbGkgPSB7aGVpZ2h0OiAwLCBvZmZzZXRYOiAwLCBvZmZzZXRZOiAwLCB3aWR0aDogMH1cbiAgY29uc3QgaW50ZXJzZWN0aW9uID0gbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24obGssIGxpLCB2aSwgcGkpXG4gIGlmIChpbnRlcnNlY3Rpb24uZW1wdHkpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0aW9uXG4gIH1cbiAgcmV0dXJuIGludGVydmFsKGludGVyc2VjdGlvbi5zdGFydCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7cmF5U2VnbWVudEludGVyc2VjdGlvbn1cblxuY29uc3Qgc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3NlZ21lbnQtc2VnbWVudC1pbnRlcnNlY3Rpb24nKS5zZWdtZW50U2VnbWVudEludGVyc2VjdGlvblxuY29uc3QgaW50ZXJ2YWwgPSByZXF1aXJlKCcuL2ludGVydmFsJykuaW50ZXJ2YWxcblxuLypcbnBqLCB2aiBkZWZpbmVzIGEgcmF5XG4gKi9cbmZ1bmN0aW9uIHJheVNlZ21lbnRJbnRlcnNlY3Rpb24gKHBpLCB2aSwgcGosIHZqKSB7XG4gIGNvbnN0IGludGVyc2VjdGlvbiA9IHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uKHBqLCB2aiwgcGksIHZpKVxuICBpZiAoaW50ZXJzZWN0aW9uID09PSBudWxsKSByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICBjb25zdCB7dCwgc30gPSBpbnRlcnNlY3Rpb25cbiAgLy8gdCBpcyB0aW1lIGluIHJheSwgcyBwYXJhbWV0ZXIgb24gdGhlIHNlZ21lbnRcbiAgaWYgKHQgPD0gMCB8fCBzIDwgMCB8fCBzID4gMSkge1xuICAgIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gIH1cbiAgcmV0dXJuIGludGVydmFsKHQsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbn1cbi8vIEEgcG9pbnQgcGkgbW92ZXMgd2l0aCB2aSwgYSBzZWdtZW50IGlzIGRlZmluZWQgd2l0aCBwaiwgdmosIHdlIGZpbmQgdGhlIHRpbWUgdCBhdCB3aGljaCB0aGUgcG9pbnQgaW50ZXJzZWN0cyBhbmQgcmV0dXJucyBwYXJhbWV0ZXJzIHMgb24gdGhlIHNlZ21lbnRcbi8vIFRPRE8gY2hhbmdlIG9yZGVyIHNvIHRoYXQgcGosIHZqIGlzIHRoZSByYXlcbmZ1bmN0aW9uIHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uIChwaSwgdmksIHBqLCB2aiAvKiBWZWN0b3Igb2YgdGhlIHNlZ21lbnQgKi8pIHtcbiAgLy8gKHZpIC12aikodCwgcyleVCA9IChwaiAtIHBpKVxuICB2YXIgZGV0ID0gLSh2aS54ICogdmoueSAtIHZqLnggKiB2aS55KVxuICBpZiAoZGV0ID09PSAwKSB7IC8vIFBhcmFsbGVsIGxpbmVzXG4gICAgLy8gVGVzdCB0aGlzXG4gICAgaWYgKChwaS54IC0gcGoueCkgKiB2ai55IC0gKHBpLmogLSBwai55KSAqIHZqLnggIT09IDApIHJldHVybiBudWxsIC8vIExpbmUgZG9lcyBub3QgYmVsb25nXG4gICAgLy8gVE9ETyBjb25jdXJyZW50IGxpbmVzXG4gICAgdGhyb3cgbmV3IEVycm9yKCdQYXJhbGxlbCBsaW5lcyBub3QgYWxsb3dlZCcpIC8vIFRoaXMgbXVzdCBiZSBoYW5kbGVkIG91dCBvZiB0aGUgYWxnb3JpdGhtXG4gIH1cbiAgY29uc3QgdCA9ICgtKHBqLnggLSBwaS54KSAqIHZqLnkgKyAocGoueSAtIHBpLnkpICogdmoueCkgLyBkZXRcbiAgY29uc3QgcyA9ICgtKHBqLnggLSBwaS54KSAqIHZpLnkgKyAocGoueSAtIHBpLnkpICogdmkueCkgLyBkZXRcbiAgcmV0dXJuIHt0LCBzfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7Y29tcGFyZUFycmF5c0xleGljb2dyYXBoaWNhbGx5LCBtZWFzdXJlfVxuXG5mdW5jdGlvbiBjb21wYXJlQXJyYXlzTGV4aWNvZ3JhcGhpY2FsbHkgKGFycjEsIGFycjIpIHtcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgTWF0aC5taW4oYXJyMS5sZW5ndGgsIGFycjIubGVuZ3RoKSkge1xuICAgIGlmIChhcnIxW2ldICE9PSBhcnIyW2ldKSByZXR1cm4gYXJyMVtpXSAtIGFycjJbaV1cbiAgICBpKytcbiAgfVxuICByZXR1cm4gYXJyMS5sZW5ndGggLSBhcnIyLmxlbmd0aFxufVxuXG5mdW5jdGlvbiBtZWFzdXJlIChzdGFydCwgZW5kKSB7XG4gIHJldHVybiBNYXRoLnBvdygyLCAtc3RhcnQpIC0gTWF0aC5wb3coMiwgLWVuZClcbn0iXX0=
