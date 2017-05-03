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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pdGVyYXRpdmUtZ3JlZWR5L2Rpc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd2Vid29ya2lmeS9pbmRleC5qcyIsInNyYy9leHRlbmRlZC1wb2ludC1tZXRob2RzLmpzIiwic3JjL2ZpbmQtYmVzdC1yYXkuanMiLCJzcmMvaW50ZXJ2YWwuanMiLCJzcmMvbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9sYWJlbC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy9tYWluLWFsZ29yaXRobS1sb2FkZXIuanMiLCJzcmMvbWFpbi1hbGdvcml0aG0uanMiLCJzcmMvbXVsdGktaW50ZXJ2YWwuanMiLCJzcmMvcmF5LWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktc2VnbWVudC1pbnRlcnNlY3Rpb24uanMiLCJzcmMvc2VnbWVudC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxNQUFNLFNBQVUsT0FBTyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDLE9BQU8sR0FBUCxDQUFoQyxHQUE4QyxPQUFPLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0MsT0FBTyxHQUFQLENBQWhDLEdBQThDLElBQTVHO0FBQ0EsTUFBTSxzQkFBc0IsUUFBUSw2QkFBUixDQUE1QjtBQUNBLE9BQU8sT0FBUCxHQUFpQixvQkFBb0IsYUFBckM7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFFRCxTQUFTLE9BQVQsQ0FBa0IsS0FBbEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDNUIsU0FBTyxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQyxLQUFiLElBQXNCLEtBQUssR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFDLEdBQWIsQ0FBN0I7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBsb2Rhc2ggPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbClcbmNvbnN0IG1haW5BbGdvcml0aG1Mb2FkZXIgPSByZXF1aXJlKCcuL3NyYy9tYWluLWFsZ29yaXRobS1sb2FkZXInKVxubW9kdWxlLmV4cG9ydHMgPSBtYWluQWxnb3JpdGhtTG9hZGVyLm1haW5BbGdvcml0aG0iLCJcblxuLy8gVE9ETyBhZGQgdGhlIHBvc3NpYmlsaXR5IHRvIG93biBzY29yZSBmdW5jdGlvblxuLyoqXG4gKlxuICogQHBhcmFtIGdyZWVkeUFsZ29yaXRobSBmdW5jdGlvbiB0aGF0IHJlY2VpdmVzIHR3byBhcnJheXMsIG9uZSBvZiBlbGVtZW50cyB0byBiZSBjb21wdXRlZCBhbmQgb25lIGZvciB0aGUgcG9pbnRzIGZvciB0aGUgcmVzdCBvZiB0aGUgaXRlcmF0aW9ucy5cbiAqIEl0IHJldHVybnMgYW4gb2JqZWN0IHdpdGggdHdvIGVsZW1lbnRzLCBjaG9zZW4gYW5kIHJlamVjdGVkXG4gKiBAcGFyYW0gc3RhcnRpbmdEYXRhIHN0YXJ0aW5nIGFycmF5IG9mIGVsZW1lbnRzXG4gKiBAcGFyYW0gcmVzZXRGdW5jdGlvbiBmdW5jdGlvbiB0byBiZSBhcHBsaWVkIHRvIGVhY2ggZWxlbWVudCBhdCB0aGUgc3RhcnQgb2YgZWFjaCBpdGVyYXRpb25cbiAqIEBwYXJhbSBwYXJhbXMgZXh0cmEgcGFyYW1zXG4gKi9cbmxldCBpdGVyYXRpdmVHcmVlZHlBbGdvcml0aG0gPSAoKCkgPT4ge1xuICB2YXIgX3JlZiA9IF9hc3luY1RvR2VuZXJhdG9yKGZ1bmN0aW9uKiAoZ3JlZWR5QWxnb3JpdGhtLCBzdGFydGluZ0RhdGEsIHJlc2V0RnVuY3Rpb24sIHBhcmFtcyA9IHt9KSB7XG4gICAgY29uc3QgTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TID0gdHlwZW9mIHBhcmFtcy5NQVhfTlVNQkVSX09GX0lURVJBVElPTlMgPT09ICdudW1iZXInID8gcGFyYW1zLk1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA6IDEwMDtcbiAgICAvLyBBdCBldmVyeSBsb29wIGlmIHdlIGltcHJvdmUgdGhlIHJlc3VsdCB0aGVuIHdlIGFwcGx5IHNlcmlhbGl6ZSBmdW5jdGlvbiB0byB0aGUgcmVzdWx0IHRvIHNhdmUgYSBjb3B5XG4gICAgY29uc3Qgc2VyaWFsaXplRnVuY3Rpb24gPSB0eXBlb2YgcGFyYW1zLnNlcmlhbGl6ZUZ1bmN0aW9uID09PSAnZnVuY3Rpb24nID8gcGFyYW1zLnNlcmlhbGl6ZUZ1bmN0aW9uIDogZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHgpKTtcbiAgICB9O1xuICAgIC8vIEluIHRoZSBncmVlZHkgcXVldWUgd2Ugc3RvcmUgYWxsIHRoZSBlbGVtZW50cyBpbiBhcnJheSBpbiByZXZlcnNlIG9yZGVyIG9mIGV4ZWN1dGlvblxuICAgIGNvbnN0IGdyZWVkeVF1ZXVlID0gW3N0YXJ0aW5nRGF0YV07XG4gICAgbGV0IGJlc3RHcmVlZHlRdWV1ZSA9IFtdO1xuICAgIGxldCBiZXN0U2NvcmUgPSAwO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TOyBqKyspIHtcbiAgICAgIGxldCBpdGVyYXRpb25TY29yZSA9IDA7XG4gICAgICBncmVlZHlRdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XG4gICAgICAgIGNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgIHJlc2V0RnVuY3Rpb24uY2FsbChlbGVtZW50LCBlbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IG4gPSBncmVlZHlRdWV1ZS5sZW5ndGg7XG4gICAgICBmb3IgKGxldCBpID0gbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IHsgY2hvc2VuLCByZWplY3RlZCB9ID0geWllbGQgZ3JlZWR5QWxnb3JpdGhtKGdyZWVkeVF1ZXVlW2ldLCBmbGF0dGVuKGdyZWVkeVF1ZXVlLnNsaWNlKDAsIGkpKSk7XG4gICAgICAgIGl0ZXJhdGlvblNjb3JlICs9IGNob3Nlbi5sZW5ndGg7XG4gICAgICAgIGlmIChjaG9zZW4ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgZ3JlZWR5UXVldWVbaV0gPSBjaG9zZW47XG4gICAgICAgICAgLy8gZW5kIG9mIHRoZSBxdWV1ZVxuICAgICAgICAgIGlmIChpID09PSBuIC0gMSkge1xuICAgICAgICAgICAgaWYgKHJlamVjdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICBncmVlZHlRdWV1ZS5wdXNoKHJlamVjdGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ3JlZWR5UXVldWVbaSArIDFdID0gWy4uLmdyZWVkeVF1ZXVlW2kgKyAxXSwgLi4ucmVqZWN0ZWRdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBjaG9zZW4ubGVuZ3RoID09PSAwIHRoZW4gdGhlc2UgZWxlbWVudHMgY291bGQgbm90IGJlIGFzc2lnbmVkIGV2ZW4gYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgcXVldWUsIHdlIHNob3VsZCBnZXQgcmlkIG9mIHRoZW1cbiAgICAgICAgICBpZiAoaSAhPT0gbiAtIDEpIHtcbiAgICAgICAgICAgIGdyZWVkeVF1ZXVlW2ldID0gZ3JlZWR5UXVldWVbaSArIDFdO1xuICAgICAgICAgICAgZ3JlZWR5UXVldWVbaSArIDFdID0gcmVqZWN0ZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXRlcmF0aW9uU2NvcmUgPiBiZXN0U2NvcmUpIHtcbiAgICAgICAgYmVzdFNjb3JlID0gaXRlcmF0aW9uU2NvcmU7XG4gICAgICAgIC8vIFRoZXJlIG11c3QgYmUgYSBiZXR0ZXIgd2F5IHRvIHN0b3JlIHRoZSByZXN1bHRcbiAgICAgICAgLy8gUGx1cyB0aGUgbmFtZSBpcyBhIGJpdCB0cmlja3ksIG9uZSBleHBlY3RzIHRoYXQgdGhlIGFsZ29yaXRobSBpbiBpdCBwYXNzIHNldHMgdGhlIGVsZW1lbnRzXG4gICAgICAgIGJlc3RHcmVlZHlRdWV1ZSA9IHNlcmlhbGl6ZUZ1bmN0aW9uKGZsYXR0ZW4oZ3JlZWR5UXVldWUpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGdyZWVkeVF1ZXVlTGVuZ3RoID0gZ3JlZWR5UXVldWUucmVkdWNlKGZ1bmN0aW9uIChsZW5ndGgsIGFycmF5KSB7XG4gICAgICAgIHJldHVybiBsZW5ndGggKyBhcnJheS5sZW5ndGg7XG4gICAgICB9LCAwKTtcbiAgICAgIGlmIChpdGVyYXRpb25TY29yZSA9PT0gZ3JlZWR5UXVldWVMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGJlc3RHcmVlZHlRdWV1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJlc3RHcmVlZHlRdWV1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGl0ZXJhdGl2ZUdyZWVkeUFsZ29yaXRobShfeCwgX3gyLCBfeDMpIHtcbiAgICByZXR1cm4gX3JlZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufSkoKTtcblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHsgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdmFyIGdlbiA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IGZ1bmN0aW9uIHN0ZXAoa2V5LCBhcmcpIHsgdHJ5IHsgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpOyB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlOyB9IGNhdGNoIChlcnJvcikgeyByZWplY3QoZXJyb3IpOyByZXR1cm47IH0gaWYgKGluZm8uZG9uZSkgeyByZXNvbHZlKHZhbHVlKTsgfSBlbHNlIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHsgc3RlcChcIm5leHRcIiwgdmFsdWUpOyB9LCBmdW5jdGlvbiAoZXJyKSB7IHN0ZXAoXCJ0aHJvd1wiLCBlcnIpOyB9KTsgfSB9IHJldHVybiBzdGVwKFwibmV4dFwiKTsgfSk7IH07IH1cblxubW9kdWxlLmV4cG9ydHMgPSB7IHNvbHZlOiBpdGVyYXRpdmVHcmVlZHlBbGdvcml0aG0gfTtcblxuZnVuY3Rpb24gZmxhdHRlbihhcnJheXMpIHtcbiAgcmV0dXJuIGFycmF5cy5yZWR1Y2UoKGExLCBhMikgPT4gYTEuY29uY2F0KGEyKSwgW10pO1xufSIsInZhciBidW5kbGVGbiA9IGFyZ3VtZW50c1szXTtcbnZhciBzb3VyY2VzID0gYXJndW1lbnRzWzRdO1xudmFyIGNhY2hlID0gYXJndW1lbnRzWzVdO1xuXG52YXIgc3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCBvcHRpb25zKSB7XG4gICAgdmFyIHdrZXk7XG4gICAgdmFyIGNhY2hlS2V5cyA9IE9iamVjdC5rZXlzKGNhY2hlKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2FjaGVLZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0gY2FjaGVLZXlzW2ldO1xuICAgICAgICB2YXIgZXhwID0gY2FjaGVba2V5XS5leHBvcnRzO1xuICAgICAgICAvLyBVc2luZyBiYWJlbCBhcyBhIHRyYW5zcGlsZXIgdG8gdXNlIGVzbW9kdWxlLCB0aGUgZXhwb3J0IHdpbGwgYWx3YXlzXG4gICAgICAgIC8vIGJlIGFuIG9iamVjdCB3aXRoIHRoZSBkZWZhdWx0IGV4cG9ydCBhcyBhIHByb3BlcnR5IG9mIGl0LiBUbyBlbnN1cmVcbiAgICAgICAgLy8gdGhlIGV4aXN0aW5nIGFwaSBhbmQgYmFiZWwgZXNtb2R1bGUgZXhwb3J0cyBhcmUgYm90aCBzdXBwb3J0ZWQgd2VcbiAgICAgICAgLy8gY2hlY2sgZm9yIGJvdGhcbiAgICAgICAgaWYgKGV4cCA9PT0gZm4gfHwgZXhwICYmIGV4cC5kZWZhdWx0ID09PSBmbikge1xuICAgICAgICAgICAgd2tleSA9IGtleTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF3a2V5KSB7XG4gICAgICAgIHdrZXkgPSBNYXRoLmZsb29yKE1hdGgucG93KDE2LCA4KSAqIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgdmFyIHdjYWNoZSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNhY2hlS2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBjYWNoZUtleXNbaV07XG4gICAgICAgICAgICB3Y2FjaGVba2V5XSA9IGtleTtcbiAgICAgICAgfVxuICAgICAgICBzb3VyY2VzW3drZXldID0gW1xuICAgICAgICAgICAgRnVuY3Rpb24oWydyZXF1aXJlJywnbW9kdWxlJywnZXhwb3J0cyddLCAnKCcgKyBmbiArICcpKHNlbGYpJyksXG4gICAgICAgICAgICB3Y2FjaGVcbiAgICAgICAgXTtcbiAgICB9XG4gICAgdmFyIHNrZXkgPSBNYXRoLmZsb29yKE1hdGgucG93KDE2LCA4KSAqIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKDE2KTtcblxuICAgIHZhciBzY2FjaGUgPSB7fTsgc2NhY2hlW3drZXldID0gd2tleTtcbiAgICBzb3VyY2VzW3NrZXldID0gW1xuICAgICAgICBGdW5jdGlvbihbJ3JlcXVpcmUnXSwgKFxuICAgICAgICAgICAgLy8gdHJ5IHRvIGNhbGwgZGVmYXVsdCBpZiBkZWZpbmVkIHRvIGFsc28gc3VwcG9ydCBiYWJlbCBlc21vZHVsZVxuICAgICAgICAgICAgLy8gZXhwb3J0c1xuICAgICAgICAgICAgJ3ZhciBmID0gcmVxdWlyZSgnICsgc3RyaW5naWZ5KHdrZXkpICsgJyk7JyArXG4gICAgICAgICAgICAnKGYuZGVmYXVsdCA/IGYuZGVmYXVsdCA6IGYpKHNlbGYpOydcbiAgICAgICAgKSksXG4gICAgICAgIHNjYWNoZVxuICAgIF07XG5cbiAgICB2YXIgd29ya2VyU291cmNlcyA9IHt9O1xuICAgIHJlc29sdmVTb3VyY2VzKHNrZXkpO1xuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZVNvdXJjZXMoa2V5KSB7XG4gICAgICAgIHdvcmtlclNvdXJjZXNba2V5XSA9IHRydWU7XG5cbiAgICAgICAgZm9yICh2YXIgZGVwUGF0aCBpbiBzb3VyY2VzW2tleV1bMV0pIHtcbiAgICAgICAgICAgIHZhciBkZXBLZXkgPSBzb3VyY2VzW2tleV1bMV1bZGVwUGF0aF07XG4gICAgICAgICAgICBpZiAoIXdvcmtlclNvdXJjZXNbZGVwS2V5XSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmVTb3VyY2VzKGRlcEtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc3JjID0gJygnICsgYnVuZGxlRm4gKyAnKSh7J1xuICAgICAgICArIE9iamVjdC5rZXlzKHdvcmtlclNvdXJjZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5naWZ5KGtleSkgKyAnOlsnXG4gICAgICAgICAgICAgICAgKyBzb3VyY2VzW2tleV1bMF1cbiAgICAgICAgICAgICAgICArICcsJyArIHN0cmluZ2lmeShzb3VyY2VzW2tleV1bMV0pICsgJ10nXG4gICAgICAgICAgICA7XG4gICAgICAgIH0pLmpvaW4oJywnKVxuICAgICAgICArICd9LHt9LFsnICsgc3RyaW5naWZ5KHNrZXkpICsgJ10pJ1xuICAgIDtcblxuICAgIHZhciBVUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkwgfHwgd2luZG93Lm1velVSTCB8fCB3aW5kb3cubXNVUkw7XG5cbiAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtzcmNdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuYmFyZSkgeyByZXR1cm4gYmxvYjsgfVxuICAgIHZhciB3b3JrZXJVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIHZhciB3b3JrZXIgPSBuZXcgV29ya2VyKHdvcmtlclVybCk7XG4gICAgd29ya2VyLm9iamVjdFVSTCA9IHdvcmtlclVybDtcbiAgICByZXR1cm4gd29ya2VyO1xufTtcbiIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHVwZGF0ZUF2YWlsYWJsZVNwYWNlLFxuICBwcm9tb3RlTGFiZWxUb1JlY3RhbmdsZSxcbiAgY29tcHV0ZUluaXRpYWxBdmFpbGFiZVNwYWNlcyxcbiAgcmVzZXRBdmFpbGFibGVTcGFjZSxcbiAgdXBkYXRlTWluaW1hLFxuICB0cmFuc2xhdGVMYWJlbFxufVxuXG5jb25zdCBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLmxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykucmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCBtdWx0aUludGVydmFsID0gcmVxdWlyZSgnLi9tdWx0aS1pbnRlcnZhbCcpLm11bHRpSW50ZXJ2YWxcbmNvbnN0IGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG4vKlxuIEFuIGV4dGVuZGVkIHBvaW50IG1heSBjb250YWluIHRoZSBmb2xsb3dpbmdcbiAgcmF5cyBhIGNvbGxlY3Rpb24gb2YgcmF5cyBzdGFydGluZyBmcm9tIHRoZSBwb2ludCBhcyB3ZWxsIGFzIHRoZSBpbnRlcnZhbHMgd2hlcmUgdGhleSBhcmUgYWxsb3dlZFxuICBsYWJlbCBpbiBjYXNlIHRoZSBsYWJlbCBpcyBub3QgeWV0IHNldHRsZWRcbiAgcmVjdGFuZ2xlIGluIGNhc2UgdGhlIGxhYmVsIGlzIHNldHRsZWRcbiAqL1xuZnVuY3Rpb24gdXBkYXRlQXZhaWxhYmxlU3BhY2UgKGV4dGVuZGVkUG9pbnQpIHtcbiAgdmFyIHJheXMgPSBleHRlbmRlZFBvaW50LnJheXNcbiAgdmFyIG1lYXN1cmUgPSAwXG4gIGZvciAobGV0IHJheSBvZiByYXlzKSB7XG4gICAgbGV0IHJheU1lYXN1cmUgPSByYXkuYXZhaWxhYmxlLm1lYXN1cmUoKVxuICAgIHJheS5hdmFpbGFibGVNZWFzdXJlID0gcmF5TWVhc3VyZVxuICAgIG1lYXN1cmUgKz0gcmF5TWVhc3VyZVxuICB9XG4gIGV4dGVuZGVkUG9pbnQuYXZhaWxhYmxlTWVhc3VyZSA9IG1lYXN1cmVcbn1cblxuZnVuY3Rpb24gY29tcHV0ZUluaXRpYWxBdmFpbGFiZVNwYWNlcyAoZXh0ZW5kZWRQb2ludHMsIHBhcmFtcykge1xuICBjb25zdCByYWRpdXMgPSBwYXJhbXMucmFkaXVzXG4gIGNvbnN0IGJib3ggPSBwYXJhbXMuYmJveFxuICBmb3IgKGxldCBwaSBvZiBleHRlbmRlZFBvaW50cykge1xuICAgIGZvciAobGV0IHJpaiBvZiBwaS5yYXlzKSB7XG4gICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlID0gbXVsdGlJbnRlcnZhbChbaW50ZXJ2YWwoMCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKV0pXG4gICAgICBmb3IgKGxldCBwayBvZiBleHRlbmRlZFBvaW50cykge1xuICAgICAgICBjb25zdCByZWN0YW5nbGUgPSB7dG9wOiBway5wb3NpdGlvbi55ICsgcmFkaXVzLCBib3R0b206IHBrLnBvc2l0aW9uLnkgLSByYWRpdXMsIGxlZnQ6IHBrLnBvc2l0aW9uLnggLSByYWRpdXMsIHJpZ2h0OiBway5wb3NpdGlvbi54ICsgcmFkaXVzLCB3aWR0aDogMiAqIHJhZGl1cywgaGVpZ2h0OiAyICogcmFkaXVzfVxuICAgICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlLnJlbW92ZShsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbihyZWN0YW5nbGUsIHBpLmxhYmVsLCByaWoudmVjdG9yLCBwaS5wb3NpdGlvbikpXG4gICAgICAgIGlmIChwaSAhPT0gcGspIHtcbiAgICAgICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlLnJlbW92ZShyYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocmVjdGFuZ2xlLCByaWoudmVjdG9yLCBwaS5wb3NpdGlvbikpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChiYm94KSB7XG4gICAgICAgIGNvbnN0IGxhYmVsQ29udGFpbmVkSW50ZXJ2YWwgPSBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbih7dG9wOiAtYmJveC50b3AgLSBwaS5sYWJlbC5oZWlnaHQsIGJvdHRvbTogLWJib3guYm90dG9tICsgcGkubGFiZWwuaGVpZ2h0LCBsZWZ0OiBiYm94LmxlZnQgKyBwaS5sYWJlbC53aWR0aCwgcmlnaHQ6IGJib3gucmlnaHQgLSBwaS5sYWJlbC53aWR0aCwgd2lkdGg6IGJib3gud2lkdGggLSAyICogcGkubGFiZWwud2lkdGgsIGhlaWdodDogYmJveC5oZWlnaHQgLSAyICogcGkubGFiZWwuaGVpZ2h0fSwgcGkubGFiZWwsIHJpai52ZWN0b3IsIHBpLnBvc2l0aW9uKVxuICAgICAgICAvLyBXYW50IGxhYmVscyBpbnNpZGUgb2YgdGhlIGdyYXBoXG4gICAgICAgIHJpai5pbml0aWFsbHlBdmFpbGFibGUucmVtb3ZlKGludGVydmFsKGxhYmVsQ29udGFpbmVkSW50ZXJ2YWwuZW5kLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpKVxuICAgICAgfVxuICAgICAgcmlqLmF2YWlsYWJsZSA9IHJpai5pbml0aWFsbHlBdmFpbGFibGUuY2xvbmUoKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZXNldEF2YWlsYWJsZVNwYWNlIChleHRlbmRlZFBvaW50KSB7XG4gIGZvciAobGV0IHJpaiBvZiBleHRlbmRlZFBvaW50LnJheXMpIHtcbiAgICByaWouYXZhaWxhYmxlID0gcmlqLmluaXRpYWxseUF2YWlsYWJsZS5jbG9uZSgpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlTWluaW1hIChleHRlbmRlZFBvaW50KSB7XG4gIHZhciByYXlzID0gZXh0ZW5kZWRQb2ludC5yYXlzXG4gIGZvciAobGV0IHJheSBvZiByYXlzKSB7XG4gICAgcmF5Lm1pbmltdW0gPSByYXkuYXZhaWxhYmxlLmdldE1pbigpXG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvbW90ZUxhYmVsVG9SZWN0YW5nbGUgKGV4dGVuZGVkUG9pbnQsIHZpKSB7XG4gIGV4dGVuZGVkUG9pbnQucmVjdGFuZ2xlID0gdHJhbnNsYXRlTGFiZWwoZXh0ZW5kZWRQb2ludCwgdmkpXG4gIGV4dGVuZGVkUG9pbnQuc2VnbWVudCA9IHt4OiB2aS54LCB5OiB2aS55fVxufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGVMYWJlbCAoZXh0ZW5kZWRQb2ludCwgdmkpIHtcbiAgY29uc3QgcG9pbnQgPSBleHRlbmRlZFBvaW50LnBvc2l0aW9uXG4gIGNvbnN0IGxhYmVsID0gZXh0ZW5kZWRQb2ludC5sYWJlbFxuICByZXR1cm4ge1xuICAgIGhlaWdodDogbGFiZWwuaGVpZ2h0LFxuICAgIHdpZHRoOiBsYWJlbC53aWR0aCxcbiAgICB0b3A6IHBvaW50LnkgKyB2aS55ICsgbGFiZWwuaGVpZ2h0IC8gMixcbiAgICBib3R0b206IHBvaW50LnkgKyB2aS55IC0gbGFiZWwuaGVpZ2h0IC8gMixcbiAgICBsZWZ0OiBwb2ludC54ICsgdmkueCAtIGxhYmVsLndpZHRoIC8gMixcbiAgICByaWdodDogcG9pbnQueCArIHZpLnggKyBsYWJlbC53aWR0aCAvIDJcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5tb2R1bGUuZXhwb3J0cyA9IHtmaW5kQmVzdFJheX1cblxuY29uc3QgZXh0ZW5kZWRQb2ludE1ldGhvZHMgPSByZXF1aXJlKCcuL2V4dGVuZGVkLXBvaW50LW1ldGhvZHMnKVxuY29uc3QgbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL2xhYmVsLXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKS5sYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgbGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1zZWdtZW50LWludGVyc2VjdGlvbicpLmxhYmVsU2VnbWVudEludGVyc2VjdGlvblxuY29uc3QgcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLnJheVJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgcmF5U2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LXNlZ21lbnQtaW50ZXJzZWN0aW9uJykucmF5U2VnbWVudEludGVyc2VjdGlvblxuY29uc3QgbXVsdGlJbnRlcnZhbCA9IHJlcXVpcmUoJy4vbXVsdGktaW50ZXJ2YWwnKS5tdWx0aUludGVydmFsXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG5hc3luYyBmdW5jdGlvbiBmaW5kQmVzdFJheSAocG9pbnRzVG9MYWJlbCwgcG9pbnRzTm90VG9MYWJlbCkge1xuICAvLyBXZSBmb2xsb3cgdGhlIGFydGljbGUgcGFnZSA0IEFsZ29yaXRobSAxXG4gIHZhciBQID0gcG9pbnRzVG9MYWJlbFxuICB2YXIgUDAgPSBwb2ludHNOb3RUb0xhYmVsLmNvbmNhdChwb2ludHNUb0xhYmVsKVxuICAvLyBpbnQgUCBtaW4gaW4gdGhlIGFydGljbGVcbiAgdmFyIG1pbmltdW1BdmFpbGFibGVTcGFjZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICB2YXIgcmJlc3RcbiAgdmFyIFZiZXN0XG4gIHZhciBwYmVzdCAvLyBUaGlzIGlzIG5vdCBpbiB0aGUgb3JpZ2luYWwgYWxnb3JpdGhtIGJ1dCBhbGxvd3MgdG8gZWFzaWx5IGZpbmQgdGhlIGNvcnJlc3BvbmRpbmcgcG9pbnRcbiAgUDAuZm9yRWFjaChwID0+IGV4dGVuZGVkUG9pbnRNZXRob2RzLnVwZGF0ZUF2YWlsYWJsZVNwYWNlKHApKVxuICBQLmZvckVhY2gocCA9PiBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVNaW5pbWEocCkpXG4gIGNvbnN0IHBpID0gUC5yZWR1Y2UoKGksIGopID0+IGkuYXZhaWxhYmxlTWVhc3VyZSA8IGouYXZhaWxhYmxlTWVhc3VyZSA/IGkgOiBqKVxuICBsZXQgUiA9IHBpLnJheXMuZmlsdGVyKHIgPT4gci5hdmFpbGFibGVNZWFzdXJlID4gMClcbiAgcmlqbG9vcDogZm9yIChsZXQgcmlqIG9mIFIpIHtcbiAgICBsZXQgVmlqID0gW11cbiAgICBsZXQgc2VnbWVudCA9IHt4OiByaWoudmVjdG9yLnggKiByaWoubWluaW11bSwgeTogcmlqLnZlY3Rvci55ICogcmlqLm1pbmltdW19XG4gICAgY29uc3QgcmVjdGFuZ2xlID0gZXh0ZW5kZWRQb2ludE1ldGhvZHMudHJhbnNsYXRlTGFiZWwocGksIHNlZ21lbnQpXG4gICAgZm9yIChsZXQgcGsgb2YgUDApIHtcbiAgICAgIGlmIChwayA9PT0gcGkpIGNvbnRpbnVlXG4gICAgICAvLyBObyBzZW5zZSB0byB3YWl0IGZvciB0aGUgaW50ZXJzZWN0aW9uIGlmIHJiZXN0IGlzIGRlZmluZWRcblxuICAgICAgLy8gaW50IHBrXG4gICAgICBsZXQgYXZhaWxhYmxlU3BhY2UgPSBway5hdmFpbGFibGVNZWFzdXJlXG4gICAgICAvLyBOb3QgZG9pbmcgdGhlIHByZWludGVyc2VjdGlvbiBoZXJlLiBTb21ldGhpbmcgZmlzaHkgaW4gdGhlIGFydGljbGUsIGlmIHByZWludGVyc2VjdCBpcyBlbXB0eSB0aGVuICBpbnRlZ3JhbCBway0gaXMgMCB3aGljaCBkb2VzIG5vdCBtYWtlIG11Y2ggc2Vuc2VcbiAgICAgIGZvciAobGV0IHJrbCBvZiBway5yYXlzKSB7XG4gICAgICAgIGxldCBsYWJlbEludGVyc2VjdGlvblxuICAgICAgICBsZXQgc2VnbWVudEludGVyc2VjdGlvblxuICAgICAgICAvLyBXZSBoYXZlIHNwbGl0IGxhYmVsIHJlY3RhbmdsZSBpbnRlcnNlY3Rpb24gaW50byB0d28gYWxnb3JpdGhtcywgbGFiZWwgcmVjdGFuZ2xlIGFuZCBsYWJlbCBzZWdtZW50LiBUaG9zZSB0d28gaW50ZXJ2YWxzIHNob3VsZCBpbnRlcnNlY3Qgc2luY2UgdGhlIHNlZ21lbnQgaW50ZXJzZWN0cyB0aGUgcmVjdGFuZ2xlLCBzbyB3ZSBjYW4gY29hbGVzY2UgdGhlIGludGVydmFsc1xuICAgICAgICBjb25zdCBsYWJlbEludGVydmFsID0gbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocmVjdGFuZ2xlLCBway5sYWJlbCwgcmtsLnZlY3RvciwgcGsucG9zaXRpb24pXG4gICAgICAgIGNvbnN0IHNlZ21lbnRJbnRlcnZhbCA9IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbihwaS5wb3NpdGlvbiwgc2VnbWVudCwgcGsubGFiZWwsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCByYXlJbnRlcnZhbCA9IHJheVJlY3RhbmdsZUludGVyc2VjdGlvbihyZWN0YW5nbGUsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCByYXlTZWdtZW50SW50ZXJ2YWwgPSByYXlTZWdtZW50SW50ZXJzZWN0aW9uKHBpLnBvc2l0aW9uLCBzZWdtZW50LCBway5wb3NpdGlvbiwgcmtsLnZlY3RvcilcbiAgICAgICAgbGFiZWxJbnRlcnNlY3Rpb24gPSBsYWJlbEludGVydmFsLmNvYWxlc2NlSW5QbGFjZShyYXlJbnRlcnZhbClcbiAgICAgICAgc2VnbWVudEludGVyc2VjdGlvbiA9IHNlZ21lbnRJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UocmF5U2VnbWVudEludGVydmFsKVxuICAgICAgICBpZiAoIWxhYmVsSW50ZXJzZWN0aW9uLmVtcHR5IHx8ICFzZWdtZW50SW50ZXJzZWN0aW9uLmVtcHR5KSB7XG4gICAgICAgICAgYXZhaWxhYmxlU3BhY2UgLT0gcmtsLmF2YWlsYWJsZS5tZWFzdXJlTXVsdGlwbGVJbnRlcnNlY3Rpb24obXVsdGlJbnRlcnZhbC5jb2FsZXNjZShsYWJlbEludGVyc2VjdGlvbiwgc2VnbWVudEludGVyc2VjdGlvbikpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgcmF5IGlzIG5vdCBnb29kIGJlY2F1c2Ugd2UgdHJ5IHRvIG1heGltaXplIHRoZSBtaW5pbXVtXG4gICAgICBpZiAocmJlc3QgJiYgYXZhaWxhYmxlU3BhY2UgPCBtaW5pbXVtQXZhaWxhYmxlU3BhY2UpIHtcbiAgICAgICAgY29udGludWUgcmlqbG9vcFxuICAgICAgfVxuICAgICAgVmlqLnB1c2goYXZhaWxhYmxlU3BhY2UpXG4gICAgfVxuICAgIFZpai5zb3J0KChpLCBqKSA9PiBpIC0gaikgLy8gb3JkZXIgdG8gY29tcGFyZSBpbiBsZXhpY29ncmFwaGljYWwgb3JkZXJcbiAgICBpZiAoIVZiZXN0IHx8IHV0aWxzLmNvbXBhcmVBcnJheXNMZXhpY29ncmFwaGljYWxseShWaWosIFZiZXN0KSA8IDApIHtcbiAgICAgIHJiZXN0ID0gcmlqXG4gICAgICBWYmVzdCA9IFZpalxuICAgICAgbWluaW11bUF2YWlsYWJsZVNwYWNlID0gVmlqLnJlZHVjZSgoaSwgaikgPT4gTWF0aC5taW4oaSwgaiksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbiAgICAgIHBiZXN0ID0gcGlcbiAgICB9XG4gIH1cbiAgLy8gV2UgbmVlZCB0byByZXR1cm4gaW50ZXJzZWN0aW9uRGF0YSBiZWNhdXNlIHRoZSByZWZlcmVuY2UgaGFzIGJlZW4gbmV1dGVyZWQgaW4gZmluZCByYXkgaW50ZXJzZWN0aW9uXG4gIHJldHVybiB7cmJlc3Q6IHJiZXN0LCBwYmVzdDogcGJlc3R9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtpbnRlcnZhbH1cbmZ1bmN0aW9uIEludGVydmFsIChzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICAvLyBjb25zb2xlLmVycm9yKCdXcm9uZyBvcmRlciBvZiBpbnRlcnZhbCcsIHN0YXJ0LCBlbmQpXG4gICAgdGhpcy5lbXB0eSA9IHRydWVcbiAgICB0aGlzLnN0YXJ0ID0gbnVsbFxuICAgIHRoaXMuZW5kID0gbnVsbFxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgdGhpcy5zdGFydCA9IHN0YXJ0XG4gIHRoaXMuZW5kID0gZW5kXG4gIHJldHVybiB0aGlzXG59XG5cbkludGVydmFsLmVtcHR5ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IEludGVydmFsKDEsIC0xKVxufVxuSW50ZXJ2YWwucHJvdG90eXBlLmludGVyc2VjdCA9IGZ1bmN0aW9uIChpbnRlcnZhbCkge1xuICBpZiAodGhpcy5lbXB0eSB8fCBpbnRlcnZhbC5lbXB0eSkgcmV0dXJuIEludGVydmFsLmVtcHR5KClcbiAgcmV0dXJuIG5ldyBJbnRlcnZhbChNYXRoLm1heChpbnRlcnZhbC5zdGFydCwgdGhpcy5zdGFydCksIE1hdGgubWluKGludGVydmFsLmVuZCwgdGhpcy5lbmQpKVxufVxuXG5JbnRlcnZhbC5wcm90b3R5cGUuY29hbGVzY2UgPSBmdW5jdGlvbiAoaW50ZXJ2YWwpIHtcbiAgaWYgKHRoaXMuZW1wdHkpIHJldHVybiBpbnRlcnZhbFxuICBpZiAoaW50ZXJ2YWwuZW1wdHkpIHJldHVybiB0aGlzXG4gIGlmIChpbnRlcnZhbC5zdGFydCA+IHRoaXMuZW5kIHx8IHRoaXMuc3RhcnQgPiBpbnRlcnZhbC5lbmQpIHtcbiAgICAvLyBXZSBwcm9iYWJseSBuZWVkIGEgbXVsdGkgaW50ZXJ2YWwgaW4gdGhpcyBjYXNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY29hbGxlc2NlJylcbiAgfVxuICByZXR1cm4gbmV3IEludGVydmFsKE1hdGgubWluKGludGVydmFsLnN0YXJ0LCB0aGlzLnN0YXJ0KSwgTWF0aC5tYXgoaW50ZXJ2YWwuZW5kLCB0aGlzLmVuZCkpXG59XG4vLyBUT0RPIHJlbW92ZSBjb2FsZXNjZSBhbmQgcmVuYW1lIHRoaXMgbWV0aG9kIHRvIGNvYWxlc2NlXG4vLyBtb2RpZmllcyBpbnRlcnZhbFxuSW50ZXJ2YWwucHJvdG90eXBlLmNvYWxlc2NlSW5QbGFjZSA9IGZ1bmN0aW9uIChpbnRlcnZhbCkge1xuICBpZiAodGhpcy5lbXB0eSkgcmV0dXJuIGludGVydmFsXG4gIGlmIChpbnRlcnZhbC5lbXB0eSkgcmV0dXJuIHRoaXNcbiAgaWYgKGludGVydmFsLnN0YXJ0ID4gdGhpcy5lbmQgfHwgdGhpcy5zdGFydCA+IGludGVydmFsLmVuZCkge1xuICAgIC8vIFdlIHByb2JhYmx5IG5lZWQgYSBtdWx0aSBpbnRlcnZhbCBpbiB0aGlzIGNhc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjb2FsbGVzY2UnKVxuICB9XG4gIHRoaXMuc3RhcnQgPSBNYXRoLm1pbihpbnRlcnZhbC5zdGFydCwgdGhpcy5zdGFydClcbiAgdGhpcy5lbmQgPSBNYXRoLm1heChpbnRlcnZhbC5lbmQsIHRoaXMuZW5kKVxuICByZXR1cm4gdGhpc1xufVxuSW50ZXJ2YWwucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5lbXB0eSkgcmV0dXJuIEludGVydmFsLmVtcHR5KClcbiAgcmV0dXJuIG5ldyBJbnRlcnZhbCh0aGlzLnN0YXJ0LCB0aGlzLmVuZClcbn1cbkludGVydmFsLnByb3RvdHlwZS5tZWFzdXJlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5lbXB0eSkgcmV0dXJuIDBcbiAgcmV0dXJuIE1hdGgucG93KDIsIC10aGlzLnN0YXJ0KSAtIE1hdGgucG93KDIsIC10aGlzLmVuZClcbn1cbmZ1bmN0aW9uIGludGVydmFsKHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIG5ldyBJbnRlcnZhbChzdGFydCwgZW5kKVxufVxuaW50ZXJ2YWwuZW1wdHkgPSBJbnRlcnZhbC5lbXB0eSIsIid1c2Ugc3RyaWN0J1xudmFyIGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG5tb2R1bGUuZXhwb3J0cyA9IHtsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbn1cblxuLyogUmVjdGFuZ2xlIGxrIGludGVyc2VjdHMgbGFiZWwgbGkgbW92aW5nIGZyb20gcGkgd2l0aCB2ZWN0b3IgdmkgaW4gcG9zaXRpdmUgdGltZSAqL1xuLy8gQ29tcGFyZSBjZW50ZXJzIG9mIHRoZSBsYWJlbHMgdGhleSBtdXN0IGJlIHdpdGhpbiBsaS5oZWlnaHQgLyAyICsgbGsuaGVpZ2h0IC8gMiBpbiB0aGUgdmVydGljYWwgdmFyaWFibGUgYW5kIGxpLndpZHRoIC8gMiArIGxrLndpZHRoIC8gMiBpbiB0aGUgaG9yaXpvbnRhbCB2YXJpYWJsZSwgaS5lIHNvbHZlIHxsay54IC0gKHBrLnggKyB0ICogdi54KXwgPCBkXG5mdW5jdGlvbiBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbiAobGssIGxpLCB2aSwgcGkpIHtcbiAgbGV0IG1pbiA9IDBcbiAgbGV0IG1heCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICBpZiAodmkueSAhPT0gMCkge1xuICAgIGNvbnN0IGZpcnN0SW50ZXJzZWN0aW9uID0gKGxrLmhlaWdodCAvIDIgKyBsaS5oZWlnaHQgLyAyICsgKGxrLnRvcCArIGxrLmJvdHRvbSkgLyAyIC0gcGkueSkgLyB2aS55XG4gICAgY29uc3Qgc2Vjb25kSW50ZXJzZWN0aW9uID0gKC1say5oZWlnaHQgLyAyIC0gbGkuaGVpZ2h0IC8gMiArIChsay50b3AgKyBsay5ib3R0b20pIC8gMiAtIHBpLnkpIC8gdmkueVxuICAgIC8vIE11bHRpcGx5aW5nIGJ5IGEgbmVnYXRpdmUgc2lnbiByZXZlcnNlcyBhbiBpbmVxdWFsaXR5XG4gICAgaWYgKHZpLnkgPiAwKSB7XG4gICAgICBtYXggPSBNYXRoLm1pbihtYXgsIGZpcnN0SW50ZXJzZWN0aW9uKVxuICAgICAgbWluID0gTWF0aC5tYXgobWluLCBzZWNvbmRJbnRlcnNlY3Rpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIG1pbiA9IE1hdGgubWF4KG1pbiwgZmlyc3RJbnRlcnNlY3Rpb24pXG4gICAgICBtYXggPSBNYXRoLm1pbihtYXgsIHNlY29uZEludGVyc2VjdGlvbilcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gdmVjdG9yIGlzIHZlcnRpY2FsIGFuZCB0aGV5IHdpbGwgbmV2ZXIgaW50ZXJzZWN0XG4gICAgaWYgKHBpLnkgLSAobGsudG9wICsgbGsuYm90dG9tKSAvIDIgPiBsay5oZWlnaHQgLyAyICsgbGkuaGVpZ2h0IC8gMikgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgICBpZiAocGkueSAtIChsay50b3AgKyBsay5ib3R0b20pIC8gMiA8IC0gbGsuaGVpZ2h0IC8gMiAtIGxpLmhlaWdodCAvIDIpIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gIH1cbiAgaWYgKHZpLnggIT09IDApIHtcbiAgICBjb25zdCB0aGlyZEludGVyc2VjdGlvbiA9IChsay53aWR0aCAvIDIgKyBsaS53aWR0aCAvIDIgKyAobGsucmlnaHQgKyBsay5sZWZ0KSAvIDIgLSBwaS54KSAvIHZpLnhcbiAgICBjb25zdCBmb3VydGhJbnRlcnNlY3Rpb24gPSAoLSBsay53aWR0aCAvIDIgLSBsaS53aWR0aCAvIDIgKyAobGsucmlnaHQgKyBsay5sZWZ0KSAvIDIgLSBwaS54KSAvIHZpLnhcbiAgICBpZiAodmkueCA+IDApIHtcbiAgICAgIG1heCA9IE1hdGgubWluKG1heCwgdGhpcmRJbnRlcnNlY3Rpb24pXG4gICAgICBtaW4gPSBNYXRoLm1heChtaW4sIGZvdXJ0aEludGVyc2VjdGlvbilcbiAgICB9IGVsc2Uge1xuICAgICAgbWluID0gTWF0aC5tYXgobWluLCB0aGlyZEludGVyc2VjdGlvbilcbiAgICAgIG1heCA9IE1hdGgubWluKG1heCwgZm91cnRoSW50ZXJzZWN0aW9uKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAocGkueCAtIChsay5yaWdodCArIGxrLmxlZnQpIC8gMiA+IGxrLndpZHRoIC8gMiArIGxpLndpZHRoIC8gMikgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgICBpZiAocGkueCAtIChsay5yaWdodCArIGxrLmxlZnQpIC8gMiA8IC1say53aWR0aCAvIDIgLSBsaS53aWR0aCAvIDIpIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gIH1cblxuICAvLyBPbmx5IGludGVyZXN0ZWQgaW4gcG9zaXRpdmUgdmFsdWVzXG4gIHJldHVybiBpbnRlcnZhbChtaW4sIG1heClcbn0iLCIndXNlIHN0cmljdCdcbi8vIEZpbmQgaW50ZXJ2YWwgaW4gd2hpY2ggYW4gaW50ZXJ2YWwgYW5kIGEgc2VnbWVudCBpbnRlcnNlY3Rcbm1vZHVsZS5leHBvcnRzID0ge2xhYmVsU2VnbWVudEludGVyc2VjdGlvbn1cblxudmFyIHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9zZWdtZW50LXNlZ21lbnQtaW50ZXJzZWN0aW9uJykuc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb25cbnZhciBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuXG4vLyBMYWJlbCBsaSBtb3ZlcyB3aXRoIHZlY3RvciB2aS4gV2UgZmluZCB0aGUgaW50ZXJ2YWwgYXQgd2hpY2ggaXQgaW50ZXJzZWN0cyB0aGUgc2VnbWVudCBwaywgdmsuIElmIHBrIGlzIGNvbnRhaW5lZCB0aGVuIHRoZSBpbnRlcnZhbCBnb2VzIHRvIElORklOSVRZXG5mdW5jdGlvbiBsYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb24gKHBrLCB2aywgbGksIHZpLCBwaSkge1xuICAvLyB0cmFuc2xhdGUgc28gd2UgY2FuIGFzc3VtZSB0aGF0IHBvaW50IGlzIGluIHRoZSBjZW50cmVcbiAgcGsgPSB7eDogcGsueCAtIHBpLngsIHk6IHBrLnkgLSBwaS55fVxuICAvLyBUT0RPIGhhbmRsZSBwYXJhbGxlbCBsaW5lc1xuICB2YXIgcG9pbnRDb3ZlcmVkXG4gIC8vIFRoZSB0aW1lIGludGVydmFsIHdoZXJlIHRoZXkgbWVldCBpcyBjb25uZWN0ZWQgc28gaXQgaXMgZW5vdWdoIHRvIGZpbmQgdGhlIGVuZCBwb2ludHMuIFRoaXMgbXVzdCBvY2N1ciB3aGVuIGVpdGhlciB0aGUgY29ybmVycyBvZiB0aGUgbGFiZWwgaW50ZXJzZWN0IG9yIHdoZW5cbiAgY29uc3QgaW50ZXJzZWN0aW9ucyA9IFtdXG4gIC8vIHRoZSBlbmQgcG9pbnRzIG9mIHRoZSBzZWdtZW50IGludGVyc2VjdFxuICBmb3IgKGxldCB4IG9mIFstIGxpLndpZHRoIC8gMiwgbGkud2lkdGggLyAyXSkge1xuICAgIGZvciAobGV0IHkgb2YgWyAtIGxpLmhlaWdodCAvIDIsIGxpLmhlaWdodCAvIDJdKSB7XG4gICAgICBsZXQgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24oe3gsIHl9LCB2aSwgcGssIHZrKVxuICAgICAgLy8gSW50ZXJzZWN0cyBpbnNpZGUgdGhlIHNlZ21lbnRcbiAgICAgIGlmIChpbnRlcnNlY3Rpb24gJiYgaW50ZXJzZWN0aW9uLnMgPj0gMCAmJiBpbnRlcnNlY3Rpb24ucyA8PSAxKSB7XG4gICAgICAgIGludGVyc2VjdGlvbnMucHVzaChpbnRlcnNlY3Rpb24udClcbiAgICAgIH1cblxuICAgICAgLy8gR2l2ZW4gYSBwb2ludCB0byB3ZSB0YWtlIHRoZSBzaWRlIGNvbWluZyBmcm9tIGl0IGluIGNvdW50ZXIgY2xvY2t3aXNlXG4gICAgICBsZXQgc2lkZVxuICAgICAgaWYgKHggKiB5IDwgMCkge1xuICAgICAgICBzaWRlID0ge3g6IDAsIHk6IC0yICogeX1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpZGUgPSB7eDogLTIgKiB4LCB5OiAwfVxuICAgICAgfVxuICAgICAgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24oe3gsIHl9LCBzaWRlLCBwaywgdmkpXG4gICAgICBpZiAoaW50ZXJzZWN0aW9uICYmIGludGVyc2VjdGlvbi50ID49IDAgJiYgaW50ZXJzZWN0aW9uLnQgPD0gMSkge1xuICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goLWludGVyc2VjdGlvbi5zKVxuICAgICAgICAvLy8vIFRoZSBzaWRlIGNvdmVycyB0aGUgcG9pbnQgaW4gdGhlIGZ1dHVyZVxuICAgICAgICAvL2lmIChpbnRlcnNlY3Rpb24ucyA8IDApIHtcbiAgICAgICAgLy8gIGludGVyc2VjdGlvbnMucHVzaChOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gICAgICAgIC8vfVxuICAgICAgfVxuICAgICAgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24oe3gsIHl9LCBzaWRlLCB7eDogcGsueCArIHZrLngsIHk6IHBrLnkgKyB2ay55fSwgdmkpXG4gICAgICBpZiAoaW50ZXJzZWN0aW9uICYmIGludGVyc2VjdGlvbi50ID49IDAgJiYgaW50ZXJzZWN0aW9uLnQgPD0gMSkge1xuICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goLWludGVyc2VjdGlvbi5zKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICB2YXIgbWluID0gaW50ZXJzZWN0aW9ucy5yZWR1Y2UoKGEsIGIpID0+IE1hdGgubWluKGEsYiksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbiAgdmFyIG1heCA9IGludGVyc2VjdGlvbnMucmVkdWNlKChhLCBiKSA9PiBNYXRoLm1heChhLGIpLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpXG4gIG1pbiA9IE1hdGgubWF4KG1pbiwgMClcbiAgcmV0dXJuIGludGVydmFsKG1pbiwgbWF4KVxuXG59IiwibW9kdWxlLmV4cG9ydHMgPSB7bWFpbkFsZ29yaXRobX1cbmNvbnN0IHdvcmsgPSByZXF1aXJlKCd3ZWJ3b3JraWZ5JylcbmNvbnN0IGFsZ29yaXRobSA9IHdvcmsocmVxdWlyZSgnLi9tYWluLWFsZ29yaXRobS5qcycpKVxuY29uc3QgcHJvbWlzZVJlc29sdXRpb25zID0ge31cbmZ1bmN0aW9uIG1haW5BbGdvcml0aG0gKGV4dGVuZGVkUG9pbnRzLCBwYXJhbXMgPSB7fSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGV4dGVuZGVkUG9pbnRzID0gZXh0ZW5kZWRQb2ludHMubWFwKHAgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHAuaWQsXG4gICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgeDogcC5wb3NpdGlvbi54LFxuICAgICAgICAgIHk6IC1wLnBvc2l0aW9uLnkgLy8gVGhlIGFsZ29yaXRobSBleHBlY3RzIHkgdG8gZ3JvdyB1cHdhcmRzXG4gICAgICAgIH0sXG4gICAgICAgIGxhYmVsOiBwLmxhYmVsXG4gICAgICB9XG4gICAgfSlcbiAgICBjb25zdCBwcm9jZXNzVVVJRCA9IHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKS50b1N0cmluZygpIC8vIG5vIG5lZWQgZm9yIGFueXRoaW5nIGZhbmN5XG4gICAgYWxnb3JpdGhtLnBvc3RNZXNzYWdlKHtcbiAgICAgIHR5cGU6ICdzdGFydCcsXG4gICAgICBleHRlbmRlZFBvaW50cyxcbiAgICAgIHBhcmFtcyxcbiAgICAgIHByb2Nlc3NVVUlEXG4gICAgfSlcbiAgICBwcm9taXNlUmVzb2x1dGlvbnNbcHJvY2Vzc1VVSURdID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBldmVudC5kYXRhLnJlc3VsdC5tYXAocCA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IHAuaWQsXG4gICAgICAgICAgcmVjdGFuZ2xlOiB7XG4gICAgICAgICAgICBsZWZ0OiBwLnJlY3RhbmdsZS5sZWZ0LFxuICAgICAgICAgICAgcmlnaHQ6IHAucmVjdGFuZ2xlLnJpZ2h0LFxuICAgICAgICAgICAgdG9wOiAtcC5yZWN0YW5nbGUudG9wLFxuICAgICAgICAgICAgYm90dG9tOiAtcC5yZWN0YW5nbGUuYm90dG9tXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgcmV0dXJuIHJlc29sdmUocmVzdWx0KVxuICAgIH1cbiAgfSlcbn1cbmFsZ29yaXRobS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgZGF0YSA9IGV2ZW50LmRhdGFcbiAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICBjYXNlICdlbmQnOlxuICAgICAgZW5kRXZlbnQoZXZlbnQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmVycm9yKCdUaGlzIGV2ZW50IGNhc2Ugc2hvdWxkIG5vdCBoYXBwZW4nLCBkYXRhLnR5cGUpXG4gIH1cbn1cblxuZnVuY3Rpb24gZW5kRXZlbnQgKGV2ZW50KSB7XG4gIGNvbnN0IHtwcm9jZXNzVVVJRH0gPSBldmVudC5kYXRhXG4gIGNvbnN0IGNhbGxiYWNrID0gcHJvbWlzZVJlc29sdXRpb25zW3Byb2Nlc3NVVUlEXVxuICBjYWxsYmFjayhldmVudClcbiAgZGVsZXRlIHByb21pc2VSZXNvbHV0aW9uc1twcm9jZXNzVVVJRF1cbn0iLCJsZXQgTlVNQkVSX09GX1JBWVNcbi8vIENhbGxlZCBhcyB3ZWJ3b3JrZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNlbGYpIHtcbiAgY29uc3QgZXh0ZW5kZWRQb2ludE1ldGhvZHMgPSByZXF1aXJlKCcuL2V4dGVuZGVkLXBvaW50LW1ldGhvZHMnKVxuICBjb25zdCByYXlJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1pbnRlcnNlY3Rpb24nKS5yYXlJbnRlcnNlY3Rpb25cbiAgY29uc3QgaXRlcmF0aXZlR3JlZWR5ID0gcmVxdWlyZSgnaXRlcmF0aXZlLWdyZWVkeScpXG4gIGlmICh0eXBlb2YgcG9zdE1lc3NhZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgc2VsZi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBkYXRhID0gZXZlbnQuZGF0YVxuICAgICAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICAgIGxhdW5jaE1haW5BbGdvcml0aG1Gcm9tRXZlbnQoZXZlbnQpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdOb3QgYSB2YWxpZCBldmVudCB0eXBlJywgZGF0YS50eXBlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxhdW5jaE1haW5BbGdvcml0aG1Gcm9tRXZlbnQgKGV2ZW50KSB7XG4gICAgY29uc3QgZGF0YSA9IGV2ZW50LmRhdGFcbiAgICBjb25zdCBleHRlbmRlZFBvaW50cyA9IGRhdGEuZXh0ZW5kZWRQb2ludHNcbiAgICBjb25zdCBwYXJhbXMgPSBkYXRhLnBhcmFtc1xuICAgIGNvbnN0IHByb2Nlc3NVVUlEID0gZGF0YS5wcm9jZXNzVVVJRCAvLyB3ZSB1c2UgdGhpcyBpbiBjYXNlIHRoZSBhbGdvcmlobSBpcyByZXF1aXJlZCBzZXZlcmFsIHRpbWVzXG4gICAgbWFpbkFsZ29yaXRobShleHRlbmRlZFBvaW50cywgcGFyYW1zKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICBwb3N0TWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ2VuZCcsXG4gICAgICAgICAgcHJvY2Vzc1VVSUQsXG4gICAgICAgICAgcmVzdWx0XG4gICAgICAgIH0pXG4gICAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gbWFpbkFsZ29yaXRobSAoZXh0ZW5kZWRQb2ludHMsIHBhcmFtcyA9IHt9KSB7XG4gICAgTlVNQkVSX09GX1JBWVMgPSAodHlwZW9mIHBhcmFtcy5OVU1CRVJfT0ZfUkFZUyA9PT0gJ251bWJlcicpID8gcGFyYW1zLk5VTUJFUl9PRl9SQVlTIDogM1xuICAgIGNvbnN0IE1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA9ICh0eXBlb2YgcGFyYW1zLk1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA9PT0gJ251bWJlcicpID8gcGFyYW1zLk1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA6IDFcbiAgICBjb21wdXRlUmF5cyhleHRlbmRlZFBvaW50cylcbiAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5jb21wdXRlSW5pdGlhbEF2YWlsYWJlU3BhY2VzKGV4dGVuZGVkUG9pbnRzLCB7cmFkaXVzOiBwYXJhbXMucmFkaXVzIHx8IDIsIGJib3g6IHBhcmFtcy5iYm94fSlcbiAgICBleHRlbmRlZFBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5yZXNldEF2YWlsYWJsZVNwYWNlKHApXG4gICAgICBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwKVxuICAgIH0pXG4gICAgY29uc3QgcG9zc2libGVQb2ludHMgPSBleHRlbmRlZFBvaW50cy5maWx0ZXIocCA9PiBwLmF2YWlsYWJsZU1lYXN1cmUgPiAwKVxuICAgIHJldHVybiBpdGVyYXRpdmVHcmVlZHkuc29sdmUocmF5SW50ZXJzZWN0aW9uLCBwb3NzaWJsZVBvaW50cywgcmVzZXRGdW5jdGlvbiwge3NlcmlhbGl6ZUZ1bmN0aW9uLCBNQVhfTlVNQkVSX09GX0lURVJBVElPTlN9KVxuICB9XG5cbiAgZnVuY3Rpb24gY29tcHV0ZVJheXMgKGV4dGVuZGVkUG9pbnRzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHRlbmRlZFBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBpID0gZXh0ZW5kZWRQb2ludHNbaV1cbiAgICAgIHBpLnJheXMgPSBbXVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBOVU1CRVJfT0ZfUkFZUzsgaisrKSB7XG4gICAgICAgIHBpLnJheXMucHVzaCgge1xuICAgICAgICAgIGluZGV4OiBpKk5VTUJFUl9PRl9SQVlTICogTlVNQkVSX09GX1JBWVMgKjQgKyBqICogTlVNQkVSX09GX1JBWVMgKiA0LFxuICAgICAgICAgIHNlbGZJbmRleDogaixcbiAgICAgICAgICB2ZWN0b3IgOiB7XG4gICAgICAgICAgICB4OiBNYXRoLnNpbigyICogTWF0aC5QSSAqIGogLyBOVU1CRVJfT0ZfUkFZUyksXG4gICAgICAgICAgICB5OiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGogLyBOVU1CRVJfT0ZfUkFZUylcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbi8vIEF0IGVhY2ggaXRlcmF0aW9uIG9mIGl0ZXJhdGl2ZSBncmVlZHkgaWYgdGhlIHNvbHV0aW9uIGlzIGJldHRlciB3ZSBzZXJpYWxpemUgd2hhdCB3ZSBvYnRhaW5lZFxuICBmdW5jdGlvbiBzZXJpYWxpemVGdW5jdGlvbiAoYXJyYXlPZlBvaW50cykge1xuICAgIC8vIFdoZW4gd2UgbGFiZWwgYSBwb2ludCB3ZSBwcm9tb3RlIGxhYmVsIHRvIHJlY3RhbmdsZSBhbmQgd2UgcmVzZXQgaXQgYXQgZWFjaCBpdGVyYXRpb25cbiAgICBjb25zdCBsYWJlbGVkUG9pbnRzID0gYXJyYXlPZlBvaW50cy5maWx0ZXIocG9pbnQgPT4gISFwb2ludC5yZWN0YW5nbGUpXG4gICAgLy8gVG8gc2VyaWFsaXplIHdlIG5lZWQgYW4gaWRcbiAgICByZXR1cm4gbGFiZWxlZFBvaW50cy5tYXAocG9pbnQgPT4geyByZXR1cm4ge2lkOiBwb2ludC5pZCwgcmVjdGFuZ2xlOiBPYmplY3QuYXNzaWduKHt9LCBwb2ludC5yZWN0YW5nbGUpfSB9KVxuICB9XG5cbi8vIEF0IGVhY2ggaXRlcmF0aW9uIG9mIGl0ZXJhdGl2ZSBncmVlZHkgd2UgcmVzZXQgdGhlIGNvbmRpdGlvbnNcbiAgZnVuY3Rpb24gcmVzZXRGdW5jdGlvbiAoZ2VuZXJhbGl6ZWRQb2ludCkge1xuICAgIGdlbmVyYWxpemVkUG9pbnQucmVjdGFuZ2xlID0gbnVsbFxuICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnJlc2V0QXZhaWxhYmxlU3BhY2UoZ2VuZXJhbGl6ZWRQb2ludClcbiAgfVxufVxuXG4iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge211bHRpSW50ZXJ2YWx9XG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbi8vIERpc2pvaW50IHVuaW9uIG9mIHNldmVyYWwgaW50ZXJ2YWxzXG4vLyBpbnRlcnZhbHMgYXJyYXkgb2YgY29vcmRpbmF0ZXNcbmZ1bmN0aW9uIE11bHRpSW50ZXJ2YWwgKGludGVydmFscywgaXNDbG9uZSkge1xuICAvLyBOb3QgdmVyeSBuaWNlIGJ1dCBpdCBpcyBoYXJkIHRvIGNsb25lIGluIGpzXG4gIGlmIChpc0Nsb25lKSB7XG4gICAgdGhpcy5pbnRlcnZhbHMgPSBbLi4uaW50ZXJ2YWxzXVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgaWYgKCFBcnJheS5pc0FycmF5KGludGVydmFscykgfHwgaW50ZXJ2YWxzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMuaW50ZXJ2YWxzID0gW11cbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIHRoaXMuaW50ZXJ2YWxzID0gW11cbiAgdmFyIGNoZWNrZWRJbnRlcnZhbHMgPSBbXVxuICAvLyBTbyB3ZSBjYW4gY2hlY2sgaW50ZXJ2YWxcbiAgdmFyIGludGVydmFsQ29uc3RydWN0b3IgPSBpbnRlcnZhbCgwLCAxKS5jb25zdHJ1Y3RvclxuICBmb3IgKGxldCBteUludGVydmFsIG9mIGludGVydmFscykge1xuICAgIGlmICghIG15SW50ZXJ2YWwgaW5zdGFuY2VvZiBpbnRlcnZhbENvbnN0cnVjdG9yKSB7XG4gICAgICB0aGlzLmludGVydmFscyA9IFtdXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgICBpZiAoIW15SW50ZXJ2YWwuZW1wdHkpIHtcbiAgICAgIGNoZWNrZWRJbnRlcnZhbHMucHVzaChteUludGVydmFsLmNsb25lKCkpXG4gICAgfVxuICB9XG5cbiAgY2hlY2tlZEludGVydmFscy5zb3J0KChpMSwgaTIpID0+IGkxLnN0YXJ0IC0gaTIuc3RhcnQpXG5cbiAgLy8gTm93IHdlIG5lZWQgdG8gY29hbGVzY2UgaW50ZXJ2YWxzIGlmIG5lZWRlZFxuICBsZXQgbmV4dEludGVydmFsID0gbnVsbFxuICBmb3IgKGxldCBteUludGVydmFsIG9mIGNoZWNrZWRJbnRlcnZhbHMpIHtcbiAgICBpZiAobmV4dEludGVydmFsID09PSBudWxsKSB7XG4gICAgICBuZXh0SW50ZXJ2YWwgPSBteUludGVydmFsXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghbmV4dEludGVydmFsLmludGVyc2VjdChteUludGVydmFsKS5lbXB0eSkge1xuICAgICAgICBuZXh0SW50ZXJ2YWwuY29hbGVzY2VJblBsYWNlKG15SW50ZXJ2YWwpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmludGVydmFscy5wdXNoKG5leHRJbnRlcnZhbC5zdGFydCwgbmV4dEludGVydmFsLmVuZClcbiAgICAgICAgbmV4dEludGVydmFsID0gbXlJbnRlcnZhbFxuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAobmV4dEludGVydmFsKSB7XG4gICAgdGhpcy5pbnRlcnZhbHMucHVzaChuZXh0SW50ZXJ2YWwuc3RhcnQsIG5leHRJbnRlcnZhbC5lbmQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cbk11bHRpSW50ZXJ2YWwuZW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgTXVsdGlJbnRlcnZhbChbXSlcbn1cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAhdGhpcy5pbnRlcnZhbHMubGVuZ3RoXG59XG5cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmludGVydmFsQ29uc3RydWN0b3IgPSBpbnRlcnZhbCgwLCAxKS5jb25zdHJ1Y3RvclxuXG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBNdWx0aUludGVydmFsKHRoaXMuaW50ZXJ2YWxzLCB0cnVlKVxufVxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKG15SW50ZXJ2YWwpIHtcbiAgaWYgKCEgbXlJbnRlcnZhbCBpbnN0YW5jZW9mIHRoaXMuaW50ZXJ2YWxDb25zdHJ1Y3Rvcikge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGFuIGludGVydmFsJylcbiAgfVxuICBpZiAodGhpcy5pc0VtcHR5KCkgfHwgbXlJbnRlcnZhbC5lbXB0eSkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgX3JlbW92ZSh0aGlzLmludGVydmFscywgbXlJbnRlcnZhbC5zdGFydCwgbXlJbnRlcnZhbC5lbmQpXG4gIHJldHVybiB0aGlzXG59XG4vLyBSZW1vdmVzIGluIHBsYWNlXG5mdW5jdGlvbiBfcmVtb3ZlKGludGVydmFscywgbXlTdGFydCwgbXlFbmQpIHtcbiAgbGV0IGkgPSAwXG4gIHdoaWxlIChpIDwgaW50ZXJ2YWxzLmxlbmd0aCkge1xuICAgIGNvbnN0IGludGVydmFsU3RhcnQgPSBpbnRlcnZhbHNbaV1cbiAgICBjb25zdCBpbnRlcnZhbEVuZCA9IGludGVydmFsc1tpICsgMV1cbiAgICBpZiAoaW50ZXJ2YWxTdGFydCA+PSBteUVuZCkge1xuICAgICAgYnJlYWsgLy8gbm8gbW9yZSBpbnRlcnNlY3Rpb25cbiAgICB9XG4gICAgLy8gbm8gaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsRW5kIDw9IG15U3RhcnQpIHtcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gZnVsbCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxTdGFydCA+PSBteVN0YXJ0ICYmIGludGVydmFsRW5kIDw9IG15RW5kKSB7XG4gICAgICBpbnRlcnZhbHMuc3BsaWNlKGksIDIpXG4gICAgICAvLyBpIGRvZXMgbm90IGdyb3cgd2UgZGVjcmVhc2UgbGVuZ3RoXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBsZWZ0IGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15U3RhcnQgJiYgaW50ZXJ2YWxFbmQgPiBteUVuZCkge1xuICAgICAgaW50ZXJ2YWxzW2ldID0gbXlFbmRcbiAgICAgIGJyZWFrIC8vIFRoZXJlIHdvbid0IGJlIGFueSBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICAvLyByaWdodCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxFbmQgPD0gbXlFbmQgJiYgaW50ZXJ2YWxTdGFydCA8IG15U3RhcnQpIHtcbiAgICAgIGludGVydmFsc1tpICsgMV0gPSBteVN0YXJ0XG4gICAgICBpICs9IDJcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGludGVyc2VjdHMgaW4gdGhlIG1pZGRsZVxuICAgIGlmIChpbnRlcnZhbEVuZCA+IG15RW5kICYmIGludGVydmFsU3RhcnQgPCBteVN0YXJ0KSB7XG4gICAgICBpbnRlcnZhbHMuc3BsaWNlKGkgKyAxLCAwLCBteVN0YXJ0LCBteUVuZClcbiAgICAgIGJyZWFrIC8vIHRoZXJlIHdvbid0IGJlIGFueSBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICBjb25zb2xlLmVycm9yKCdUaGlzIHNob3VsZCBub3QgaGFwcGVuJywgbXlTdGFydCwgbXlFbmQsIGludGVydmFsU3RhcnQsIGludGVydmFsRW5kKVxuICAgIGkgKz0gMlxuICB9XG4gIHJldHVybiBpbnRlcnZhbHNcbn1cblxuLy8gSW4gcGxhY2Vcbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLm11bHRpcGxlUmVtb3ZlID0gZnVuY3Rpb24gKG15TXVsdGlJbnRlcnZhbCkge1xuICBpZiAoISBteU11bHRpSW50ZXJ2YWwgaW5zdGFuY2VvZiBNdWx0aUludGVydmFsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBtdWx0aSBpbnRlcnZhbCcpXG4gIH1cbiAgaWYgKHRoaXMuaXNFbXB0eSgpIHx8IG15TXVsdGlJbnRlcnZhbC5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbXlNdWx0aUludGVydmFsLmludGVydmFscy5sZW5ndGg7IGkgKz0gMikge1xuICAgIF9yZW1vdmUodGhpcy5pbnRlcnZhbHMsIG15TXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaV0sIG15TXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaSArIDFdKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbmZ1bmN0aW9uIF9tZWFzdXJlSW50ZXJzZWN0aW9uIChpbnRlcnZhbHMsIG15U3RhcnQsIG15RW5kKSB7XG4gIGxldCBpID0gMFxuICBsZXQgbWVhc3VyZSA9IDBcbiAgd2hpbGUgKGkgPCBpbnRlcnZhbHMubGVuZ3RoKSB7XG4gICAgY29uc3QgaW50ZXJ2YWxTdGFydCA9IGludGVydmFsc1tpXVxuICAgIGNvbnN0IGludGVydmFsRW5kID0gaW50ZXJ2YWxzW2kgKyAxXVxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15RW5kKSB7XG4gICAgICBicmVhayAvLyBubyBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICAvLyBubyBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxFbmQgPD0gbXlTdGFydCkge1xuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBmdWxsIGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15U3RhcnQgJiYgaW50ZXJ2YWxFbmQgPD0gbXlFbmQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShpbnRlcnZhbFN0YXJ0LCBpbnRlcnZhbEVuZClcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gbGVmdCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxTdGFydCA+PSBteVN0YXJ0ICYmIGludGVydmFsRW5kID4gbXlFbmQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShpbnRlcnZhbFN0YXJ0LCBteUVuZClcbiAgICAgIGJyZWFrIC8vIFRoZXJlIHdvbid0IGJlIGFueSBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICAvLyByaWdodCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxFbmQgPD0gbXlFbmQgJiYgaW50ZXJ2YWxTdGFydCA8IG15U3RhcnQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShteVN0YXJ0LCBpbnRlcnZhbEVuZClcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gaW50ZXJzZWN0cyBpbiB0aGUgbWlkZGxlXG4gICAgaWYgKGludGVydmFsRW5kID4gbXlFbmQgJiYgaW50ZXJ2YWxTdGFydCA8IG15U3RhcnQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShteVN0YXJ0LCBteUVuZClcbiAgICAgIGJyZWFrIC8vIHRoZXJlIHdvbid0IGJlIGFueSBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICBjb25zb2xlLmVycm9yKCdUaGlzIHNob3VsZCBub3QgaGFwcGVuJywgbXlTdGFydCwgbXlFbmQsIGludGVydmFsU3RhcnQsIGludGVydmFsRW5kKVxuICAgIGkgKz0gMlxuICB9XG4gIHJldHVybiBtZWFzdXJlXG59XG5cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLm1lYXN1cmVNdWx0aXBsZUludGVyc2VjdGlvbiA9IGZ1bmN0aW9uIChtdWx0aUludGVydmFsKSB7XG4gIGxldCBtZWFzdXJlID0gMFxuICBmb3IgKGxldCBpID0gMDsgaSA8IG11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgbWVhc3VyZSArPSBfbWVhc3VyZUludGVyc2VjdGlvbih0aGlzLmludGVydmFscywgbXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaV0sIG11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzW2krMV0pXG4gIH1cbiAgcmV0dXJuIG1lYXN1cmVcbn1cblxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUubWVhc3VyZSA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0IG1lYXN1cmUgPSAwXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnRlcnZhbHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBtZWFzdXJlICs9IHV0aWxzLm1lYXN1cmUodGhpcy5pbnRlcnZhbHNbaV0sIHRoaXMuaW50ZXJ2YWxzW2kgKyAxXSlcbiAgfVxuICByZXR1cm4gbWVhc3VyZVxufVxuXG5cbi8vVE9ETyB0ZXN0XG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5nZXRNaW4gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmlzRW1wdHkoKSkgcmV0dXJuIE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICByZXR1cm4gdGhpcy5pbnRlcnZhbHNbMF0vL3RoaXMuaW50ZXJ2YWxzLnJlZHVjZSgobWluLCBjdXIpID0+IGN1ci5zdGFydCA8IG1pbiA/IGN1ci5zdGFydCA6IG1pbiwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxufVxuXG5tdWx0aUludGVydmFsLmNvYWxlc2NlID0gZnVuY3Rpb24gKGludGVydmFsLCBhbm90aGVySW50ZXJ2YWwpIHtcbiAgaWYgKGludGVydmFsLnN0YXJ0ID4gYW5vdGhlckludGVydmFsLmVuZCB8fCBhbm90aGVySW50ZXJ2YWwuc3RhcnQgPiBpbnRlcnZhbC5lbmQpIHtcbiAgICByZXR1cm4gbXVsdGlJbnRlcnZhbChbaW50ZXJ2YWwsIGFub3RoZXJJbnRlcnZhbF0pXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG11bHRpSW50ZXJ2YWwoW2ludGVydmFsLmNvYWxlc2NlKGFub3RoZXJJbnRlcnZhbCldKVxuICB9XG59XG5tdWx0aUludGVydmFsLmVtcHR5ID0gTXVsdGlJbnRlcnZhbC5lbXB0eVxuXG5mdW5jdGlvbiBtdWx0aUludGVydmFsIChpbnRlcnZhbHMpIHtcbiAgcmV0dXJuIG5ldyBNdWx0aUludGVydmFsKGludGVydmFscylcbn0iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge3JheUludGVyc2VjdGlvbn1cblxuY29uc3QgZmluZEJlc3RSYXkgPSByZXF1aXJlKCcuL2ZpbmQtYmVzdC1yYXknKVxuY29uc3QgZXh0ZW5kZWRQb2ludE1ldGhvZHMgPSByZXF1aXJlKCcuL2V4dGVuZGVkLXBvaW50LW1ldGhvZHMnKVxuY29uc3QgbXVsdGlJbnRlcnZhbCA9IHJlcXVpcmUoJy4vbXVsdGktaW50ZXJ2YWwnKS5tdWx0aUludGVydmFsXG4vLyBCZXR0ZXIgdG8gZ3JhYiB0aGUgbW9kdWxlIGhlcmUgYW5kIGZldGNoIHRoZSBtZXRob2QgaW4gdGhlIGFsZ29yaXRobSwgdGhhdCB3YXkgd2UgY2FuIHN0dWJcbmNvbnN0IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJylcbmNvbnN0IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtc2VnbWVudC1pbnRlcnNlY3Rpb24nKVxuY29uc3QgcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLnJheVJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgcmF5U2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LXNlZ21lbnQtaW50ZXJzZWN0aW9uJykucmF5U2VnbWVudEludGVyc2VjdGlvblxuXG4vLyBUT0RPIHVzZSBzZXRzXG5hc3luYyBmdW5jdGlvbiByYXlJbnRlcnNlY3Rpb24gKHBvaW50c1RvTGFiZWwsIHBvaW50c05vdFRvTGFiZWwpIHtcbiAgcG9pbnRzVG9MYWJlbC5mb3JFYWNoKHA9PiBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwKSlcbiAgY29uc3QgcmVqZWN0ZWRQb2ludHMgPSBwb2ludHNUb0xhYmVsLmZpbHRlcihwID0+IHAuYXZhaWxhYmxlTWVhc3VyZSA9PT0gMClcbiAgLy8gUCBpbiB0aGUgYXJ0aWNsZVxuICB2YXIgcmVtYWluaW5nUG9pbnRzID0gcG9pbnRzVG9MYWJlbC5maWx0ZXIocCA9PiBwLmF2YWlsYWJsZU1lYXN1cmUgPiAwKVxuICB2YXIgUDAgPSBwb2ludHNUb0xhYmVsLmNvbmNhdChwb2ludHNOb3RUb0xhYmVsKVxuICBjb25zdCBwb2ludHNMYWJlbGVkID0gW10gLy8gSGVyZSB3ZSBkaWZmZXIgZnJvbSB0aGUgb3JpZ2luYWwgYXJ0aWNsZSwgb25jZSB3ZSBmaW5kIGEgcG9pbnQgaW4gUCB0byBsYWJlbCB3ZSByZW1vdmUgaXQgZnJvbSBQIGFuZCBhZGQgaXQgdG8gcG9pbnRzTGFiZWxlZCwgb3RoZXJ3aXNlIHRoZSBhbGdvcml0aG0gZG9lcyBub3QgZmluaXNoXG4gIHdoaWxlIChyZW1haW5pbmdQb2ludHMubGVuZ3RoICE9PSAwKSB7XG4gICAgbGV0IGJlc3RSYXkgPSBhd2FpdCBmaW5kQmVzdFJheS5maW5kQmVzdFJheShyZW1haW5pbmdQb2ludHMsIHBvaW50c05vdFRvTGFiZWwpXG4gICAgbGV0IHJpaiA9IGJlc3RSYXkucmJlc3RcbiAgICBsZXQgcGkgPSBiZXN0UmF5LnBiZXN0XG4gICAgaWYgKHJpaiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBJdCBjb3VsZCBvbmx5IGhhcHBlbiB0aGF0IHdlIGdldCByaWogdW5kZWZpbmVkIGluIHRoZSBmaXJzdCBpdGVyYXRpb25cbiAgICAgIGlmIChwb2ludHNMYWJlbGVkLmxlbmd0aCAhPT0gMCB8fCByZWplY3RlZFBvaW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGJlaGF2aW91cicpXG4gICAgICB9XG4gICAgICByZXR1cm4ge2Nob3NlbjogW10sIHJlamVjdGVkOiBbLi4ucG9pbnRzVG9MYWJlbF19XG4gICAgfVxuICAgIGxldCB2aSA9IHt4OiByaWoudmVjdG9yLnggKiByaWouYXZhaWxhYmxlLmdldE1pbigpLCB5OiByaWoudmVjdG9yLnkgKiByaWouYXZhaWxhYmxlLmdldE1pbigpfVxuICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnByb21vdGVMYWJlbFRvUmVjdGFuZ2xlKHBpLCB2aSlcbiAgICByZW1haW5pbmdQb2ludHMgPSByZW1haW5pbmdQb2ludHMuZmlsdGVyKGVsID0+IGVsICE9PSBwaSlcbiAgICBQMCA9IFAwLmZpbHRlcihlbCA9PiBlbCAhPT0gcGkpXG4gICAgcG9pbnRzTGFiZWxlZC5wdXNoKHBpKVxuICAgIGZvciAobGV0IHBrIG9mIFAwKSB7XG4gICAgICBmb3IgKGxldCBya2wgb2YgcGsucmF5cykge1xuICAgICAgICBsZXQgbGFiZWxJbnRlcnNlY3Rpb25cbiAgICAgICAgbGV0IHNlZ21lbnRJbnRlcnNlY3Rpb25cbiAgICAgICAgY29uc3QgbGFiZWxJbnRlcnZhbCA9IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uLmxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHBpLnJlY3RhbmdsZSwgcGsubGFiZWwsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCBzZWdtZW50SW50ZXJ2YWwgPSBsYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb24ubGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uKHBpLnBvc2l0aW9uLCB2aSwgcGsubGFiZWwsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCByYXlJbnRlcnZhbCA9IHJheVJlY3RhbmdsZUludGVyc2VjdGlvbihwaS5yZWN0YW5nbGUsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCByYXlTZWdtZW50SW50ZXJ2YWwgPSByYXlTZWdtZW50SW50ZXJzZWN0aW9uKHBpLnBvc2l0aW9uLCB2aSwgcGsucG9zaXRpb24sIHJrbC52ZWN0b3IpXG4gICAgICAgIGxhYmVsSW50ZXJzZWN0aW9uID0gbGFiZWxJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UocmF5SW50ZXJ2YWwpXG4gICAgICAgIHNlZ21lbnRJbnRlcnNlY3Rpb24gPSBzZWdtZW50SW50ZXJ2YWwuY29hbGVzY2VJblBsYWNlKHJheVNlZ21lbnRJbnRlcnZhbClcbiAgICAgICAgaWYgKCFsYWJlbEludGVyc2VjdGlvbi5lbXB0eSB8fCAhc2VnbWVudEludGVyc2VjdGlvbi5lbXB0eSkge1xuICAgICAgICAgIHJrbC5hdmFpbGFibGUubXVsdGlwbGVSZW1vdmUobXVsdGlJbnRlcnZhbC5jb2FsZXNjZShsYWJlbEludGVyc2VjdGlvbiwgc2VnbWVudEludGVyc2VjdGlvbikpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnVwZGF0ZUF2YWlsYWJsZVNwYWNlKHBrKVxuXG4gICAgICAvLyBUaGUgb3JpZ2luYWwgYXJ0aWNsZSBpcyBub3QgdmVyeSBjbGVhciBoZXJlLiBJdCByZW1vdmVzIHRoZSBwb2ludCBmcm9tIFAgYnV0IHRoZSBpdGVyYXRpb24gd2FzIG9uIFAwLiBJIHN1cHBvc2UgdGhhdCBpZiB0aGUgaW50ZWdyYWwgaXMgMCBhbmQgdGhlIHBvaW50IGlzIGluIFAgdGhlbiBpdCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5leHQgaXRlcmF0aW9uIG9mIHRoZSBncmVlZHkgYWxnb3JpdGhtXG4gICAgICBpZiAocGsuYXZhaWxhYmxlTWVhc3VyZSA9PT0gMCAmJiByZW1haW5pbmdQb2ludHMuZmluZEluZGV4KGVsID0+IGVsID09PSBwaykgIT09IC0xKXtcbiAgICAgICAgUDAgPSBQMC5maWx0ZXIoZWwgPT4gZWwgIT09IHBrKVxuICAgICAgICByZW1haW5pbmdQb2ludHMgPSByZW1haW5pbmdQb2ludHMuZmlsdGVyKGVsID0+IGVsICE9PSBwaylcbiAgICAgICAgcmVqZWN0ZWRQb2ludHMucHVzaChwaylcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtjaG9zZW46IHBvaW50c0xhYmVsZWQsIHJlamVjdGVkOiByZWplY3RlZFBvaW50c31cbn0iLCIvLyBHaXZlbiBhIHJheSBhbmQgYSByZWN0YW5nbGUsIHJldHVybiB0aGUgaW50ZXJ2YWwgZnJvbSB0aGUgaW50ZXJzZWN0aW9uIHRvIGluZmluaXR5IChpdCBibG9ja3MgdGhlIHJheSlcbm1vZHVsZS5leHBvcnRzID0ge3JheVJlY3RhbmdsZUludGVyc2VjdGlvbn1cbmNvbnN0IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykubGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb25cbmNvbnN0IGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG5cbmZ1bmN0aW9uIHJheVJlY3RhbmdsZUludGVyc2VjdGlvbiAobGssIHZpLCBwaSkge1xuICAvLyBCYXNpY2FsbHkgbWFrZSBhIGZha2UgbGFiZWwgb2YgMCBoZWlnaHQgYW5kIHdpZHRoXG4gIGNvbnN0IGxpID0ge2hlaWdodDogMCwgd2lkdGg6IDB9XG4gIGNvbnN0IGludGVyc2VjdGlvbiA9IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uKGxrLCBsaSwgdmksIHBpKVxuICBpZiAoaW50ZXJzZWN0aW9uLmVtcHR5KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdGlvblxuICB9XG4gIHJldHVybiBpbnRlcnZhbChpbnRlcnNlY3Rpb24uc3RhcnQsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge3JheVNlZ21lbnRJbnRlcnNlY3Rpb259XG5cbmNvbnN0IHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9zZWdtZW50LXNlZ21lbnQtaW50ZXJzZWN0aW9uJykuc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb25cbmNvbnN0IGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG5cbi8qXG5waiwgdmogZGVmaW5lcyBhIHJheVxuICovXG5mdW5jdGlvbiByYXlTZWdtZW50SW50ZXJzZWN0aW9uIChwaSwgdmksIHBqLCB2aikge1xuICBjb25zdCBpbnRlcnNlY3Rpb24gPSBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbihwaiwgdmosIHBpLCB2aSlcbiAgaWYgKGludGVyc2VjdGlvbiA9PT0gbnVsbCkgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgY29uc3Qge3QsIHN9ID0gaW50ZXJzZWN0aW9uXG4gIC8vIHQgaXMgdGltZSBpbiByYXksIHMgcGFyYW1ldGVyIG9uIHRoZSBzZWdtZW50XG4gIGlmICh0IDw9IDAgfHwgcyA8IDAgfHwgcyA+IDEpIHtcbiAgICByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICB9XG4gIHJldHVybiBpbnRlcnZhbCh0LCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG59IiwibW9kdWxlLmV4cG9ydHMgPSB7c2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb259XG4vLyBBIHBvaW50IHBpIG1vdmVzIHdpdGggdmksIGEgc2VnbWVudCBpcyBkZWZpbmVkIHdpdGggcGosIHZqLCB3ZSBmaW5kIHRoZSB0aW1lIHQgYXQgd2hpY2ggdGhlIHBvaW50IGludGVyc2VjdHMgYW5kIHJldHVybnMgcGFyYW1ldGVycyBzIG9uIHRoZSBzZWdtZW50XG4vLyBUT0RPIGNoYW5nZSBvcmRlciBzbyB0aGF0IHBqLCB2aiBpcyB0aGUgcmF5XG5mdW5jdGlvbiBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbiAocGksIHZpLCBwaiwgdmogLyogVmVjdG9yIG9mIHRoZSBzZWdtZW50ICovKSB7XG4gIC8vICh2aSAtdmopKHQsIHMpXlQgPSAocGogLSBwaSlcbiAgdmFyIGRldCA9IC0odmkueCAqIHZqLnkgLSB2ai54ICogdmkueSlcbiAgaWYgKGRldCA9PT0gMCkgeyAvLyBQYXJhbGxlbCBsaW5lc1xuICAgIC8vIFRlc3QgdGhpc1xuICAgIGlmICgocGkueCAtIHBqLngpICogdmoueSAtIChwaS5qIC0gcGoueSkgKiB2ai54ICE9PSAwKSByZXR1cm4gbnVsbCAvLyBMaW5lIGRvZXMgbm90IGJlbG9uZ1xuICAgIC8vIFRPRE8gY29uY3VycmVudCBsaW5lc1xuICAgIHRocm93IG5ldyBFcnJvcignUGFyYWxsZWwgbGluZXMgbm90IGFsbG93ZWQnKSAvLyBUaGlzIG11c3QgYmUgaGFuZGxlZCBvdXQgb2YgdGhlIGFsZ29yaXRobVxuICB9XG4gIGNvbnN0IHQgPSAoLShwai54IC0gcGkueCkgKiB2ai55ICsgKHBqLnkgLSBwaS55KSAqIHZqLngpIC8gZGV0XG4gIGNvbnN0IHMgPSAoLShwai54IC0gcGkueCkgKiB2aS55ICsgKHBqLnkgLSBwaS55KSAqIHZpLngpIC8gZGV0XG4gIHJldHVybiB7dCwgc31cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge2NvbXBhcmVBcnJheXNMZXhpY29ncmFwaGljYWxseSwgbWVhc3VyZX1cblxuZnVuY3Rpb24gY29tcGFyZUFycmF5c0xleGljb2dyYXBoaWNhbGx5IChhcnIxLCBhcnIyKSB7XG4gIHZhciBpID0gMFxuICB3aGlsZSAoaSA8IE1hdGgubWluKGFycjEubGVuZ3RoLCBhcnIyLmxlbmd0aCkpIHtcbiAgICBpZiAoYXJyMVtpXSAhPSBhcnIyW2ldKSByZXR1cm4gYXJyMVtpXSAtIGFycjJbaV1cbiAgICBpKytcbiAgfVxuICByZXR1cm4gYXJyMS5sZW5ndGggLSBhcnIyLmxlbmd0aFxufVxuXG5mdW5jdGlvbiBtZWFzdXJlIChzdGFydCwgZW5kKSB7XG4gIHJldHVybiBNYXRoLnBvdygyLCAtc3RhcnQpIC0gTWF0aC5wb3coMiwgLWVuZClcbn0iXX0=
