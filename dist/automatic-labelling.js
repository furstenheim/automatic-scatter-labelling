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
  pk = { x: pk.x - pi.x, y: pk.y - pi.y };
  // TODO handle parallel lines
  // The time interval where they meet is connected so it is enough to find the end points. This must occur when either the corners of the label intersect or when
  const intersections = [];
  // the end points of the segment intersect
  for (let x of [-li.width / 2 + li.offsetX, li.width / 2 + li.offsetX]) {
    for (let y of [-li.height / 2 + li.offsetY, li.height / 2 + li.offsetY]) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pdGVyYXRpdmUtZ3JlZWR5L2Rpc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd2Vid29ya2lmeS9pbmRleC5qcyIsInNyYy9leHRlbmRlZC1wb2ludC1tZXRob2RzLmpzIiwic3JjL2ZpbmQtYmVzdC1yYXkuanMiLCJzcmMvaW50ZXJ2YWwuanMiLCJzcmMvbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9sYWJlbC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy9tYWluLWFsZ29yaXRobS1sb2FkZXIuanMiLCJzcmMvbWFpbi1hbGdvcml0aG0uanMiLCJzcmMvbXVsdGktaW50ZXJ2YWwuanMiLCJzcmMvcmF5LWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktc2VnbWVudC1pbnRlcnNlY3Rpb24uanMiLCJzcmMvc2VnbWVudC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxNQUFNLFNBQVUsT0FBTyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDLE9BQU8sR0FBUCxDQUFoQyxHQUE4QyxPQUFPLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0MsT0FBTyxHQUFQLENBQWhDLEdBQThDLElBQTVHO0FBQ0EsTUFBTSxzQkFBc0IsUUFBUSw2QkFBUixDQUE1QjtBQUNBLE9BQU8sT0FBUCxHQUFpQixvQkFBb0IsYUFBckM7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFHLENBQUgsR0FBTyxHQUFHLENBQVgsSUFBZ0IsR0FBRyxDQUE1QyxJQUFpRCxHQUEzRDtBQUNBLFNBQU8sRUFBQyxDQUFELEVBQUksQ0FBSixFQUFQO0FBQ0Q7OztBQ2ZELE9BQU8sT0FBUCxHQUFpQixFQUFDLDhCQUFELEVBQWlDLE9BQWpDLEVBQWpCOztBQUVBLFNBQVMsOEJBQVQsQ0FBeUMsSUFBekMsRUFBK0MsSUFBL0MsRUFBcUQ7QUFDbkQsTUFBSSxJQUFJLENBQVI7QUFDQSxTQUFPLElBQUksS0FBSyxHQUFMLENBQVMsS0FBSyxNQUFkLEVBQXNCLEtBQUssTUFBM0IsQ0FBWCxFQUErQztBQUM3QyxRQUFJLEtBQUssQ0FBTCxNQUFZLEtBQUssQ0FBTCxDQUFoQixFQUF5QixPQUFPLEtBQUssQ0FBTCxJQUFVLEtBQUssQ0FBTCxDQUFqQjtBQUN6QjtBQUNEO0FBQ0QsU0FBTyxLQUFLLE1BQUwsR0FBYyxLQUFLLE1BQTFCO0FBQ0Q7O0FBRUQsU0FBUyxPQUFULENBQWtCLEtBQWxCLEVBQXlCLEdBQXpCLEVBQThCO0FBQzVCLFNBQU8sS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLENBQUMsS0FBYixJQUFzQixLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQyxHQUFiLENBQTdCO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgbG9kYXNoID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpXG5jb25zdCBtYWluQWxnb3JpdGhtTG9hZGVyID0gcmVxdWlyZSgnLi9zcmMvbWFpbi1hbGdvcml0aG0tbG9hZGVyJylcbm1vZHVsZS5leHBvcnRzID0gbWFpbkFsZ29yaXRobUxvYWRlci5tYWluQWxnb3JpdGhtIiwiXG5cbi8vIFRPRE8gYWRkIHRoZSBwb3NzaWJpbGl0eSB0byBvd24gc2NvcmUgZnVuY3Rpb25cbi8qKlxuICpcbiAqIEBwYXJhbSBncmVlZHlBbGdvcml0aG0gZnVuY3Rpb24gdGhhdCByZWNlaXZlcyB0d28gYXJyYXlzLCBvbmUgb2YgZWxlbWVudHMgdG8gYmUgY29tcHV0ZWQgYW5kIG9uZSBmb3IgdGhlIHBvaW50cyBmb3IgdGhlIHJlc3Qgb2YgdGhlIGl0ZXJhdGlvbnMuXG4gKiBJdCByZXR1cm5zIGFuIG9iamVjdCB3aXRoIHR3byBlbGVtZW50cywgY2hvc2VuIGFuZCByZWplY3RlZFxuICogQHBhcmFtIHN0YXJ0aW5nRGF0YSBzdGFydGluZyBhcnJheSBvZiBlbGVtZW50c1xuICogQHBhcmFtIHJlc2V0RnVuY3Rpb24gZnVuY3Rpb24gdG8gYmUgYXBwbGllZCB0byBlYWNoIGVsZW1lbnQgYXQgdGhlIHN0YXJ0IG9mIGVhY2ggaXRlcmF0aW9uXG4gKiBAcGFyYW0gcGFyYW1zIGV4dHJhIHBhcmFtc1xuICovXG5sZXQgaXRlcmF0aXZlR3JlZWR5QWxnb3JpdGhtID0gKCgpID0+IHtcbiAgdmFyIF9yZWYgPSBfYXN5bmNUb0dlbmVyYXRvcihmdW5jdGlvbiogKGdyZWVkeUFsZ29yaXRobSwgc3RhcnRpbmdEYXRhLCByZXNldEZ1bmN0aW9uLCBwYXJhbXMgPSB7fSkge1xuICAgIGNvbnN0IE1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA9IHR5cGVvZiBwYXJhbXMuTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TID09PSAnbnVtYmVyJyA/IHBhcmFtcy5NQVhfTlVNQkVSX09GX0lURVJBVElPTlMgOiAxMDA7XG4gICAgLy8gQXQgZXZlcnkgbG9vcCBpZiB3ZSBpbXByb3ZlIHRoZSByZXN1bHQgdGhlbiB3ZSBhcHBseSBzZXJpYWxpemUgZnVuY3Rpb24gdG8gdGhlIHJlc3VsdCB0byBzYXZlIGEgY29weVxuICAgIGNvbnN0IHNlcmlhbGl6ZUZ1bmN0aW9uID0gdHlwZW9mIHBhcmFtcy5zZXJpYWxpemVGdW5jdGlvbiA9PT0gJ2Z1bmN0aW9uJyA/IHBhcmFtcy5zZXJpYWxpemVGdW5jdGlvbiA6IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh4KSk7XG4gICAgfTtcbiAgICAvLyBJbiB0aGUgZ3JlZWR5IHF1ZXVlIHdlIHN0b3JlIGFsbCB0aGUgZWxlbWVudHMgaW4gYXJyYXkgaW4gcmV2ZXJzZSBvcmRlciBvZiBleGVjdXRpb25cbiAgICBjb25zdCBncmVlZHlRdWV1ZSA9IFtzdGFydGluZ0RhdGFdO1xuICAgIGxldCBiZXN0R3JlZWR5UXVldWUgPSBbXTtcbiAgICBsZXQgYmVzdFNjb3JlID0gMDtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IE1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUzsgaisrKSB7XG4gICAgICBsZXQgaXRlcmF0aW9uU2NvcmUgPSAwO1xuICAgICAgZ3JlZWR5UXVldWUuZm9yRWFjaChmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuICAgICAgICBjb2xsZWN0aW9uLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICByZXNldEZ1bmN0aW9uLmNhbGwoZWxlbWVudCwgZWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBjb25zdCBuID0gZ3JlZWR5UXVldWUubGVuZ3RoO1xuICAgICAgZm9yIChsZXQgaSA9IG4gLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCB7IGNob3NlbiwgcmVqZWN0ZWQgfSA9IHlpZWxkIGdyZWVkeUFsZ29yaXRobShncmVlZHlRdWV1ZVtpXSwgZmxhdHRlbihncmVlZHlRdWV1ZS5zbGljZSgwLCBpKSkpO1xuICAgICAgICBpdGVyYXRpb25TY29yZSArPSBjaG9zZW4ubGVuZ3RoO1xuICAgICAgICBpZiAoY2hvc2VuLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgIGdyZWVkeVF1ZXVlW2ldID0gY2hvc2VuO1xuICAgICAgICAgIC8vIGVuZCBvZiB0aGUgcXVldWVcbiAgICAgICAgICBpZiAoaSA9PT0gbiAtIDEpIHtcbiAgICAgICAgICAgIGlmIChyZWplY3RlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZ3JlZWR5UXVldWUucHVzaChyZWplY3RlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdyZWVkeVF1ZXVlW2kgKyAxXSA9IFsuLi5ncmVlZHlRdWV1ZVtpICsgMV0sIC4uLnJlamVjdGVkXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgY2hvc2VuLmxlbmd0aCA9PT0gMCB0aGVuIHRoZXNlIGVsZW1lbnRzIGNvdWxkIG5vdCBiZSBhc3NpZ25lZCBldmVuIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHF1ZXVlLCB3ZSBzaG91bGQgZ2V0IHJpZCBvZiB0aGVtXG4gICAgICAgICAgaWYgKGkgIT09IG4gLSAxKSB7XG4gICAgICAgICAgICBncmVlZHlRdWV1ZVtpXSA9IGdyZWVkeVF1ZXVlW2kgKyAxXTtcbiAgICAgICAgICAgIGdyZWVkeVF1ZXVlW2kgKyAxXSA9IHJlamVjdGVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGl0ZXJhdGlvblNjb3JlID4gYmVzdFNjb3JlKSB7XG4gICAgICAgIGJlc3RTY29yZSA9IGl0ZXJhdGlvblNjb3JlO1xuICAgICAgICAvLyBUaGVyZSBtdXN0IGJlIGEgYmV0dGVyIHdheSB0byBzdG9yZSB0aGUgcmVzdWx0XG4gICAgICAgIC8vIFBsdXMgdGhlIG5hbWUgaXMgYSBiaXQgdHJpY2t5LCBvbmUgZXhwZWN0cyB0aGF0IHRoZSBhbGdvcml0aG0gaW4gaXQgcGFzcyBzZXRzIHRoZSBlbGVtZW50c1xuICAgICAgICBiZXN0R3JlZWR5UXVldWUgPSBzZXJpYWxpemVGdW5jdGlvbihmbGF0dGVuKGdyZWVkeVF1ZXVlKSk7XG4gICAgICB9XG4gICAgICBjb25zdCBncmVlZHlRdWV1ZUxlbmd0aCA9IGdyZWVkeVF1ZXVlLnJlZHVjZShmdW5jdGlvbiAobGVuZ3RoLCBhcnJheSkge1xuICAgICAgICByZXR1cm4gbGVuZ3RoICsgYXJyYXkubGVuZ3RoO1xuICAgICAgfSwgMCk7XG4gICAgICBpZiAoaXRlcmF0aW9uU2NvcmUgPT09IGdyZWVkeVF1ZXVlTGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBiZXN0R3JlZWR5UXVldWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXN0R3JlZWR5UXVldWU7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbiBpdGVyYXRpdmVHcmVlZHlBbGdvcml0aG0oX3gsIF94MiwgX3gzKSB7XG4gICAgcmV0dXJuIF9yZWYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn0pKCk7XG5cbmZ1bmN0aW9uIF9hc3luY1RvR2VuZXJhdG9yKGZuKSB7IHJldHVybiBmdW5jdGlvbiAoKSB7IHZhciBnZW4gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyBmdW5jdGlvbiBzdGVwKGtleSwgYXJnKSB7IHRyeSB7IHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTsgdmFyIHZhbHVlID0gaW5mby52YWx1ZTsgfSBjYXRjaCAoZXJyb3IpIHsgcmVqZWN0KGVycm9yKTsgcmV0dXJuOyB9IGlmIChpbmZvLmRvbmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0gZWxzZSB7IHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7IHN0ZXAoXCJuZXh0XCIsIHZhbHVlKTsgfSwgZnVuY3Rpb24gKGVycikgeyBzdGVwKFwidGhyb3dcIiwgZXJyKTsgfSk7IH0gfSByZXR1cm4gc3RlcChcIm5leHRcIik7IH0pOyB9OyB9XG5cbm1vZHVsZS5leHBvcnRzID0geyBzb2x2ZTogaXRlcmF0aXZlR3JlZWR5QWxnb3JpdGhtIH07XG5cbmZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXlzKSB7XG4gIHJldHVybiBhcnJheXMucmVkdWNlKChhMSwgYTIpID0+IGExLmNvbmNhdChhMiksIFtdKTtcbn0iLCJ2YXIgYnVuZGxlRm4gPSBhcmd1bWVudHNbM107XG52YXIgc291cmNlcyA9IGFyZ3VtZW50c1s0XTtcbnZhciBjYWNoZSA9IGFyZ3VtZW50c1s1XTtcblxudmFyIHN0cmluZ2lmeSA9IEpTT04uc3RyaW5naWZ5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgb3B0aW9ucykge1xuICAgIHZhciB3a2V5O1xuICAgIHZhciBjYWNoZUtleXMgPSBPYmplY3Qua2V5cyhjYWNoZSk7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNhY2hlS2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGtleSA9IGNhY2hlS2V5c1tpXTtcbiAgICAgICAgdmFyIGV4cCA9IGNhY2hlW2tleV0uZXhwb3J0cztcbiAgICAgICAgLy8gVXNpbmcgYmFiZWwgYXMgYSB0cmFuc3BpbGVyIHRvIHVzZSBlc21vZHVsZSwgdGhlIGV4cG9ydCB3aWxsIGFsd2F5c1xuICAgICAgICAvLyBiZSBhbiBvYmplY3Qgd2l0aCB0aGUgZGVmYXVsdCBleHBvcnQgYXMgYSBwcm9wZXJ0eSBvZiBpdC4gVG8gZW5zdXJlXG4gICAgICAgIC8vIHRoZSBleGlzdGluZyBhcGkgYW5kIGJhYmVsIGVzbW9kdWxlIGV4cG9ydHMgYXJlIGJvdGggc3VwcG9ydGVkIHdlXG4gICAgICAgIC8vIGNoZWNrIGZvciBib3RoXG4gICAgICAgIGlmIChleHAgPT09IGZuIHx8IGV4cCAmJiBleHAuZGVmYXVsdCA9PT0gZm4pIHtcbiAgICAgICAgICAgIHdrZXkgPSBrZXk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICghd2tleSkge1xuICAgICAgICB3a2V5ID0gTWF0aC5mbG9vcihNYXRoLnBvdygxNiwgOCkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygxNik7XG4gICAgICAgIHZhciB3Y2FjaGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYWNoZUtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gY2FjaGVLZXlzW2ldO1xuICAgICAgICAgICAgd2NhY2hlW2tleV0gPSBrZXk7XG4gICAgICAgIH1cbiAgICAgICAgc291cmNlc1t3a2V5XSA9IFtcbiAgICAgICAgICAgIEZ1bmN0aW9uKFsncmVxdWlyZScsJ21vZHVsZScsJ2V4cG9ydHMnXSwgJygnICsgZm4gKyAnKShzZWxmKScpLFxuICAgICAgICAgICAgd2NhY2hlXG4gICAgICAgIF07XG4gICAgfVxuICAgIHZhciBza2V5ID0gTWF0aC5mbG9vcihNYXRoLnBvdygxNiwgOCkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygxNik7XG5cbiAgICB2YXIgc2NhY2hlID0ge307IHNjYWNoZVt3a2V5XSA9IHdrZXk7XG4gICAgc291cmNlc1tza2V5XSA9IFtcbiAgICAgICAgRnVuY3Rpb24oWydyZXF1aXJlJ10sIChcbiAgICAgICAgICAgIC8vIHRyeSB0byBjYWxsIGRlZmF1bHQgaWYgZGVmaW5lZCB0byBhbHNvIHN1cHBvcnQgYmFiZWwgZXNtb2R1bGVcbiAgICAgICAgICAgIC8vIGV4cG9ydHNcbiAgICAgICAgICAgICd2YXIgZiA9IHJlcXVpcmUoJyArIHN0cmluZ2lmeSh3a2V5KSArICcpOycgK1xuICAgICAgICAgICAgJyhmLmRlZmF1bHQgPyBmLmRlZmF1bHQgOiBmKShzZWxmKTsnXG4gICAgICAgICkpLFxuICAgICAgICBzY2FjaGVcbiAgICBdO1xuXG4gICAgdmFyIHdvcmtlclNvdXJjZXMgPSB7fTtcbiAgICByZXNvbHZlU291cmNlcyhza2V5KTtcblxuICAgIGZ1bmN0aW9uIHJlc29sdmVTb3VyY2VzKGtleSkge1xuICAgICAgICB3b3JrZXJTb3VyY2VzW2tleV0gPSB0cnVlO1xuXG4gICAgICAgIGZvciAodmFyIGRlcFBhdGggaW4gc291cmNlc1trZXldWzFdKSB7XG4gICAgICAgICAgICB2YXIgZGVwS2V5ID0gc291cmNlc1trZXldWzFdW2RlcFBhdGhdO1xuICAgICAgICAgICAgaWYgKCF3b3JrZXJTb3VyY2VzW2RlcEtleV0pIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlU291cmNlcyhkZXBLZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHNyYyA9ICcoJyArIGJ1bmRsZUZuICsgJykoeydcbiAgICAgICAgKyBPYmplY3Qua2V5cyh3b3JrZXJTb3VyY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ2lmeShrZXkpICsgJzpbJ1xuICAgICAgICAgICAgICAgICsgc291cmNlc1trZXldWzBdXG4gICAgICAgICAgICAgICAgKyAnLCcgKyBzdHJpbmdpZnkoc291cmNlc1trZXldWzFdKSArICddJ1xuICAgICAgICAgICAgO1xuICAgICAgICB9KS5qb2luKCcsJylcbiAgICAgICAgKyAnfSx7fSxbJyArIHN0cmluZ2lmeShza2V5KSArICddKSdcbiAgICA7XG5cbiAgICB2YXIgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMIHx8IHdpbmRvdy5tb3pVUkwgfHwgd2luZG93Lm1zVVJMO1xuXG4gICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbc3JjXSwgeyB0eXBlOiAndGV4dC9qYXZhc2NyaXB0JyB9KTtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmJhcmUpIHsgcmV0dXJuIGJsb2I7IH1cbiAgICB2YXIgd29ya2VyVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICB2YXIgd29ya2VyID0gbmV3IFdvcmtlcih3b3JrZXJVcmwpO1xuICAgIHdvcmtlci5vYmplY3RVUkwgPSB3b3JrZXJVcmw7XG4gICAgcmV0dXJuIHdvcmtlcjtcbn07XG4iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge1xuICB1cGRhdGVBdmFpbGFibGVTcGFjZSxcbiAgcHJvbW90ZUxhYmVsVG9SZWN0YW5nbGUsXG4gIGNvbXB1dGVJbml0aWFsQXZhaWxhYmVTcGFjZXMsXG4gIHJlc2V0QXZhaWxhYmxlU3BhY2UsXG4gIHVwZGF0ZU1pbmltYSxcbiAgdHJhbnNsYXRlTGFiZWxcbn1cblxuY29uc3QgbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL2xhYmVsLXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKS5sYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLnJheVJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgbXVsdGlJbnRlcnZhbCA9IHJlcXVpcmUoJy4vbXVsdGktaW50ZXJ2YWwnKS5tdWx0aUludGVydmFsXG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuLypcbiBBbiBleHRlbmRlZCBwb2ludCBtYXkgY29udGFpbiB0aGUgZm9sbG93aW5nXG4gIHJheXMgYSBjb2xsZWN0aW9uIG9mIHJheXMgc3RhcnRpbmcgZnJvbSB0aGUgcG9pbnQgYXMgd2VsbCBhcyB0aGUgaW50ZXJ2YWxzIHdoZXJlIHRoZXkgYXJlIGFsbG93ZWRcbiAgbGFiZWwgaW4gY2FzZSB0aGUgbGFiZWwgaXMgbm90IHlldCBzZXR0bGVkXG4gIHJlY3RhbmdsZSBpbiBjYXNlIHRoZSBsYWJlbCBpcyBzZXR0bGVkXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZUF2YWlsYWJsZVNwYWNlIChleHRlbmRlZFBvaW50KSB7XG4gIHZhciByYXlzID0gZXh0ZW5kZWRQb2ludC5yYXlzXG4gIHZhciBtZWFzdXJlID0gMFxuICBmb3IgKGxldCByYXkgb2YgcmF5cykge1xuICAgIGxldCByYXlNZWFzdXJlID0gcmF5LmF2YWlsYWJsZS5tZWFzdXJlKClcbiAgICByYXkuYXZhaWxhYmxlTWVhc3VyZSA9IHJheU1lYXN1cmVcbiAgICBtZWFzdXJlICs9IHJheU1lYXN1cmVcbiAgfVxuICBleHRlbmRlZFBvaW50LmF2YWlsYWJsZU1lYXN1cmUgPSBtZWFzdXJlXG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVJbml0aWFsQXZhaWxhYmVTcGFjZXMgKGV4dGVuZGVkUG9pbnRzLCBwYXJhbXMpIHtcbiAgY29uc3QgcmFkaXVzID0gcGFyYW1zLnJhZGl1c1xuICBjb25zdCBiYm94ID0gcGFyYW1zLmJib3hcbiAgZm9yIChsZXQgcGkgb2YgZXh0ZW5kZWRQb2ludHMpIHtcbiAgICBmb3IgKGxldCByaWogb2YgcGkucmF5cykge1xuICAgICAgcmlqLmluaXRpYWxseUF2YWlsYWJsZSA9IG11bHRpSW50ZXJ2YWwoW2ludGVydmFsKDAsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSldKVxuICAgICAgZm9yIChsZXQgcGsgb2YgZXh0ZW5kZWRQb2ludHMpIHtcbiAgICAgICAgY29uc3QgcmVjdGFuZ2xlID0ge3RvcDogcGsucG9zaXRpb24ueSArIHJhZGl1cywgYm90dG9tOiBway5wb3NpdGlvbi55IC0gcmFkaXVzLCBsZWZ0OiBway5wb3NpdGlvbi54IC0gcmFkaXVzLCByaWdodDogcGsucG9zaXRpb24ueCArIHJhZGl1cywgd2lkdGg6IDIgKiByYWRpdXMsIGhlaWdodDogMiAqIHJhZGl1c31cbiAgICAgICAgcmlqLmluaXRpYWxseUF2YWlsYWJsZS5yZW1vdmUobGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocmVjdGFuZ2xlLCBwaS5sYWJlbCwgcmlqLnZlY3RvciwgcGkucG9zaXRpb24pKVxuICAgICAgICBpZiAocGkgIT09IHBrKSB7XG4gICAgICAgICAgcmlqLmluaXRpYWxseUF2YWlsYWJsZS5yZW1vdmUocmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHJlY3RhbmdsZSwgcmlqLnZlY3RvciwgcGkucG9zaXRpb24pKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYmJveCkge1xuICAgICAgICBjb25zdCBsYWJlbENvbnRhaW5lZEludGVydmFsID0gbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24oe3RvcDogLWJib3gudG9wIC0gcGkubGFiZWwuaGVpZ2h0LCBib3R0b206IC1iYm94LmJvdHRvbSArIHBpLmxhYmVsLmhlaWdodCwgbGVmdDogYmJveC5sZWZ0ICsgcGkubGFiZWwud2lkdGgsIHJpZ2h0OiBiYm94LnJpZ2h0IC0gcGkubGFiZWwud2lkdGgsIHdpZHRoOiBiYm94LndpZHRoIC0gMiAqIHBpLmxhYmVsLndpZHRoLCBoZWlnaHQ6IGJib3guaGVpZ2h0IC0gMiAqIHBpLmxhYmVsLmhlaWdodH0sIHBpLmxhYmVsLCByaWoudmVjdG9yLCBwaS5wb3NpdGlvbilcbiAgICAgICAgLy8gV2FudCBsYWJlbHMgaW5zaWRlIG9mIHRoZSBncmFwaFxuICAgICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlLnJlbW92ZShpbnRlcnZhbChsYWJlbENvbnRhaW5lZEludGVydmFsLmVuZCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSlcbiAgICAgIH1cbiAgICAgIHJpai5hdmFpbGFibGUgPSByaWouaW5pdGlhbGx5QXZhaWxhYmxlLmNsb25lKClcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzZXRBdmFpbGFibGVTcGFjZSAoZXh0ZW5kZWRQb2ludCkge1xuICBmb3IgKGxldCByaWogb2YgZXh0ZW5kZWRQb2ludC5yYXlzKSB7XG4gICAgcmlqLmF2YWlsYWJsZSA9IHJpai5pbml0aWFsbHlBdmFpbGFibGUuY2xvbmUoKVxuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZU1pbmltYSAoZXh0ZW5kZWRQb2ludCkge1xuICB2YXIgcmF5cyA9IGV4dGVuZGVkUG9pbnQucmF5c1xuICBmb3IgKGxldCByYXkgb2YgcmF5cykge1xuICAgIHJheS5taW5pbXVtID0gcmF5LmF2YWlsYWJsZS5nZXRNaW4oKVxuICB9XG59XG5cbmZ1bmN0aW9uIHByb21vdGVMYWJlbFRvUmVjdGFuZ2xlIChleHRlbmRlZFBvaW50LCB2aSkge1xuICBleHRlbmRlZFBvaW50LnJlY3RhbmdsZSA9IHRyYW5zbGF0ZUxhYmVsKGV4dGVuZGVkUG9pbnQsIHZpKVxuICBleHRlbmRlZFBvaW50LnNlZ21lbnQgPSB7eDogdmkueCwgeTogdmkueX1cbn1cblxuZnVuY3Rpb24gdHJhbnNsYXRlTGFiZWwgKGV4dGVuZGVkUG9pbnQsIHZpKSB7XG4gIGNvbnN0IHBvaW50ID0gZXh0ZW5kZWRQb2ludC5wb3NpdGlvblxuICBjb25zdCBsYWJlbCA9IGV4dGVuZGVkUG9pbnQubGFiZWxcbiAgcmV0dXJuIHtcbiAgICBoZWlnaHQ6IGxhYmVsLmhlaWdodCxcbiAgICB3aWR0aDogbGFiZWwud2lkdGgsXG4gICAgdG9wOiBwb2ludC55ICsgdmkueSArIGxhYmVsLmhlaWdodCAvIDIgKyBsYWJlbC5vZmZzZXRZLFxuICAgIGJvdHRvbTogcG9pbnQueSArIHZpLnkgLSBsYWJlbC5oZWlnaHQgLyAyICsgbGFiZWwub2Zmc2V0WSxcbiAgICBsZWZ0OiBwb2ludC54ICsgdmkueCAtIGxhYmVsLndpZHRoIC8gMiArIGxhYmVsLm9mZnNldFgsXG4gICAgcmlnaHQ6IHBvaW50LnggKyB2aS54ICsgbGFiZWwud2lkdGggLyAyICsgbGFiZWwub2Zmc2V0WFxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge2ZpbmRCZXN0UmF5fVxuXG5jb25zdCBleHRlbmRlZFBvaW50TWV0aG9kcyA9IHJlcXVpcmUoJy4vZXh0ZW5kZWQtcG9pbnQtbWV0aG9kcycpXG5jb25zdCBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLmxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCBsYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL2xhYmVsLXNlZ21lbnQtaW50ZXJzZWN0aW9uJykubGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uXG5jb25zdCByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykucmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCByYXlTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktc2VnbWVudC1pbnRlcnNlY3Rpb24nKS5yYXlTZWdtZW50SW50ZXJzZWN0aW9uXG5jb25zdCBtdWx0aUludGVydmFsID0gcmVxdWlyZSgnLi9tdWx0aS1pbnRlcnZhbCcpLm11bHRpSW50ZXJ2YWxcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbmFzeW5jIGZ1bmN0aW9uIGZpbmRCZXN0UmF5IChwb2ludHNUb0xhYmVsLCBwb2ludHNOb3RUb0xhYmVsKSB7XG4gIC8vIFdlIGZvbGxvdyB0aGUgYXJ0aWNsZSBwYWdlIDQgQWxnb3JpdGhtIDFcbiAgdmFyIFAgPSBwb2ludHNUb0xhYmVsXG4gIHZhciBQMCA9IHBvaW50c05vdFRvTGFiZWwuY29uY2F0KHBvaW50c1RvTGFiZWwpXG4gIC8vIGludCBQIG1pbiBpbiB0aGUgYXJ0aWNsZVxuICB2YXIgbWluaW11bUF2YWlsYWJsZVNwYWNlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG4gIHZhciByYmVzdFxuICB2YXIgVmJlc3RcbiAgdmFyIHBiZXN0IC8vIFRoaXMgaXMgbm90IGluIHRoZSBvcmlnaW5hbCBhbGdvcml0aG0gYnV0IGFsbG93cyB0byBlYXNpbHkgZmluZCB0aGUgY29ycmVzcG9uZGluZyBwb2ludFxuICBQMC5mb3JFYWNoKHAgPT4gZXh0ZW5kZWRQb2ludE1ldGhvZHMudXBkYXRlQXZhaWxhYmxlU3BhY2UocCkpXG4gIFAuZm9yRWFjaChwID0+IGV4dGVuZGVkUG9pbnRNZXRob2RzLnVwZGF0ZU1pbmltYShwKSlcbiAgY29uc3QgcGkgPSBQLnJlZHVjZSgoaSwgaikgPT4gaS5hdmFpbGFibGVNZWFzdXJlIDwgai5hdmFpbGFibGVNZWFzdXJlID8gaSA6IGopXG4gIGxldCBSID0gcGkucmF5cy5maWx0ZXIociA9PiByLmF2YWlsYWJsZU1lYXN1cmUgPiAwKVxuICByaWpsb29wOiBmb3IgKGxldCByaWogb2YgUikge1xuICAgIGxldCBWaWogPSBbXVxuICAgIGxldCBzZWdtZW50ID0ge3g6IHJpai52ZWN0b3IueCAqIHJpai5taW5pbXVtLCB5OiByaWoudmVjdG9yLnkgKiByaWoubWluaW11bX1cbiAgICBjb25zdCByZWN0YW5nbGUgPSBleHRlbmRlZFBvaW50TWV0aG9kcy50cmFuc2xhdGVMYWJlbChwaSwgc2VnbWVudClcbiAgICBmb3IgKGxldCBwayBvZiBQMCkge1xuICAgICAgaWYgKHBrID09PSBwaSkgY29udGludWVcbiAgICAgIC8vIE5vIHNlbnNlIHRvIHdhaXQgZm9yIHRoZSBpbnRlcnNlY3Rpb24gaWYgcmJlc3QgaXMgZGVmaW5lZFxuXG4gICAgICAvLyBpbnQgcGtcbiAgICAgIGxldCBhdmFpbGFibGVTcGFjZSA9IHBrLmF2YWlsYWJsZU1lYXN1cmVcbiAgICAgIC8vIE5vdCBkb2luZyB0aGUgcHJlaW50ZXJzZWN0aW9uIGhlcmUuIFNvbWV0aGluZyBmaXNoeSBpbiB0aGUgYXJ0aWNsZSwgaWYgcHJlaW50ZXJzZWN0IGlzIGVtcHR5IHRoZW4gIGludGVncmFsIHBrLSBpcyAwIHdoaWNoIGRvZXMgbm90IG1ha2UgbXVjaCBzZW5zZVxuICAgICAgZm9yIChsZXQgcmtsIG9mIHBrLnJheXMpIHtcbiAgICAgICAgbGV0IGxhYmVsSW50ZXJzZWN0aW9uXG4gICAgICAgIGxldCBzZWdtZW50SW50ZXJzZWN0aW9uXG4gICAgICAgIC8vIFdlIGhhdmUgc3BsaXQgbGFiZWwgcmVjdGFuZ2xlIGludGVyc2VjdGlvbiBpbnRvIHR3byBhbGdvcml0aG1zLCBsYWJlbCByZWN0YW5nbGUgYW5kIGxhYmVsIHNlZ21lbnQuIFRob3NlIHR3byBpbnRlcnZhbHMgc2hvdWxkIGludGVyc2VjdCBzaW5jZSB0aGUgc2VnbWVudCBpbnRlcnNlY3RzIHRoZSByZWN0YW5nbGUsIHNvIHdlIGNhbiBjb2FsZXNjZSB0aGUgaW50ZXJ2YWxzXG4gICAgICAgIGNvbnN0IGxhYmVsSW50ZXJ2YWwgPSBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbihyZWN0YW5nbGUsIHBrLmxhYmVsLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3Qgc2VnbWVudEludGVydmFsID0gbGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uKHBpLnBvc2l0aW9uLCBzZWdtZW50LCBway5sYWJlbCwgcmtsLnZlY3RvciwgcGsucG9zaXRpb24pXG4gICAgICAgIGNvbnN0IHJheUludGVydmFsID0gcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHJlY3RhbmdsZSwgcmtsLnZlY3RvciwgcGsucG9zaXRpb24pXG4gICAgICAgIGNvbnN0IHJheVNlZ21lbnRJbnRlcnZhbCA9IHJheVNlZ21lbnRJbnRlcnNlY3Rpb24ocGkucG9zaXRpb24sIHNlZ21lbnQsIHBrLnBvc2l0aW9uLCBya2wudmVjdG9yKVxuICAgICAgICBsYWJlbEludGVyc2VjdGlvbiA9IGxhYmVsSW50ZXJ2YWwuY29hbGVzY2VJblBsYWNlKHJheUludGVydmFsKVxuICAgICAgICBzZWdtZW50SW50ZXJzZWN0aW9uID0gc2VnbWVudEludGVydmFsLmNvYWxlc2NlSW5QbGFjZShyYXlTZWdtZW50SW50ZXJ2YWwpXG4gICAgICAgIGlmICghbGFiZWxJbnRlcnNlY3Rpb24uZW1wdHkgfHwgIXNlZ21lbnRJbnRlcnNlY3Rpb24uZW1wdHkpIHtcbiAgICAgICAgICBhdmFpbGFibGVTcGFjZSAtPSBya2wuYXZhaWxhYmxlLm1lYXN1cmVNdWx0aXBsZUludGVyc2VjdGlvbihtdWx0aUludGVydmFsLmNvYWxlc2NlKGxhYmVsSW50ZXJzZWN0aW9uLCBzZWdtZW50SW50ZXJzZWN0aW9uKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gVGhpcyByYXkgaXMgbm90IGdvb2QgYmVjYXVzZSB3ZSB0cnkgdG8gbWF4aW1pemUgdGhlIG1pbmltdW1cbiAgICAgIGlmIChyYmVzdCAmJiBhdmFpbGFibGVTcGFjZSA8IG1pbmltdW1BdmFpbGFibGVTcGFjZSkge1xuICAgICAgICBjb250aW51ZSByaWpsb29wXG4gICAgICB9XG4gICAgICBWaWoucHVzaChhdmFpbGFibGVTcGFjZSlcbiAgICB9XG4gICAgVmlqLnNvcnQoKGksIGopID0+IGkgLSBqKSAvLyBvcmRlciB0byBjb21wYXJlIGluIGxleGljb2dyYXBoaWNhbCBvcmRlclxuICAgIGlmICghVmJlc3QgfHwgdXRpbHMuY29tcGFyZUFycmF5c0xleGljb2dyYXBoaWNhbGx5KFZpaiwgVmJlc3QpIDwgMCkge1xuICAgICAgcmJlc3QgPSByaWpcbiAgICAgIFZiZXN0ID0gVmlqXG4gICAgICBtaW5pbXVtQXZhaWxhYmxlU3BhY2UgPSBWaWoucmVkdWNlKChpLCBqKSA9PiBNYXRoLm1pbihpLCBqKSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxuICAgICAgcGJlc3QgPSBwaVxuICAgIH1cbiAgfVxuICAvLyBXZSBuZWVkIHRvIHJldHVybiBpbnRlcnNlY3Rpb25EYXRhIGJlY2F1c2UgdGhlIHJlZmVyZW5jZSBoYXMgYmVlbiBuZXV0ZXJlZCBpbiBmaW5kIHJheSBpbnRlcnNlY3Rpb25cbiAgcmV0dXJuIHtyYmVzdDogcmJlc3QsIHBiZXN0OiBwYmVzdH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge2ludGVydmFsfVxuZnVuY3Rpb24gSW50ZXJ2YWwgKHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIC8vIGNvbnNvbGUuZXJyb3IoJ1dyb25nIG9yZGVyIG9mIGludGVydmFsJywgc3RhcnQsIGVuZClcbiAgICB0aGlzLmVtcHR5ID0gdHJ1ZVxuICAgIHRoaXMuc3RhcnQgPSBudWxsXG4gICAgdGhpcy5lbmQgPSBudWxsXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICB0aGlzLnN0YXJ0ID0gc3RhcnRcbiAgdGhpcy5lbmQgPSBlbmRcbiAgcmV0dXJuIHRoaXNcbn1cblxuSW50ZXJ2YWwuZW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgSW50ZXJ2YWwoMSwgLTEpXG59XG5JbnRlcnZhbC5wcm90b3R5cGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24gKGludGVydmFsKSB7XG4gIGlmICh0aGlzLmVtcHR5IHx8IGludGVydmFsLmVtcHR5KSByZXR1cm4gSW50ZXJ2YWwuZW1wdHkoKVxuICByZXR1cm4gbmV3IEludGVydmFsKE1hdGgubWF4KGludGVydmFsLnN0YXJ0LCB0aGlzLnN0YXJ0KSwgTWF0aC5taW4oaW50ZXJ2YWwuZW5kLCB0aGlzLmVuZCkpXG59XG5cbkludGVydmFsLnByb3RvdHlwZS5jb2FsZXNjZSA9IGZ1bmN0aW9uIChpbnRlcnZhbCkge1xuICBpZiAodGhpcy5lbXB0eSkgcmV0dXJuIGludGVydmFsXG4gIGlmIChpbnRlcnZhbC5lbXB0eSkgcmV0dXJuIHRoaXNcbiAgaWYgKGludGVydmFsLnN0YXJ0ID4gdGhpcy5lbmQgfHwgdGhpcy5zdGFydCA+IGludGVydmFsLmVuZCkge1xuICAgIC8vIFdlIHByb2JhYmx5IG5lZWQgYSBtdWx0aSBpbnRlcnZhbCBpbiB0aGlzIGNhc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjb2FsbGVzY2UnKVxuICB9XG4gIHJldHVybiBuZXcgSW50ZXJ2YWwoTWF0aC5taW4oaW50ZXJ2YWwuc3RhcnQsIHRoaXMuc3RhcnQpLCBNYXRoLm1heChpbnRlcnZhbC5lbmQsIHRoaXMuZW5kKSlcbn1cbi8vIFRPRE8gcmVtb3ZlIGNvYWxlc2NlIGFuZCByZW5hbWUgdGhpcyBtZXRob2QgdG8gY29hbGVzY2Vcbi8vIG1vZGlmaWVzIGludGVydmFsXG5JbnRlcnZhbC5wcm90b3R5cGUuY29hbGVzY2VJblBsYWNlID0gZnVuY3Rpb24gKGludGVydmFsKSB7XG4gIGlmICh0aGlzLmVtcHR5KSByZXR1cm4gaW50ZXJ2YWxcbiAgaWYgKGludGVydmFsLmVtcHR5KSByZXR1cm4gdGhpc1xuICBpZiAoaW50ZXJ2YWwuc3RhcnQgPiB0aGlzLmVuZCB8fCB0aGlzLnN0YXJ0ID4gaW50ZXJ2YWwuZW5kKSB7XG4gICAgLy8gV2UgcHJvYmFibHkgbmVlZCBhIG11bHRpIGludGVydmFsIGluIHRoaXMgY2FzZVxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNvYWxsZXNjZScpXG4gIH1cbiAgdGhpcy5zdGFydCA9IE1hdGgubWluKGludGVydmFsLnN0YXJ0LCB0aGlzLnN0YXJ0KVxuICB0aGlzLmVuZCA9IE1hdGgubWF4KGludGVydmFsLmVuZCwgdGhpcy5lbmQpXG4gIHJldHVybiB0aGlzXG59XG5JbnRlcnZhbC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmVtcHR5KSByZXR1cm4gSW50ZXJ2YWwuZW1wdHkoKVxuICByZXR1cm4gbmV3IEludGVydmFsKHRoaXMuc3RhcnQsIHRoaXMuZW5kKVxufVxuSW50ZXJ2YWwucHJvdG90eXBlLm1lYXN1cmUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmVtcHR5KSByZXR1cm4gMFxuICByZXR1cm4gTWF0aC5wb3coMiwgLXRoaXMuc3RhcnQpIC0gTWF0aC5wb3coMiwgLXRoaXMuZW5kKVxufVxuZnVuY3Rpb24gaW50ZXJ2YWwoc3RhcnQsIGVuZCkge1xuICByZXR1cm4gbmV3IEludGVydmFsKHN0YXJ0LCBlbmQpXG59XG5pbnRlcnZhbC5lbXB0eSA9IEludGVydmFsLmVtcHR5IiwiJ3VzZSBzdHJpY3QnXG52YXIgaW50ZXJ2YWwgPSByZXF1aXJlKCcuL2ludGVydmFsJykuaW50ZXJ2YWxcbm1vZHVsZS5leHBvcnRzID0ge2xhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9ufVxuXG4vKiBSZWN0YW5nbGUgbGsgaW50ZXJzZWN0cyBsYWJlbCBsaSBtb3ZpbmcgZnJvbSBwaSB3aXRoIHZlY3RvciB2aSBpbiBwb3NpdGl2ZSB0aW1lICovXG4vLyBDb21wYXJlIGNlbnRlcnMgb2YgdGhlIGxhYmVscyB0aGV5IG11c3QgYmUgd2l0aGluIGxpLmhlaWdodCAvIDIgKyBsay5oZWlnaHQgLyAyIGluIHRoZSB2ZXJ0aWNhbCB2YXJpYWJsZSBhbmQgbGkud2lkdGggLyAyICsgbGsud2lkdGggLyAyIGluIHRoZSBob3Jpem9udGFsIHZhcmlhYmxlLCBpLmUgc29sdmUgfGxrLnggLSAocGsueCArIHQgKiB2LngpfCA8IGRcbmZ1bmN0aW9uIGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uIChsaywgbGksIHZpLCBwaSkge1xuICBsZXQgbWluID0gMFxuICBsZXQgbWF4ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG4gIGlmICh2aS55ICE9PSAwKSB7XG4gICAgY29uc3QgZmlyc3RJbnRlcnNlY3Rpb24gPSAobGsuaGVpZ2h0IC8gMiArIGxpLmhlaWdodCAvIDIgLSBsaS5vZmZzZXRZICsgKGxrLnRvcCArIGxrLmJvdHRvbSkgLyAyIC0gcGkueSkgLyB2aS55XG4gICAgY29uc3Qgc2Vjb25kSW50ZXJzZWN0aW9uID0gKC1say5oZWlnaHQgLyAyIC0gbGkuaGVpZ2h0IC8gMiAtIGxpLm9mZnNldFkgKyAobGsudG9wICsgbGsuYm90dG9tKSAvIDIgLSBwaS55KSAvIHZpLnlcbiAgICAvLyBNdWx0aXBseWluZyBieSBhIG5lZ2F0aXZlIHNpZ24gcmV2ZXJzZXMgYW4gaW5lcXVhbGl0eVxuICAgIGlmICh2aS55ID4gMCkge1xuICAgICAgbWF4ID0gTWF0aC5taW4obWF4LCBmaXJzdEludGVyc2VjdGlvbilcbiAgICAgIG1pbiA9IE1hdGgubWF4KG1pbiwgc2Vjb25kSW50ZXJzZWN0aW9uKVxuICAgIH0gZWxzZSB7XG4gICAgICBtaW4gPSBNYXRoLm1heChtaW4sIGZpcnN0SW50ZXJzZWN0aW9uKVxuICAgICAgbWF4ID0gTWF0aC5taW4obWF4LCBzZWNvbmRJbnRlcnNlY3Rpb24pXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIHZlY3RvciBpcyB2ZXJ0aWNhbCBhbmQgdGhleSB3aWxsIG5ldmVyIGludGVyc2VjdFxuICAgIGlmIChsaS5vZmZzZXRZICsgcGkueSAtIChsay50b3AgKyBsay5ib3R0b20pIC8gMiA+IGxrLmhlaWdodCAvIDIgKyBsaS5oZWlnaHQgLyAyKSByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICAgIGlmIChsaS5vZmZzZXRZICsgcGkueSAtIChsay50b3AgKyBsay5ib3R0b20pIC8gMiA8IC1say5oZWlnaHQgLyAyIC0gbGkuaGVpZ2h0IC8gMikgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgfVxuICBpZiAodmkueCAhPT0gMCkge1xuICAgIGNvbnN0IHRoaXJkSW50ZXJzZWN0aW9uID0gKGxrLndpZHRoIC8gMiArIGxpLndpZHRoIC8gMiArIChsay5yaWdodCArIGxrLmxlZnQpIC8gMiAtIHBpLnggLSBsaS5vZmZzZXRYKSAvIHZpLnhcbiAgICBjb25zdCBmb3VydGhJbnRlcnNlY3Rpb24gPSAoLWxrLndpZHRoIC8gMiAtIGxpLndpZHRoIC8gMiArIChsay5yaWdodCArIGxrLmxlZnQpIC8gMiAtIHBpLnggLSBsaS5vZmZzZXRYKSAvIHZpLnhcbiAgICBpZiAodmkueCA+IDApIHtcbiAgICAgIG1heCA9IE1hdGgubWluKG1heCwgdGhpcmRJbnRlcnNlY3Rpb24pXG4gICAgICBtaW4gPSBNYXRoLm1heChtaW4sIGZvdXJ0aEludGVyc2VjdGlvbilcbiAgICB9IGVsc2Uge1xuICAgICAgbWluID0gTWF0aC5tYXgobWluLCB0aGlyZEludGVyc2VjdGlvbilcbiAgICAgIG1heCA9IE1hdGgubWluKG1heCwgZm91cnRoSW50ZXJzZWN0aW9uKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAocGkueCArIGxpLm9mZnNldFggLSAobGsucmlnaHQgKyBsay5sZWZ0KSAvIDIgPiBsay53aWR0aCAvIDIgKyBsaS53aWR0aCAvIDIpIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gICAgaWYgKHBpLnggKyBsaS5vZmZzZXRYIC0gKGxrLnJpZ2h0ICsgbGsubGVmdCkgLyAyIDwgLWxrLndpZHRoIC8gMiAtIGxpLndpZHRoIC8gMikgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgfVxuXG4gIC8vIE9ubHkgaW50ZXJlc3RlZCBpbiBwb3NpdGl2ZSB2YWx1ZXNcbiAgcmV0dXJuIGludGVydmFsKG1pbiwgbWF4KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG4vLyBGaW5kIGludGVydmFsIGluIHdoaWNoIGFuIGludGVydmFsIGFuZCBhIHNlZ21lbnQgaW50ZXJzZWN0XG5tb2R1bGUuZXhwb3J0cyA9IHtsYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb259XG5cbnZhciBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vc2VnbWVudC1zZWdtZW50LWludGVyc2VjdGlvbicpLnNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uXG52YXIgaW50ZXJ2YWwgPSByZXF1aXJlKCcuL2ludGVydmFsJykuaW50ZXJ2YWxcblxuLy8gTGFiZWwgbGkgbW92ZXMgd2l0aCB2ZWN0b3IgdmkuIFdlIGZpbmQgdGhlIGludGVydmFsIGF0IHdoaWNoIGl0IGludGVyc2VjdHMgdGhlIHNlZ21lbnQgcGssIHZrLiBJZiBwayBpcyBjb250YWluZWQgdGhlbiB0aGUgaW50ZXJ2YWwgZ29lcyB0byBJTkZJTklUWVxuZnVuY3Rpb24gbGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uIChwaywgdmssIGxpLCB2aSwgcGkpIHtcbiAgLy8gdHJhbnNsYXRlIHNvIHdlIGNhbiBhc3N1bWUgdGhhdCBwb2ludCBpcyBpbiB0aGUgY2VudHJlXG4gIHBrID0ge3g6IHBrLnggLSBwaS54LCB5OiBway55IC0gcGkueX1cbiAgLy8gVE9ETyBoYW5kbGUgcGFyYWxsZWwgbGluZXNcbiAgLy8gVGhlIHRpbWUgaW50ZXJ2YWwgd2hlcmUgdGhleSBtZWV0IGlzIGNvbm5lY3RlZCBzbyBpdCBpcyBlbm91Z2ggdG8gZmluZCB0aGUgZW5kIHBvaW50cy4gVGhpcyBtdXN0IG9jY3VyIHdoZW4gZWl0aGVyIHRoZSBjb3JuZXJzIG9mIHRoZSBsYWJlbCBpbnRlcnNlY3Qgb3Igd2hlblxuICBjb25zdCBpbnRlcnNlY3Rpb25zID0gW11cbiAgLy8gdGhlIGVuZCBwb2ludHMgb2YgdGhlIHNlZ21lbnQgaW50ZXJzZWN0XG4gIGZvciAobGV0IHggb2YgWy1saS53aWR0aCAvIDIgKyBsaS5vZmZzZXRYLCBsaS53aWR0aCAvIDIgKyBsaS5vZmZzZXRYXSkge1xuICAgIGZvciAobGV0IHkgb2YgWy1saS5oZWlnaHQgLyAyICsgbGkub2Zmc2V0WSwgbGkuaGVpZ2h0IC8gMiArIGxpLm9mZnNldFldKSB7XG4gICAgICBsZXQgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24oe3gsIHl9LCB2aSwgcGssIHZrKVxuICAgICAgLy8gSW50ZXJzZWN0cyBpbnNpZGUgdGhlIHNlZ21lbnRcbiAgICAgIGlmIChpbnRlcnNlY3Rpb24gJiYgaW50ZXJzZWN0aW9uLnMgPj0gMCAmJiBpbnRlcnNlY3Rpb24ucyA8PSAxKSB7XG4gICAgICAgIGludGVyc2VjdGlvbnMucHVzaChpbnRlcnNlY3Rpb24udClcbiAgICAgIH1cblxuICAgICAgLy8gR2l2ZW4gYSBwb2ludCB0byB3ZSB0YWtlIHRoZSBzaWRlIGNvbWluZyBmcm9tIGl0IGluIGNvdW50ZXIgY2xvY2t3aXNlXG4gICAgICBsZXQgc2lkZVxuICAgICAgaWYgKHggKiB5IDwgMCkge1xuICAgICAgICBzaWRlID0ge3g6IDAsIHk6IC0yICogeX1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpZGUgPSB7eDogLTIgKiB4LCB5OiAwfVxuICAgICAgfVxuICAgICAgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24oe3gsIHl9LCBzaWRlLCBwaywgdmkpXG4gICAgICBpZiAoaW50ZXJzZWN0aW9uICYmIGludGVyc2VjdGlvbi50ID49IDAgJiYgaW50ZXJzZWN0aW9uLnQgPD0gMSkge1xuICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goLWludGVyc2VjdGlvbi5zKVxuICAgICAgICAvLy8vIFRoZSBzaWRlIGNvdmVycyB0aGUgcG9pbnQgaW4gdGhlIGZ1dHVyZVxuICAgICAgICAvL2lmIChpbnRlcnNlY3Rpb24ucyA8IDApIHtcbiAgICAgICAgLy8gIGludGVyc2VjdGlvbnMucHVzaChOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gICAgICAgIC8vfVxuICAgICAgfVxuICAgICAgaW50ZXJzZWN0aW9uID0gc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24oe3gsIHl9LCBzaWRlLCB7eDogcGsueCArIHZrLngsIHk6IHBrLnkgKyB2ay55fSwgdmkpXG4gICAgICBpZiAoaW50ZXJzZWN0aW9uICYmIGludGVyc2VjdGlvbi50ID49IDAgJiYgaW50ZXJzZWN0aW9uLnQgPD0gMSkge1xuICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goLWludGVyc2VjdGlvbi5zKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICB2YXIgbWluID0gaW50ZXJzZWN0aW9ucy5yZWR1Y2UoKGEsIGIpID0+IE1hdGgubWluKGEsIGIpLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gIHZhciBtYXggPSBpbnRlcnNlY3Rpb25zLnJlZHVjZSgoYSwgYikgPT4gTWF0aC5tYXgoYSwgYiksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSlcbiAgbWluID0gTWF0aC5tYXgobWluLCAwKVxuICByZXR1cm4gaW50ZXJ2YWwobWluLCBtYXgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHttYWluQWxnb3JpdGhtfVxuY29uc3Qgd29yayA9IHJlcXVpcmUoJ3dlYndvcmtpZnknKVxuY29uc3QgYWxnb3JpdGhtID0gd29yayhyZXF1aXJlKCcuL21haW4tYWxnb3JpdGhtLmpzJykpXG5jb25zdCBwcm9taXNlUmVzb2x1dGlvbnMgPSB7fVxuZnVuY3Rpb24gbWFpbkFsZ29yaXRobSAoZXh0ZW5kZWRQb2ludHMsIHBhcmFtcyA9IHt9KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgZXh0ZW5kZWRQb2ludHMgPSBleHRlbmRlZFBvaW50cy5tYXAocCA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogcC5pZCxcbiAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICB4OiBwLnBvc2l0aW9uLngsXG4gICAgICAgICAgeTogLXAucG9zaXRpb24ueSAvLyBUaGUgYWxnb3JpdGhtIGV4cGVjdHMgeSB0byBncm93IHVwd2FyZHNcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICBoZWlnaHQ6IHAubGFiZWwuaGVpZ2h0LFxuICAgICAgICAgIHdpZHRoOiBwLmxhYmVsLndpZHRoLFxuICAgICAgICAgIG9mZnNldFg6IHAubGFiZWwub2Zmc2V0WCB8fCAwLFxuICAgICAgICAgIG9mZnNldFk6IHAubGFiZWwub2Zmc2V0WSB8fCAwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIGNvbnN0IHByb2Nlc3NVVUlEID0gcGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApLnRvU3RyaW5nKCkgLy8gbm8gbmVlZCBmb3IgYW55dGhpbmcgZmFuY3lcbiAgICBhbGdvcml0aG0ucG9zdE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogJ3N0YXJ0JyxcbiAgICAgIGV4dGVuZGVkUG9pbnRzLFxuICAgICAgcGFyYW1zLFxuICAgICAgcHJvY2Vzc1VVSURcbiAgICB9KVxuICAgIHByb21pc2VSZXNvbHV0aW9uc1twcm9jZXNzVVVJRF0gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGV2ZW50LmRhdGEucmVzdWx0Lm1hcChwID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogcC5pZCxcbiAgICAgICAgICByZWN0YW5nbGU6IHtcbiAgICAgICAgICAgIGxlZnQ6IHAucmVjdGFuZ2xlLmxlZnQsXG4gICAgICAgICAgICByaWdodDogcC5yZWN0YW5nbGUucmlnaHQsXG4gICAgICAgICAgICB0b3A6IC1wLnJlY3RhbmdsZS50b3AsXG4gICAgICAgICAgICBib3R0b206IC1wLnJlY3RhbmdsZS5ib3R0b21cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICByZXR1cm4gcmVzb2x2ZShyZXN1bHQpXG4gICAgfVxuICB9KVxufVxuYWxnb3JpdGhtLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YVxuICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgIGNhc2UgJ2VuZCc6XG4gICAgICBlbmRFdmVudChldmVudClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoaXMgZXZlbnQgY2FzZSBzaG91bGQgbm90IGhhcHBlbicsIGRhdGEudHlwZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmRFdmVudCAoZXZlbnQpIHtcbiAgY29uc3Qge3Byb2Nlc3NVVUlEfSA9IGV2ZW50LmRhdGFcbiAgY29uc3QgY2FsbGJhY2sgPSBwcm9taXNlUmVzb2x1dGlvbnNbcHJvY2Vzc1VVSURdXG4gIGNhbGxiYWNrKGV2ZW50KVxuICBkZWxldGUgcHJvbWlzZVJlc29sdXRpb25zW3Byb2Nlc3NVVUlEXVxufSIsImxldCBOVU1CRVJfT0ZfUkFZU1xuLy8gQ2FsbGVkIGFzIHdlYndvcmtlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2VsZikge1xuICBjb25zdCBleHRlbmRlZFBvaW50TWV0aG9kcyA9IHJlcXVpcmUoJy4vZXh0ZW5kZWQtcG9pbnQtbWV0aG9kcycpXG4gIGNvbnN0IHJheUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LWludGVyc2VjdGlvbicpLnJheUludGVyc2VjdGlvblxuICBjb25zdCBpdGVyYXRpdmVHcmVlZHkgPSByZXF1aXJlKCdpdGVyYXRpdmUtZ3JlZWR5JylcbiAgaWYgKHR5cGVvZiBwb3N0TWVzc2FnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzZWxmLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGRhdGEgPSBldmVudC5kYXRhXG4gICAgICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgbGF1bmNoTWFpbkFsZ29yaXRobUZyb21FdmVudChldmVudClcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBhIHZhbGlkIGV2ZW50IHR5cGUnLCBkYXRhLnR5cGUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbGF1bmNoTWFpbkFsZ29yaXRobUZyb21FdmVudCAoZXZlbnQpIHtcbiAgICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YVxuICAgIGNvbnN0IGV4dGVuZGVkUG9pbnRzID0gZGF0YS5leHRlbmRlZFBvaW50c1xuICAgIGNvbnN0IHBhcmFtcyA9IGRhdGEucGFyYW1zXG4gICAgY29uc3QgcHJvY2Vzc1VVSUQgPSBkYXRhLnByb2Nlc3NVVUlEIC8vIHdlIHVzZSB0aGlzIGluIGNhc2UgdGhlIGFsZ29yaWhtIGlzIHJlcXVpcmVkIHNldmVyYWwgdGltZXNcbiAgICBtYWluQWxnb3JpdGhtKGV4dGVuZGVkUG9pbnRzLCBwYXJhbXMpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnZW5kJyxcbiAgICAgICAgICBwcm9jZXNzVVVJRCxcbiAgICAgICAgICByZXN1bHRcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBtYWluQWxnb3JpdGhtIChleHRlbmRlZFBvaW50cywgcGFyYW1zID0ge30pIHtcbiAgICBOVU1CRVJfT0ZfUkFZUyA9ICh0eXBlb2YgcGFyYW1zLk5VTUJFUl9PRl9SQVlTID09PSAnbnVtYmVyJykgPyBwYXJhbXMuTlVNQkVSX09GX1JBWVMgOiAzXG4gICAgY29uc3QgTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TID0gKHR5cGVvZiBwYXJhbXMuTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TID09PSAnbnVtYmVyJykgPyBwYXJhbXMuTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TIDogMVxuICAgIGNvbXB1dGVSYXlzKGV4dGVuZGVkUG9pbnRzKVxuICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLmNvbXB1dGVJbml0aWFsQXZhaWxhYmVTcGFjZXMoZXh0ZW5kZWRQb2ludHMsIHtyYWRpdXM6IHBhcmFtcy5yYWRpdXMgfHwgMiwgYmJveDogcGFyYW1zLmJib3h9KVxuICAgIGV4dGVuZGVkUG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcbiAgICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnJlc2V0QXZhaWxhYmxlU3BhY2UocClcbiAgICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnVwZGF0ZUF2YWlsYWJsZVNwYWNlKHApXG4gICAgfSlcbiAgICBjb25zdCBwb3NzaWJsZVBvaW50cyA9IGV4dGVuZGVkUG9pbnRzLmZpbHRlcihwID0+IHAuYXZhaWxhYmxlTWVhc3VyZSA+IDApXG4gICAgcmV0dXJuIGl0ZXJhdGl2ZUdyZWVkeS5zb2x2ZShyYXlJbnRlcnNlY3Rpb24sIHBvc3NpYmxlUG9pbnRzLCByZXNldEZ1bmN0aW9uLCB7c2VyaWFsaXplRnVuY3Rpb24sIE1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OU30pXG4gIH1cblxuICBmdW5jdGlvbiBjb21wdXRlUmF5cyAoZXh0ZW5kZWRQb2ludHMpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4dGVuZGVkUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgcGkgPSBleHRlbmRlZFBvaW50c1tpXVxuICAgICAgcGkucmF5cyA9IFtdXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IE5VTUJFUl9PRl9SQVlTOyBqKyspIHtcbiAgICAgICAgcGkucmF5cy5wdXNoKHtcbiAgICAgICAgICBpbmRleDogaSAqIE5VTUJFUl9PRl9SQVlTICogTlVNQkVSX09GX1JBWVMgKiA0ICsgaiAqIE5VTUJFUl9PRl9SQVlTICogNCxcbiAgICAgICAgICBzZWxmSW5kZXg6IGosXG4gICAgICAgICAgdmVjdG9yOiB7XG4gICAgICAgICAgICB4OiBNYXRoLnNpbigyICogTWF0aC5QSSAqIGogLyBOVU1CRVJfT0ZfUkFZUyksXG4gICAgICAgICAgICB5OiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGogLyBOVU1CRVJfT0ZfUkFZUylcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbi8vIEF0IGVhY2ggaXRlcmF0aW9uIG9mIGl0ZXJhdGl2ZSBncmVlZHkgaWYgdGhlIHNvbHV0aW9uIGlzIGJldHRlciB3ZSBzZXJpYWxpemUgd2hhdCB3ZSBvYnRhaW5lZFxuICBmdW5jdGlvbiBzZXJpYWxpemVGdW5jdGlvbiAoYXJyYXlPZlBvaW50cykge1xuICAgIC8vIFdoZW4gd2UgbGFiZWwgYSBwb2ludCB3ZSBwcm9tb3RlIGxhYmVsIHRvIHJlY3RhbmdsZSBhbmQgd2UgcmVzZXQgaXQgYXQgZWFjaCBpdGVyYXRpb25cbiAgICBjb25zdCBsYWJlbGVkUG9pbnRzID0gYXJyYXlPZlBvaW50cy5maWx0ZXIocG9pbnQgPT4gISFwb2ludC5yZWN0YW5nbGUpXG4gICAgLy8gVG8gc2VyaWFsaXplIHdlIG5lZWQgYW4gaWRcbiAgICByZXR1cm4gbGFiZWxlZFBvaW50cy5tYXAocG9pbnQgPT4geyByZXR1cm4ge2lkOiBwb2ludC5pZCwgcmVjdGFuZ2xlOiBPYmplY3QuYXNzaWduKHt9LCBwb2ludC5yZWN0YW5nbGUpfSB9KVxuICB9XG5cbi8vIEF0IGVhY2ggaXRlcmF0aW9uIG9mIGl0ZXJhdGl2ZSBncmVlZHkgd2UgcmVzZXQgdGhlIGNvbmRpdGlvbnNcbiAgZnVuY3Rpb24gcmVzZXRGdW5jdGlvbiAoZ2VuZXJhbGl6ZWRQb2ludCkge1xuICAgIGdlbmVyYWxpemVkUG9pbnQucmVjdGFuZ2xlID0gbnVsbFxuICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnJlc2V0QXZhaWxhYmxlU3BhY2UoZ2VuZXJhbGl6ZWRQb2ludClcbiAgfVxufVxuXG4iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge211bHRpSW50ZXJ2YWx9XG5jb25zdCBpbnRlcnZhbCA9IHJlcXVpcmUoJy4vaW50ZXJ2YWwnKS5pbnRlcnZhbFxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbi8vIERpc2pvaW50IHVuaW9uIG9mIHNldmVyYWwgaW50ZXJ2YWxzXG4vLyBpbnRlcnZhbHMgYXJyYXkgb2YgY29vcmRpbmF0ZXNcbmZ1bmN0aW9uIE11bHRpSW50ZXJ2YWwgKGludGVydmFscywgaXNDbG9uZSkge1xuICAvLyBOb3QgdmVyeSBuaWNlIGJ1dCBpdCBpcyBoYXJkIHRvIGNsb25lIGluIGpzXG4gIGlmIChpc0Nsb25lKSB7XG4gICAgdGhpcy5pbnRlcnZhbHMgPSBbLi4uaW50ZXJ2YWxzXVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgaWYgKCFBcnJheS5pc0FycmF5KGludGVydmFscykgfHwgaW50ZXJ2YWxzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMuaW50ZXJ2YWxzID0gW11cbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIHRoaXMuaW50ZXJ2YWxzID0gW11cbiAgdmFyIGNoZWNrZWRJbnRlcnZhbHMgPSBbXVxuICAvLyBTbyB3ZSBjYW4gY2hlY2sgaW50ZXJ2YWxcbiAgdmFyIGludGVydmFsQ29uc3RydWN0b3IgPSBpbnRlcnZhbCgwLCAxKS5jb25zdHJ1Y3RvclxuICBmb3IgKGxldCBteUludGVydmFsIG9mIGludGVydmFscykge1xuICAgIGlmICghbXlJbnRlcnZhbCBpbnN0YW5jZW9mIGludGVydmFsQ29uc3RydWN0b3IpIHtcbiAgICAgIHRoaXMuaW50ZXJ2YWxzID0gW11cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICAgIGlmICghbXlJbnRlcnZhbC5lbXB0eSkge1xuICAgICAgY2hlY2tlZEludGVydmFscy5wdXNoKG15SW50ZXJ2YWwuY2xvbmUoKSlcbiAgICB9XG4gIH1cblxuICBjaGVja2VkSW50ZXJ2YWxzLnNvcnQoKGkxLCBpMikgPT4gaTEuc3RhcnQgLSBpMi5zdGFydClcblxuICAvLyBOb3cgd2UgbmVlZCB0byBjb2FsZXNjZSBpbnRlcnZhbHMgaWYgbmVlZGVkXG4gIGxldCBuZXh0SW50ZXJ2YWwgPSBudWxsXG4gIGZvciAobGV0IG15SW50ZXJ2YWwgb2YgY2hlY2tlZEludGVydmFscykge1xuICAgIGlmIChuZXh0SW50ZXJ2YWwgPT09IG51bGwpIHtcbiAgICAgIG5leHRJbnRlcnZhbCA9IG15SW50ZXJ2YWxcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFuZXh0SW50ZXJ2YWwuaW50ZXJzZWN0KG15SW50ZXJ2YWwpLmVtcHR5KSB7XG4gICAgICAgIG5leHRJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UobXlJbnRlcnZhbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWxzLnB1c2gobmV4dEludGVydmFsLnN0YXJ0LCBuZXh0SW50ZXJ2YWwuZW5kKVxuICAgICAgICBuZXh0SW50ZXJ2YWwgPSBteUludGVydmFsXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChuZXh0SW50ZXJ2YWwpIHtcbiAgICB0aGlzLmludGVydmFscy5wdXNoKG5leHRJbnRlcnZhbC5zdGFydCwgbmV4dEludGVydmFsLmVuZClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuTXVsdGlJbnRlcnZhbC5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBNdWx0aUludGVydmFsKFtdKVxufVxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICF0aGlzLmludGVydmFscy5sZW5ndGhcbn1cblxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUuaW50ZXJ2YWxDb25zdHJ1Y3RvciA9IGludGVydmFsKDAsIDEpLmNvbnN0cnVjdG9yXG5cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IE11bHRpSW50ZXJ2YWwodGhpcy5pbnRlcnZhbHMsIHRydWUpXG59XG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAobXlJbnRlcnZhbCkge1xuICBpZiAoIW15SW50ZXJ2YWwgaW5zdGFuY2VvZiB0aGlzLmludGVydmFsQ29uc3RydWN0b3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhbiBpbnRlcnZhbCcpXG4gIH1cbiAgaWYgKHRoaXMuaXNFbXB0eSgpIHx8IG15SW50ZXJ2YWwuZW1wdHkpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIF9yZW1vdmUodGhpcy5pbnRlcnZhbHMsIG15SW50ZXJ2YWwuc3RhcnQsIG15SW50ZXJ2YWwuZW5kKVxuICByZXR1cm4gdGhpc1xufVxuLy8gUmVtb3ZlcyBpbiBwbGFjZVxuZnVuY3Rpb24gX3JlbW92ZShpbnRlcnZhbHMsIG15U3RhcnQsIG15RW5kKSB7XG4gIGxldCBpID0gMFxuICB3aGlsZSAoaSA8IGludGVydmFscy5sZW5ndGgpIHtcbiAgICBjb25zdCBpbnRlcnZhbFN0YXJ0ID0gaW50ZXJ2YWxzW2ldXG4gICAgY29uc3QgaW50ZXJ2YWxFbmQgPSBpbnRlcnZhbHNbaSArIDFdXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlFbmQpIHtcbiAgICAgIGJyZWFrIC8vIG5vIG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIC8vIG5vIGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbEVuZCA8PSBteVN0YXJ0KSB7XG4gICAgICBpICs9IDJcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGZ1bGwgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlTdGFydCAmJiBpbnRlcnZhbEVuZCA8PSBteUVuZCkge1xuICAgICAgaW50ZXJ2YWxzLnNwbGljZShpLCAyKVxuICAgICAgLy8gaSBkb2VzIG5vdCBncm93IHdlIGRlY3JlYXNlIGxlbmd0aFxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gbGVmdCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxTdGFydCA+PSBteVN0YXJ0ICYmIGludGVydmFsRW5kID4gbXlFbmQpIHtcbiAgICAgIGludGVydmFsc1tpXSA9IG15RW5kXG4gICAgICBicmVhayAvLyBUaGVyZSB3b24ndCBiZSBhbnkgbW9yZSBpbnRlcnNlY3Rpb25cbiAgICB9XG4gICAgLy8gcmlnaHQgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsRW5kIDw9IG15RW5kICYmIGludGVydmFsU3RhcnQgPCBteVN0YXJ0KSB7XG4gICAgICBpbnRlcnZhbHNbaSArIDFdID0gbXlTdGFydFxuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBpbnRlcnNlY3RzIGluIHRoZSBtaWRkbGVcbiAgICBpZiAoaW50ZXJ2YWxFbmQgPiBteUVuZCAmJiBpbnRlcnZhbFN0YXJ0IDwgbXlTdGFydCkge1xuICAgICAgaW50ZXJ2YWxzLnNwbGljZShpICsgMSwgMCwgbXlTdGFydCwgbXlFbmQpXG4gICAgICBicmVhayAvLyB0aGVyZSB3b24ndCBiZSBhbnkgbW9yZSBpbnRlcnNlY3Rpb25cbiAgICB9XG4gICAgY29uc29sZS5lcnJvcignVGhpcyBzaG91bGQgbm90IGhhcHBlbicsIG15U3RhcnQsIG15RW5kLCBpbnRlcnZhbFN0YXJ0LCBpbnRlcnZhbEVuZClcbiAgICBpICs9IDJcbiAgfVxuICByZXR1cm4gaW50ZXJ2YWxzXG59XG5cbi8vIEluIHBsYWNlXG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5tdWx0aXBsZVJlbW92ZSA9IGZ1bmN0aW9uIChteU11bHRpSW50ZXJ2YWwpIHtcbiAgaWYgKCFteU11bHRpSW50ZXJ2YWwgaW5zdGFuY2VvZiBNdWx0aUludGVydmFsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBtdWx0aSBpbnRlcnZhbCcpXG4gIH1cbiAgaWYgKHRoaXMuaXNFbXB0eSgpIHx8IG15TXVsdGlJbnRlcnZhbC5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbXlNdWx0aUludGVydmFsLmludGVydmFscy5sZW5ndGg7IGkgKz0gMikge1xuICAgIF9yZW1vdmUodGhpcy5pbnRlcnZhbHMsIG15TXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaV0sIG15TXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaSArIDFdKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbmZ1bmN0aW9uIF9tZWFzdXJlSW50ZXJzZWN0aW9uIChpbnRlcnZhbHMsIG15U3RhcnQsIG15RW5kKSB7XG4gIGxldCBpID0gMFxuICBsZXQgbWVhc3VyZSA9IDBcbiAgd2hpbGUgKGkgPCBpbnRlcnZhbHMubGVuZ3RoKSB7XG4gICAgY29uc3QgaW50ZXJ2YWxTdGFydCA9IGludGVydmFsc1tpXVxuICAgIGNvbnN0IGludGVydmFsRW5kID0gaW50ZXJ2YWxzW2kgKyAxXVxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15RW5kKSB7XG4gICAgICBicmVhayAvLyBubyBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICAvLyBubyBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxFbmQgPD0gbXlTdGFydCkge1xuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBmdWxsIGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15U3RhcnQgJiYgaW50ZXJ2YWxFbmQgPD0gbXlFbmQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShpbnRlcnZhbFN0YXJ0LCBpbnRlcnZhbEVuZClcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gbGVmdCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxTdGFydCA+PSBteVN0YXJ0ICYmIGludGVydmFsRW5kID4gbXlFbmQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShpbnRlcnZhbFN0YXJ0LCBteUVuZClcbiAgICAgIGJyZWFrIC8vIFRoZXJlIHdvbid0IGJlIGFueSBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICAvLyByaWdodCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxFbmQgPD0gbXlFbmQgJiYgaW50ZXJ2YWxTdGFydCA8IG15U3RhcnQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShteVN0YXJ0LCBpbnRlcnZhbEVuZClcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gaW50ZXJzZWN0cyBpbiB0aGUgbWlkZGxlXG4gICAgaWYgKGludGVydmFsRW5kID4gbXlFbmQgJiYgaW50ZXJ2YWxTdGFydCA8IG15U3RhcnQpIHtcbiAgICAgIG1lYXN1cmUgKz0gdXRpbHMubWVhc3VyZShteVN0YXJ0LCBteUVuZClcbiAgICAgIGJyZWFrIC8vIHRoZXJlIHdvbid0IGJlIGFueSBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICBjb25zb2xlLmVycm9yKCdUaGlzIHNob3VsZCBub3QgaGFwcGVuJywgbXlTdGFydCwgbXlFbmQsIGludGVydmFsU3RhcnQsIGludGVydmFsRW5kKVxuICAgIGkgKz0gMlxuICB9XG4gIHJldHVybiBtZWFzdXJlXG59XG5cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLm1lYXN1cmVNdWx0aXBsZUludGVyc2VjdGlvbiA9IGZ1bmN0aW9uIChtdWx0aUludGVydmFsKSB7XG4gIGxldCBtZWFzdXJlID0gMFxuICBmb3IgKGxldCBpID0gMDsgaSA8IG11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgbWVhc3VyZSArPSBfbWVhc3VyZUludGVyc2VjdGlvbih0aGlzLmludGVydmFscywgbXVsdGlJbnRlcnZhbC5pbnRlcnZhbHNbaV0sIG11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzW2krMV0pXG4gIH1cbiAgcmV0dXJuIG1lYXN1cmVcbn1cblxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUubWVhc3VyZSA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0IG1lYXN1cmUgPSAwXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnRlcnZhbHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBtZWFzdXJlICs9IHV0aWxzLm1lYXN1cmUodGhpcy5pbnRlcnZhbHNbaV0sIHRoaXMuaW50ZXJ2YWxzW2kgKyAxXSlcbiAgfVxuICByZXR1cm4gbWVhc3VyZVxufVxuXG4vLyBUT0RPIHRlc3Rcbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmdldE1pbiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuaXNFbXB0eSgpKSByZXR1cm4gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG4gIHJldHVybiB0aGlzLmludGVydmFsc1swXVxufVxuXG5tdWx0aUludGVydmFsLmNvYWxlc2NlID0gZnVuY3Rpb24gKGludGVydmFsLCBhbm90aGVySW50ZXJ2YWwpIHtcbiAgaWYgKGludGVydmFsLnN0YXJ0ID4gYW5vdGhlckludGVydmFsLmVuZCB8fCBhbm90aGVySW50ZXJ2YWwuc3RhcnQgPiBpbnRlcnZhbC5lbmQpIHtcbiAgICByZXR1cm4gbXVsdGlJbnRlcnZhbChbaW50ZXJ2YWwsIGFub3RoZXJJbnRlcnZhbF0pXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG11bHRpSW50ZXJ2YWwoW2ludGVydmFsLmNvYWxlc2NlKGFub3RoZXJJbnRlcnZhbCldKVxuICB9XG59XG5tdWx0aUludGVydmFsLmVtcHR5ID0gTXVsdGlJbnRlcnZhbC5lbXB0eVxuXG5mdW5jdGlvbiBtdWx0aUludGVydmFsIChpbnRlcnZhbHMpIHtcbiAgcmV0dXJuIG5ldyBNdWx0aUludGVydmFsKGludGVydmFscylcbn1cbiIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSB7cmF5SW50ZXJzZWN0aW9ufVxuXG5jb25zdCBmaW5kQmVzdFJheSA9IHJlcXVpcmUoJy4vZmluZC1iZXN0LXJheScpXG5jb25zdCBleHRlbmRlZFBvaW50TWV0aG9kcyA9IHJlcXVpcmUoJy4vZXh0ZW5kZWQtcG9pbnQtbWV0aG9kcycpXG5jb25zdCBtdWx0aUludGVydmFsID0gcmVxdWlyZSgnLi9tdWx0aS1pbnRlcnZhbCcpLm11bHRpSW50ZXJ2YWxcbi8vIEJldHRlciB0byBncmFiIHRoZSBtb2R1bGUgaGVyZSBhbmQgZmV0Y2ggdGhlIG1ldGhvZCBpbiB0aGUgYWxnb3JpdGhtLCB0aGF0IHdheSB3ZSBjYW4gc3R1YlxuY29uc3QgbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL2xhYmVsLXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKVxuY29uc3QgbGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1zZWdtZW50LWludGVyc2VjdGlvbicpXG5jb25zdCByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykucmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCByYXlTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktc2VnbWVudC1pbnRlcnNlY3Rpb24nKS5yYXlTZWdtZW50SW50ZXJzZWN0aW9uXG5cbi8vIFRPRE8gdXNlIHNldHNcbmFzeW5jIGZ1bmN0aW9uIHJheUludGVyc2VjdGlvbiAocG9pbnRzVG9MYWJlbCwgcG9pbnRzTm90VG9MYWJlbCkge1xuICBwb2ludHNUb0xhYmVsLmZvckVhY2gocD0+IGV4dGVuZGVkUG9pbnRNZXRob2RzLnVwZGF0ZUF2YWlsYWJsZVNwYWNlKHApKVxuICBjb25zdCByZWplY3RlZFBvaW50cyA9IHBvaW50c1RvTGFiZWwuZmlsdGVyKHAgPT4gcC5hdmFpbGFibGVNZWFzdXJlID09PSAwKVxuICAvLyBQIGluIHRoZSBhcnRpY2xlXG4gIHZhciByZW1haW5pbmdQb2ludHMgPSBwb2ludHNUb0xhYmVsLmZpbHRlcihwID0+IHAuYXZhaWxhYmxlTWVhc3VyZSA+IDApXG4gIHZhciBQMCA9IHBvaW50c1RvTGFiZWwuY29uY2F0KHBvaW50c05vdFRvTGFiZWwpXG4gIGNvbnN0IHBvaW50c0xhYmVsZWQgPSBbXSAvLyBIZXJlIHdlIGRpZmZlciBmcm9tIHRoZSBvcmlnaW5hbCBhcnRpY2xlLCBvbmNlIHdlIGZpbmQgYSBwb2ludCBpbiBQIHRvIGxhYmVsIHdlIHJlbW92ZSBpdCBmcm9tIFAgYW5kIGFkZCBpdCB0byBwb2ludHNMYWJlbGVkLCBvdGhlcndpc2UgdGhlIGFsZ29yaXRobSBkb2VzIG5vdCBmaW5pc2hcbiAgd2hpbGUgKHJlbWFpbmluZ1BvaW50cy5sZW5ndGggIT09IDApIHtcbiAgICBsZXQgYmVzdFJheSA9IGF3YWl0IGZpbmRCZXN0UmF5LmZpbmRCZXN0UmF5KHJlbWFpbmluZ1BvaW50cywgcG9pbnRzTm90VG9MYWJlbClcbiAgICBsZXQgcmlqID0gYmVzdFJheS5yYmVzdFxuICAgIGxldCBwaSA9IGJlc3RSYXkucGJlc3RcbiAgICBpZiAocmlqID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEl0IGNvdWxkIG9ubHkgaGFwcGVuIHRoYXQgd2UgZ2V0IHJpaiB1bmRlZmluZWQgaW4gdGhlIGZpcnN0IGl0ZXJhdGlvblxuICAgICAgaWYgKHBvaW50c0xhYmVsZWQubGVuZ3RoICE9PSAwIHx8IHJlamVjdGVkUG9pbnRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgYmVoYXZpb3VyJylcbiAgICAgIH1cbiAgICAgIHJldHVybiB7Y2hvc2VuOiBbXSwgcmVqZWN0ZWQ6IFsuLi5wb2ludHNUb0xhYmVsXX1cbiAgICB9XG4gICAgbGV0IHZpID0ge3g6IHJpai52ZWN0b3IueCAqIHJpai5hdmFpbGFibGUuZ2V0TWluKCksIHk6IHJpai52ZWN0b3IueSAqIHJpai5hdmFpbGFibGUuZ2V0TWluKCl9XG4gICAgZXh0ZW5kZWRQb2ludE1ldGhvZHMucHJvbW90ZUxhYmVsVG9SZWN0YW5nbGUocGksIHZpKVxuICAgIHJlbWFpbmluZ1BvaW50cyA9IHJlbWFpbmluZ1BvaW50cy5maWx0ZXIoZWwgPT4gZWwgIT09IHBpKVxuICAgIFAwID0gUDAuZmlsdGVyKGVsID0+IGVsICE9PSBwaSlcbiAgICBwb2ludHNMYWJlbGVkLnB1c2gocGkpXG4gICAgZm9yIChsZXQgcGsgb2YgUDApIHtcbiAgICAgIGZvciAobGV0IHJrbCBvZiBway5yYXlzKSB7XG4gICAgICAgIGxldCBsYWJlbEludGVyc2VjdGlvblxuICAgICAgICBsZXQgc2VnbWVudEludGVyc2VjdGlvblxuICAgICAgICBjb25zdCBsYWJlbEludGVydmFsID0gbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24ubGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocGkucmVjdGFuZ2xlLCBway5sYWJlbCwgcmtsLnZlY3RvciwgcGsucG9zaXRpb24pXG4gICAgICAgIGNvbnN0IHNlZ21lbnRJbnRlcnZhbCA9IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbi5sYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb24ocGkucG9zaXRpb24sIHZpLCBway5sYWJlbCwgcmtsLnZlY3RvciwgcGsucG9zaXRpb24pXG4gICAgICAgIGNvbnN0IHJheUludGVydmFsID0gcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHBpLnJlY3RhbmdsZSwgcmtsLnZlY3RvciwgcGsucG9zaXRpb24pXG4gICAgICAgIGNvbnN0IHJheVNlZ21lbnRJbnRlcnZhbCA9IHJheVNlZ21lbnRJbnRlcnNlY3Rpb24ocGkucG9zaXRpb24sIHZpLCBway5wb3NpdGlvbiwgcmtsLnZlY3RvcilcbiAgICAgICAgbGFiZWxJbnRlcnNlY3Rpb24gPSBsYWJlbEludGVydmFsLmNvYWxlc2NlSW5QbGFjZShyYXlJbnRlcnZhbClcbiAgICAgICAgc2VnbWVudEludGVyc2VjdGlvbiA9IHNlZ21lbnRJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UocmF5U2VnbWVudEludGVydmFsKVxuICAgICAgICBpZiAoIWxhYmVsSW50ZXJzZWN0aW9uLmVtcHR5IHx8ICFzZWdtZW50SW50ZXJzZWN0aW9uLmVtcHR5KSB7XG4gICAgICAgICAgcmtsLmF2YWlsYWJsZS5tdWx0aXBsZVJlbW92ZShtdWx0aUludGVydmFsLmNvYWxlc2NlKGxhYmVsSW50ZXJzZWN0aW9uLCBzZWdtZW50SW50ZXJzZWN0aW9uKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZXh0ZW5kZWRQb2ludE1ldGhvZHMudXBkYXRlQXZhaWxhYmxlU3BhY2UocGspXG5cbiAgICAgIC8vIFRoZSBvcmlnaW5hbCBhcnRpY2xlIGlzIG5vdCB2ZXJ5IGNsZWFyIGhlcmUuIEl0IHJlbW92ZXMgdGhlIHBvaW50IGZyb20gUCBidXQgdGhlIGl0ZXJhdGlvbiB3YXMgb24gUDAuIEkgc3VwcG9zZSB0aGF0IGlmIHRoZSBpbnRlZ3JhbCBpcyAwIGFuZCB0aGUgcG9pbnQgaXMgaW4gUCB0aGVuIGl0IHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmV4dCBpdGVyYXRpb24gb2YgdGhlIGdyZWVkeSBhbGdvcml0aG1cbiAgICAgIGlmIChway5hdmFpbGFibGVNZWFzdXJlID09PSAwICYmIHJlbWFpbmluZ1BvaW50cy5maW5kSW5kZXgoZWwgPT4gZWwgPT09IHBrKSAhPT0gLTEpe1xuICAgICAgICBQMCA9IFAwLmZpbHRlcihlbCA9PiBlbCAhPT0gcGspXG4gICAgICAgIHJlbWFpbmluZ1BvaW50cyA9IHJlbWFpbmluZ1BvaW50cy5maWx0ZXIoZWwgPT4gZWwgIT09IHBrKVxuICAgICAgICByZWplY3RlZFBvaW50cy5wdXNoKHBrKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ge2Nob3NlbjogcG9pbnRzTGFiZWxlZCwgcmVqZWN0ZWQ6IHJlamVjdGVkUG9pbnRzfVxufSIsIi8vIEdpdmVuIGEgcmF5IGFuZCBhIHJlY3RhbmdsZSwgcmV0dXJuIHRoZSBpbnRlcnZhbCBmcm9tIHRoZSBpbnRlcnNlY3Rpb24gdG8gaW5maW5pdHkgKGl0IGJsb2NrcyB0aGUgcmF5KVxubW9kdWxlLmV4cG9ydHMgPSB7cmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9ufVxuY29uc3QgbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL2xhYmVsLXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKS5sYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgaW50ZXJ2YWwgPSByZXF1aXJlKCcuL2ludGVydmFsJykuaW50ZXJ2YWxcblxuZnVuY3Rpb24gcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uIChsaywgdmksIHBpKSB7XG4gIC8vIEJhc2ljYWxseSBtYWtlIGEgZmFrZSBsYWJlbCBvZiAwIGhlaWdodCBhbmQgd2lkdGhcbiAgY29uc3QgbGkgPSB7aGVpZ2h0OiAwLCBvZmZzZXRYOiAwLCBvZmZzZXRZOiAwLCB3aWR0aDogMH1cbiAgY29uc3QgaW50ZXJzZWN0aW9uID0gbGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb24obGssIGxpLCB2aSwgcGkpXG4gIGlmIChpbnRlcnNlY3Rpb24uZW1wdHkpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0aW9uXG4gIH1cbiAgcmV0dXJuIGludGVydmFsKGludGVyc2VjdGlvbi5zdGFydCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7cmF5U2VnbWVudEludGVyc2VjdGlvbn1cblxuY29uc3Qgc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3NlZ21lbnQtc2VnbWVudC1pbnRlcnNlY3Rpb24nKS5zZWdtZW50U2VnbWVudEludGVyc2VjdGlvblxuY29uc3QgaW50ZXJ2YWwgPSByZXF1aXJlKCcuL2ludGVydmFsJykuaW50ZXJ2YWxcblxuLypcbnBqLCB2aiBkZWZpbmVzIGEgcmF5XG4gKi9cbmZ1bmN0aW9uIHJheVNlZ21lbnRJbnRlcnNlY3Rpb24gKHBpLCB2aSwgcGosIHZqKSB7XG4gIGNvbnN0IGludGVyc2VjdGlvbiA9IHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uKHBqLCB2aiwgcGksIHZpKVxuICBpZiAoaW50ZXJzZWN0aW9uID09PSBudWxsKSByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICBjb25zdCB7dCwgc30gPSBpbnRlcnNlY3Rpb25cbiAgLy8gdCBpcyB0aW1lIGluIHJheSwgcyBwYXJhbWV0ZXIgb24gdGhlIHNlZ21lbnRcbiAgaWYgKHQgPD0gMCB8fCBzIDwgMCB8fCBzID4gMSkge1xuICAgIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gIH1cbiAgcmV0dXJuIGludGVydmFsKHQsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbn1cbi8vIEEgcG9pbnQgcGkgbW92ZXMgd2l0aCB2aSwgYSBzZWdtZW50IGlzIGRlZmluZWQgd2l0aCBwaiwgdmosIHdlIGZpbmQgdGhlIHRpbWUgdCBhdCB3aGljaCB0aGUgcG9pbnQgaW50ZXJzZWN0cyBhbmQgcmV0dXJucyBwYXJhbWV0ZXJzIHMgb24gdGhlIHNlZ21lbnRcbi8vIFRPRE8gY2hhbmdlIG9yZGVyIHNvIHRoYXQgcGosIHZqIGlzIHRoZSByYXlcbmZ1bmN0aW9uIHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uIChwaSwgdmksIHBqLCB2aiAvKiBWZWN0b3Igb2YgdGhlIHNlZ21lbnQgKi8pIHtcbiAgLy8gKHZpIC12aikodCwgcyleVCA9IChwaiAtIHBpKVxuICB2YXIgZGV0ID0gLSh2aS54ICogdmoueSAtIHZqLnggKiB2aS55KVxuICBpZiAoZGV0ID09PSAwKSB7IC8vIFBhcmFsbGVsIGxpbmVzXG4gICAgLy8gVGVzdCB0aGlzXG4gICAgaWYgKChwaS54IC0gcGoueCkgKiB2ai55IC0gKHBpLmogLSBwai55KSAqIHZqLnggIT09IDApIHJldHVybiBudWxsIC8vIExpbmUgZG9lcyBub3QgYmVsb25nXG4gICAgLy8gVE9ETyBjb25jdXJyZW50IGxpbmVzXG4gICAgdGhyb3cgbmV3IEVycm9yKCdQYXJhbGxlbCBsaW5lcyBub3QgYWxsb3dlZCcpIC8vIFRoaXMgbXVzdCBiZSBoYW5kbGVkIG91dCBvZiB0aGUgYWxnb3JpdGhtXG4gIH1cbiAgY29uc3QgdCA9ICgtKHBqLnggLSBwaS54KSAqIHZqLnkgKyAocGoueSAtIHBpLnkpICogdmoueCkgLyBkZXRcbiAgY29uc3QgcyA9ICgtKHBqLnggLSBwaS54KSAqIHZpLnkgKyAocGoueSAtIHBpLnkpICogdmkueCkgLyBkZXRcbiAgcmV0dXJuIHt0LCBzfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7Y29tcGFyZUFycmF5c0xleGljb2dyYXBoaWNhbGx5LCBtZWFzdXJlfVxuXG5mdW5jdGlvbiBjb21wYXJlQXJyYXlzTGV4aWNvZ3JhcGhpY2FsbHkgKGFycjEsIGFycjIpIHtcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgTWF0aC5taW4oYXJyMS5sZW5ndGgsIGFycjIubGVuZ3RoKSkge1xuICAgIGlmIChhcnIxW2ldICE9PSBhcnIyW2ldKSByZXR1cm4gYXJyMVtpXSAtIGFycjJbaV1cbiAgICBpKytcbiAgfVxuICByZXR1cm4gYXJyMS5sZW5ndGggLSBhcnIyLmxlbmd0aFxufVxuXG5mdW5jdGlvbiBtZWFzdXJlIChzdGFydCwgZW5kKSB7XG4gIHJldHVybiBNYXRoLnBvdygyLCAtc3RhcnQpIC0gTWF0aC5wb3coMiwgLWVuZClcbn0iXX0=
