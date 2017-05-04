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
    debugger;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pdGVyYXRpdmUtZ3JlZWR5L2Rpc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd2Vid29ya2lmeS9pbmRleC5qcyIsInNyYy9leHRlbmRlZC1wb2ludC1tZXRob2RzLmpzIiwic3JjL2ZpbmQtYmVzdC1yYXkuanMiLCJzcmMvaW50ZXJ2YWwuanMiLCJzcmMvbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9sYWJlbC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy9tYWluLWFsZ29yaXRobS1sb2FkZXIuanMiLCJzcmMvbWFpbi1hbGdvcml0aG0uanMiLCJzcmMvbXVsdGktaW50ZXJ2YWwuanMiLCJzcmMvcmF5LWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbi5qcyIsInNyYy9yYXktc2VnbWVudC1pbnRlcnNlY3Rpb24uanMiLCJzcmMvc2VnbWVudC1zZWdtZW50LWludGVyc2VjdGlvbi5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxNQUFNLFNBQVUsT0FBTyxNQUFQLEtBQWtCLFdBQWxCLEdBQWdDLE9BQU8sR0FBUCxDQUFoQyxHQUE4QyxPQUFPLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0MsT0FBTyxHQUFQLENBQWhDLEdBQThDLElBQTVHO0FBQ0EsTUFBTSxzQkFBc0IsUUFBUSw2QkFBUixDQUE1QjtBQUNBLE9BQU8sT0FBUCxHQUFpQixvQkFBb0IsYUFBckM7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDLEdBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBWCxJQUFnQixHQUFHLENBQTVDLElBQWlELEdBQTNEO0FBQ0EsU0FBTyxFQUFDLENBQUQsRUFBSSxDQUFKLEVBQVA7QUFDRDs7O0FDZkQsT0FBTyxPQUFQLEdBQWlCLEVBQUMsOEJBQUQsRUFBaUMsT0FBakMsRUFBakI7O0FBRUEsU0FBUyw4QkFBVCxDQUF5QyxJQUF6QyxFQUErQyxJQUEvQyxFQUFxRDtBQUNuRCxNQUFJLElBQUksQ0FBUjtBQUNBLFNBQU8sSUFBSSxLQUFLLEdBQUwsQ0FBUyxLQUFLLE1BQWQsRUFBc0IsS0FBSyxNQUEzQixDQUFYLEVBQStDO0FBQzdDLFFBQUksS0FBSyxDQUFMLE1BQVksS0FBSyxDQUFMLENBQWhCLEVBQXlCLE9BQU8sS0FBSyxDQUFMLElBQVUsS0FBSyxDQUFMLENBQWpCO0FBQ3pCO0FBQ0Q7QUFDRCxTQUFPLEtBQUssTUFBTCxHQUFjLEtBQUssTUFBMUI7QUFDRDs7QUFFRCxTQUFTLE9BQVQsQ0FBa0IsS0FBbEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDNUIsU0FBTyxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQyxLQUFiLElBQXNCLEtBQUssR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFDLEdBQWIsQ0FBN0I7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBsb2Rhc2ggPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbClcbmNvbnN0IG1haW5BbGdvcml0aG1Mb2FkZXIgPSByZXF1aXJlKCcuL3NyYy9tYWluLWFsZ29yaXRobS1sb2FkZXInKVxubW9kdWxlLmV4cG9ydHMgPSBtYWluQWxnb3JpdGhtTG9hZGVyLm1haW5BbGdvcml0aG0iLCJcblxuLy8gVE9ETyBhZGQgdGhlIHBvc3NpYmlsaXR5IHRvIG93biBzY29yZSBmdW5jdGlvblxuLyoqXG4gKlxuICogQHBhcmFtIGdyZWVkeUFsZ29yaXRobSBmdW5jdGlvbiB0aGF0IHJlY2VpdmVzIHR3byBhcnJheXMsIG9uZSBvZiBlbGVtZW50cyB0byBiZSBjb21wdXRlZCBhbmQgb25lIGZvciB0aGUgcG9pbnRzIGZvciB0aGUgcmVzdCBvZiB0aGUgaXRlcmF0aW9ucy5cbiAqIEl0IHJldHVybnMgYW4gb2JqZWN0IHdpdGggdHdvIGVsZW1lbnRzLCBjaG9zZW4gYW5kIHJlamVjdGVkXG4gKiBAcGFyYW0gc3RhcnRpbmdEYXRhIHN0YXJ0aW5nIGFycmF5IG9mIGVsZW1lbnRzXG4gKiBAcGFyYW0gcmVzZXRGdW5jdGlvbiBmdW5jdGlvbiB0byBiZSBhcHBsaWVkIHRvIGVhY2ggZWxlbWVudCBhdCB0aGUgc3RhcnQgb2YgZWFjaCBpdGVyYXRpb25cbiAqIEBwYXJhbSBwYXJhbXMgZXh0cmEgcGFyYW1zXG4gKi9cbmxldCBpdGVyYXRpdmVHcmVlZHlBbGdvcml0aG0gPSAoKCkgPT4ge1xuICB2YXIgX3JlZiA9IF9hc3luY1RvR2VuZXJhdG9yKGZ1bmN0aW9uKiAoZ3JlZWR5QWxnb3JpdGhtLCBzdGFydGluZ0RhdGEsIHJlc2V0RnVuY3Rpb24sIHBhcmFtcyA9IHt9KSB7XG4gICAgY29uc3QgTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TID0gdHlwZW9mIHBhcmFtcy5NQVhfTlVNQkVSX09GX0lURVJBVElPTlMgPT09ICdudW1iZXInID8gcGFyYW1zLk1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA6IDEwMDtcbiAgICAvLyBBdCBldmVyeSBsb29wIGlmIHdlIGltcHJvdmUgdGhlIHJlc3VsdCB0aGVuIHdlIGFwcGx5IHNlcmlhbGl6ZSBmdW5jdGlvbiB0byB0aGUgcmVzdWx0IHRvIHNhdmUgYSBjb3B5XG4gICAgY29uc3Qgc2VyaWFsaXplRnVuY3Rpb24gPSB0eXBlb2YgcGFyYW1zLnNlcmlhbGl6ZUZ1bmN0aW9uID09PSAnZnVuY3Rpb24nID8gcGFyYW1zLnNlcmlhbGl6ZUZ1bmN0aW9uIDogZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHgpKTtcbiAgICB9O1xuICAgIC8vIEluIHRoZSBncmVlZHkgcXVldWUgd2Ugc3RvcmUgYWxsIHRoZSBlbGVtZW50cyBpbiBhcnJheSBpbiByZXZlcnNlIG9yZGVyIG9mIGV4ZWN1dGlvblxuICAgIGNvbnN0IGdyZWVkeVF1ZXVlID0gW3N0YXJ0aW5nRGF0YV07XG4gICAgbGV0IGJlc3RHcmVlZHlRdWV1ZSA9IFtdO1xuICAgIGxldCBiZXN0U2NvcmUgPSAwO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgTUFYX05VTUJFUl9PRl9JVEVSQVRJT05TOyBqKyspIHtcbiAgICAgIGxldCBpdGVyYXRpb25TY29yZSA9IDA7XG4gICAgICBncmVlZHlRdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XG4gICAgICAgIGNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgIHJlc2V0RnVuY3Rpb24uY2FsbChlbGVtZW50LCBlbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IG4gPSBncmVlZHlRdWV1ZS5sZW5ndGg7XG4gICAgICBmb3IgKGxldCBpID0gbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IHsgY2hvc2VuLCByZWplY3RlZCB9ID0geWllbGQgZ3JlZWR5QWxnb3JpdGhtKGdyZWVkeVF1ZXVlW2ldLCBmbGF0dGVuKGdyZWVkeVF1ZXVlLnNsaWNlKDAsIGkpKSk7XG4gICAgICAgIGl0ZXJhdGlvblNjb3JlICs9IGNob3Nlbi5sZW5ndGg7XG4gICAgICAgIGlmIChjaG9zZW4ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgZ3JlZWR5UXVldWVbaV0gPSBjaG9zZW47XG4gICAgICAgICAgLy8gZW5kIG9mIHRoZSBxdWV1ZVxuICAgICAgICAgIGlmIChpID09PSBuIC0gMSkge1xuICAgICAgICAgICAgaWYgKHJlamVjdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICBncmVlZHlRdWV1ZS5wdXNoKHJlamVjdGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ3JlZWR5UXVldWVbaSArIDFdID0gWy4uLmdyZWVkeVF1ZXVlW2kgKyAxXSwgLi4ucmVqZWN0ZWRdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBjaG9zZW4ubGVuZ3RoID09PSAwIHRoZW4gdGhlc2UgZWxlbWVudHMgY291bGQgbm90IGJlIGFzc2lnbmVkIGV2ZW4gYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgcXVldWUsIHdlIHNob3VsZCBnZXQgcmlkIG9mIHRoZW1cbiAgICAgICAgICBpZiAoaSAhPT0gbiAtIDEpIHtcbiAgICAgICAgICAgIGdyZWVkeVF1ZXVlW2ldID0gZ3JlZWR5UXVldWVbaSArIDFdO1xuICAgICAgICAgICAgZ3JlZWR5UXVldWVbaSArIDFdID0gcmVqZWN0ZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXRlcmF0aW9uU2NvcmUgPiBiZXN0U2NvcmUpIHtcbiAgICAgICAgYmVzdFNjb3JlID0gaXRlcmF0aW9uU2NvcmU7XG4gICAgICAgIC8vIFRoZXJlIG11c3QgYmUgYSBiZXR0ZXIgd2F5IHRvIHN0b3JlIHRoZSByZXN1bHRcbiAgICAgICAgLy8gUGx1cyB0aGUgbmFtZSBpcyBhIGJpdCB0cmlja3ksIG9uZSBleHBlY3RzIHRoYXQgdGhlIGFsZ29yaXRobSBpbiBpdCBwYXNzIHNldHMgdGhlIGVsZW1lbnRzXG4gICAgICAgIGJlc3RHcmVlZHlRdWV1ZSA9IHNlcmlhbGl6ZUZ1bmN0aW9uKGZsYXR0ZW4oZ3JlZWR5UXVldWUpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGdyZWVkeVF1ZXVlTGVuZ3RoID0gZ3JlZWR5UXVldWUucmVkdWNlKGZ1bmN0aW9uIChsZW5ndGgsIGFycmF5KSB7XG4gICAgICAgIHJldHVybiBsZW5ndGggKyBhcnJheS5sZW5ndGg7XG4gICAgICB9LCAwKTtcbiAgICAgIGlmIChpdGVyYXRpb25TY29yZSA9PT0gZ3JlZWR5UXVldWVMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGJlc3RHcmVlZHlRdWV1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJlc3RHcmVlZHlRdWV1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGl0ZXJhdGl2ZUdyZWVkeUFsZ29yaXRobShfeCwgX3gyLCBfeDMpIHtcbiAgICByZXR1cm4gX3JlZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufSkoKTtcblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHsgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdmFyIGdlbiA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IGZ1bmN0aW9uIHN0ZXAoa2V5LCBhcmcpIHsgdHJ5IHsgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpOyB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlOyB9IGNhdGNoIChlcnJvcikgeyByZWplY3QoZXJyb3IpOyByZXR1cm47IH0gaWYgKGluZm8uZG9uZSkgeyByZXNvbHZlKHZhbHVlKTsgfSBlbHNlIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHsgc3RlcChcIm5leHRcIiwgdmFsdWUpOyB9LCBmdW5jdGlvbiAoZXJyKSB7IHN0ZXAoXCJ0aHJvd1wiLCBlcnIpOyB9KTsgfSB9IHJldHVybiBzdGVwKFwibmV4dFwiKTsgfSk7IH07IH1cblxubW9kdWxlLmV4cG9ydHMgPSB7IHNvbHZlOiBpdGVyYXRpdmVHcmVlZHlBbGdvcml0aG0gfTtcblxuZnVuY3Rpb24gZmxhdHRlbihhcnJheXMpIHtcbiAgcmV0dXJuIGFycmF5cy5yZWR1Y2UoKGExLCBhMikgPT4gYTEuY29uY2F0KGEyKSwgW10pO1xufSIsInZhciBidW5kbGVGbiA9IGFyZ3VtZW50c1szXTtcbnZhciBzb3VyY2VzID0gYXJndW1lbnRzWzRdO1xudmFyIGNhY2hlID0gYXJndW1lbnRzWzVdO1xuXG52YXIgc3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCBvcHRpb25zKSB7XG4gICAgdmFyIHdrZXk7XG4gICAgdmFyIGNhY2hlS2V5cyA9IE9iamVjdC5rZXlzKGNhY2hlKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2FjaGVLZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0gY2FjaGVLZXlzW2ldO1xuICAgICAgICB2YXIgZXhwID0gY2FjaGVba2V5XS5leHBvcnRzO1xuICAgICAgICAvLyBVc2luZyBiYWJlbCBhcyBhIHRyYW5zcGlsZXIgdG8gdXNlIGVzbW9kdWxlLCB0aGUgZXhwb3J0IHdpbGwgYWx3YXlzXG4gICAgICAgIC8vIGJlIGFuIG9iamVjdCB3aXRoIHRoZSBkZWZhdWx0IGV4cG9ydCBhcyBhIHByb3BlcnR5IG9mIGl0LiBUbyBlbnN1cmVcbiAgICAgICAgLy8gdGhlIGV4aXN0aW5nIGFwaSBhbmQgYmFiZWwgZXNtb2R1bGUgZXhwb3J0cyBhcmUgYm90aCBzdXBwb3J0ZWQgd2VcbiAgICAgICAgLy8gY2hlY2sgZm9yIGJvdGhcbiAgICAgICAgaWYgKGV4cCA9PT0gZm4gfHwgZXhwICYmIGV4cC5kZWZhdWx0ID09PSBmbikge1xuICAgICAgICAgICAgd2tleSA9IGtleTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF3a2V5KSB7XG4gICAgICAgIHdrZXkgPSBNYXRoLmZsb29yKE1hdGgucG93KDE2LCA4KSAqIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgdmFyIHdjYWNoZSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNhY2hlS2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBjYWNoZUtleXNbaV07XG4gICAgICAgICAgICB3Y2FjaGVba2V5XSA9IGtleTtcbiAgICAgICAgfVxuICAgICAgICBzb3VyY2VzW3drZXldID0gW1xuICAgICAgICAgICAgRnVuY3Rpb24oWydyZXF1aXJlJywnbW9kdWxlJywnZXhwb3J0cyddLCAnKCcgKyBmbiArICcpKHNlbGYpJyksXG4gICAgICAgICAgICB3Y2FjaGVcbiAgICAgICAgXTtcbiAgICB9XG4gICAgdmFyIHNrZXkgPSBNYXRoLmZsb29yKE1hdGgucG93KDE2LCA4KSAqIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKDE2KTtcblxuICAgIHZhciBzY2FjaGUgPSB7fTsgc2NhY2hlW3drZXldID0gd2tleTtcbiAgICBzb3VyY2VzW3NrZXldID0gW1xuICAgICAgICBGdW5jdGlvbihbJ3JlcXVpcmUnXSwgKFxuICAgICAgICAgICAgLy8gdHJ5IHRvIGNhbGwgZGVmYXVsdCBpZiBkZWZpbmVkIHRvIGFsc28gc3VwcG9ydCBiYWJlbCBlc21vZHVsZVxuICAgICAgICAgICAgLy8gZXhwb3J0c1xuICAgICAgICAgICAgJ3ZhciBmID0gcmVxdWlyZSgnICsgc3RyaW5naWZ5KHdrZXkpICsgJyk7JyArXG4gICAgICAgICAgICAnKGYuZGVmYXVsdCA/IGYuZGVmYXVsdCA6IGYpKHNlbGYpOydcbiAgICAgICAgKSksXG4gICAgICAgIHNjYWNoZVxuICAgIF07XG5cbiAgICB2YXIgd29ya2VyU291cmNlcyA9IHt9O1xuICAgIHJlc29sdmVTb3VyY2VzKHNrZXkpO1xuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZVNvdXJjZXMoa2V5KSB7XG4gICAgICAgIHdvcmtlclNvdXJjZXNba2V5XSA9IHRydWU7XG5cbiAgICAgICAgZm9yICh2YXIgZGVwUGF0aCBpbiBzb3VyY2VzW2tleV1bMV0pIHtcbiAgICAgICAgICAgIHZhciBkZXBLZXkgPSBzb3VyY2VzW2tleV1bMV1bZGVwUGF0aF07XG4gICAgICAgICAgICBpZiAoIXdvcmtlclNvdXJjZXNbZGVwS2V5XSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmVTb3VyY2VzKGRlcEtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc3JjID0gJygnICsgYnVuZGxlRm4gKyAnKSh7J1xuICAgICAgICArIE9iamVjdC5rZXlzKHdvcmtlclNvdXJjZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5naWZ5KGtleSkgKyAnOlsnXG4gICAgICAgICAgICAgICAgKyBzb3VyY2VzW2tleV1bMF1cbiAgICAgICAgICAgICAgICArICcsJyArIHN0cmluZ2lmeShzb3VyY2VzW2tleV1bMV0pICsgJ10nXG4gICAgICAgICAgICA7XG4gICAgICAgIH0pLmpvaW4oJywnKVxuICAgICAgICArICd9LHt9LFsnICsgc3RyaW5naWZ5KHNrZXkpICsgJ10pJ1xuICAgIDtcblxuICAgIHZhciBVUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkwgfHwgd2luZG93Lm1velVSTCB8fCB3aW5kb3cubXNVUkw7XG5cbiAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtzcmNdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuYmFyZSkgeyByZXR1cm4gYmxvYjsgfVxuICAgIHZhciB3b3JrZXJVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIHZhciB3b3JrZXIgPSBuZXcgV29ya2VyKHdvcmtlclVybCk7XG4gICAgd29ya2VyLm9iamVjdFVSTCA9IHdvcmtlclVybDtcbiAgICByZXR1cm4gd29ya2VyO1xufTtcbiIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHVwZGF0ZUF2YWlsYWJsZVNwYWNlLFxuICBwcm9tb3RlTGFiZWxUb1JlY3RhbmdsZSxcbiAgY29tcHV0ZUluaXRpYWxBdmFpbGFiZVNwYWNlcyxcbiAgcmVzZXRBdmFpbGFibGVTcGFjZSxcbiAgdXBkYXRlTWluaW1hLFxuICB0cmFuc2xhdGVMYWJlbFxufVxuXG5jb25zdCBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLmxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykucmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uXG5jb25zdCBtdWx0aUludGVydmFsID0gcmVxdWlyZSgnLi9tdWx0aS1pbnRlcnZhbCcpLm11bHRpSW50ZXJ2YWxcbmNvbnN0IGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG4vKlxuIEFuIGV4dGVuZGVkIHBvaW50IG1heSBjb250YWluIHRoZSBmb2xsb3dpbmdcbiAgcmF5cyBhIGNvbGxlY3Rpb24gb2YgcmF5cyBzdGFydGluZyBmcm9tIHRoZSBwb2ludCBhcyB3ZWxsIGFzIHRoZSBpbnRlcnZhbHMgd2hlcmUgdGhleSBhcmUgYWxsb3dlZFxuICBsYWJlbCBpbiBjYXNlIHRoZSBsYWJlbCBpcyBub3QgeWV0IHNldHRsZWRcbiAgcmVjdGFuZ2xlIGluIGNhc2UgdGhlIGxhYmVsIGlzIHNldHRsZWRcbiAqL1xuZnVuY3Rpb24gdXBkYXRlQXZhaWxhYmxlU3BhY2UgKGV4dGVuZGVkUG9pbnQpIHtcbiAgdmFyIHJheXMgPSBleHRlbmRlZFBvaW50LnJheXNcbiAgdmFyIG1lYXN1cmUgPSAwXG4gIGZvciAobGV0IHJheSBvZiByYXlzKSB7XG4gICAgbGV0IHJheU1lYXN1cmUgPSByYXkuYXZhaWxhYmxlLm1lYXN1cmUoKVxuICAgIHJheS5hdmFpbGFibGVNZWFzdXJlID0gcmF5TWVhc3VyZVxuICAgIG1lYXN1cmUgKz0gcmF5TWVhc3VyZVxuICB9XG4gIGV4dGVuZGVkUG9pbnQuYXZhaWxhYmxlTWVhc3VyZSA9IG1lYXN1cmVcbn1cblxuZnVuY3Rpb24gY29tcHV0ZUluaXRpYWxBdmFpbGFiZVNwYWNlcyAoZXh0ZW5kZWRQb2ludHMsIHBhcmFtcykge1xuICBjb25zdCByYWRpdXMgPSBwYXJhbXMucmFkaXVzXG4gIGNvbnN0IGJib3ggPSBwYXJhbXMuYmJveFxuICBmb3IgKGxldCBwaSBvZiBleHRlbmRlZFBvaW50cykge1xuICAgIGZvciAobGV0IHJpaiBvZiBwaS5yYXlzKSB7XG4gICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlID0gbXVsdGlJbnRlcnZhbChbaW50ZXJ2YWwoMCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKV0pXG4gICAgICBmb3IgKGxldCBwayBvZiBleHRlbmRlZFBvaW50cykge1xuICAgICAgICBjb25zdCByZWN0YW5nbGUgPSB7dG9wOiBway5wb3NpdGlvbi55ICsgcmFkaXVzLCBib3R0b206IHBrLnBvc2l0aW9uLnkgLSByYWRpdXMsIGxlZnQ6IHBrLnBvc2l0aW9uLnggLSByYWRpdXMsIHJpZ2h0OiBway5wb3NpdGlvbi54ICsgcmFkaXVzLCB3aWR0aDogMiAqIHJhZGl1cywgaGVpZ2h0OiAyICogcmFkaXVzfVxuICAgICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlLnJlbW92ZShsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbihyZWN0YW5nbGUsIHBpLmxhYmVsLCByaWoudmVjdG9yLCBwaS5wb3NpdGlvbikpXG4gICAgICAgIGlmIChwaSAhPT0gcGspIHtcbiAgICAgICAgICByaWouaW5pdGlhbGx5QXZhaWxhYmxlLnJlbW92ZShyYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocmVjdGFuZ2xlLCByaWoudmVjdG9yLCBwaS5wb3NpdGlvbikpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChiYm94KSB7XG4gICAgICAgIGNvbnN0IGxhYmVsQ29udGFpbmVkSW50ZXJ2YWwgPSBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbih7dG9wOiAtYmJveC50b3AgLSBwaS5sYWJlbC5oZWlnaHQsIGJvdHRvbTogLWJib3guYm90dG9tICsgcGkubGFiZWwuaGVpZ2h0LCBsZWZ0OiBiYm94LmxlZnQgKyBwaS5sYWJlbC53aWR0aCwgcmlnaHQ6IGJib3gucmlnaHQgLSBwaS5sYWJlbC53aWR0aCwgd2lkdGg6IGJib3gud2lkdGggLSAyICogcGkubGFiZWwud2lkdGgsIGhlaWdodDogYmJveC5oZWlnaHQgLSAyICogcGkubGFiZWwuaGVpZ2h0fSwgcGkubGFiZWwsIHJpai52ZWN0b3IsIHBpLnBvc2l0aW9uKVxuICAgICAgICAvLyBXYW50IGxhYmVscyBpbnNpZGUgb2YgdGhlIGdyYXBoXG4gICAgICAgIHJpai5pbml0aWFsbHlBdmFpbGFibGUucmVtb3ZlKGludGVydmFsKGxhYmVsQ29udGFpbmVkSW50ZXJ2YWwuZW5kLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpKVxuICAgICAgfVxuICAgICAgcmlqLmF2YWlsYWJsZSA9IHJpai5pbml0aWFsbHlBdmFpbGFibGUuY2xvbmUoKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZXNldEF2YWlsYWJsZVNwYWNlIChleHRlbmRlZFBvaW50KSB7XG4gIGZvciAobGV0IHJpaiBvZiBleHRlbmRlZFBvaW50LnJheXMpIHtcbiAgICByaWouYXZhaWxhYmxlID0gcmlqLmluaXRpYWxseUF2YWlsYWJsZS5jbG9uZSgpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlTWluaW1hIChleHRlbmRlZFBvaW50KSB7XG4gIHZhciByYXlzID0gZXh0ZW5kZWRQb2ludC5yYXlzXG4gIGZvciAobGV0IHJheSBvZiByYXlzKSB7XG4gICAgcmF5Lm1pbmltdW0gPSByYXkuYXZhaWxhYmxlLmdldE1pbigpXG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvbW90ZUxhYmVsVG9SZWN0YW5nbGUgKGV4dGVuZGVkUG9pbnQsIHZpKSB7XG4gIGV4dGVuZGVkUG9pbnQucmVjdGFuZ2xlID0gdHJhbnNsYXRlTGFiZWwoZXh0ZW5kZWRQb2ludCwgdmkpXG4gIGV4dGVuZGVkUG9pbnQuc2VnbWVudCA9IHt4OiB2aS54LCB5OiB2aS55fVxufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGVMYWJlbCAoZXh0ZW5kZWRQb2ludCwgdmkpIHtcbiAgY29uc3QgcG9pbnQgPSBleHRlbmRlZFBvaW50LnBvc2l0aW9uXG4gIGNvbnN0IGxhYmVsID0gZXh0ZW5kZWRQb2ludC5sYWJlbFxuICByZXR1cm4ge1xuICAgIGhlaWdodDogbGFiZWwuaGVpZ2h0LFxuICAgIHdpZHRoOiBsYWJlbC53aWR0aCxcbiAgICB0b3A6IHBvaW50LnkgKyB2aS55ICsgbGFiZWwuaGVpZ2h0IC8gMiArIGxhYmVsLm9mZnNldFksXG4gICAgYm90dG9tOiBwb2ludC55ICsgdmkueSAtIGxhYmVsLmhlaWdodCAvIDIgKyBsYWJlbC5vZmZzZXRZLFxuICAgIGxlZnQ6IHBvaW50LnggKyB2aS54IC0gbGFiZWwud2lkdGggLyAyICsgbGFiZWwub2Zmc2V0WCxcbiAgICByaWdodDogcG9pbnQueCArIHZpLnggKyBsYWJlbC53aWR0aCAvIDIgKyBsYWJlbC5vZmZzZXRYXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xubW9kdWxlLmV4cG9ydHMgPSB7ZmluZEJlc3RSYXl9XG5cbmNvbnN0IGV4dGVuZGVkUG9pbnRNZXRob2RzID0gcmVxdWlyZSgnLi9leHRlbmRlZC1wb2ludC1tZXRob2RzJylcbmNvbnN0IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykubGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb25cbmNvbnN0IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtc2VnbWVudC1pbnRlcnNlY3Rpb24nKS5sYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb25cbmNvbnN0IHJheVJlY3RhbmdsZUludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LXJlY3RhbmdsZS1pbnRlcnNlY3Rpb24nKS5yYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb25cbmNvbnN0IHJheVNlZ21lbnRJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1zZWdtZW50LWludGVyc2VjdGlvbicpLnJheVNlZ21lbnRJbnRlcnNlY3Rpb25cbmNvbnN0IG11bHRpSW50ZXJ2YWwgPSByZXF1aXJlKCcuL211bHRpLWludGVydmFsJykubXVsdGlJbnRlcnZhbFxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuYXN5bmMgZnVuY3Rpb24gZmluZEJlc3RSYXkgKHBvaW50c1RvTGFiZWwsIHBvaW50c05vdFRvTGFiZWwpIHtcbiAgLy8gV2UgZm9sbG93IHRoZSBhcnRpY2xlIHBhZ2UgNCBBbGdvcml0aG0gMVxuICB2YXIgUCA9IHBvaW50c1RvTGFiZWxcbiAgdmFyIFAwID0gcG9pbnRzTm90VG9MYWJlbC5jb25jYXQocG9pbnRzVG9MYWJlbClcbiAgLy8gaW50IFAgbWluIGluIHRoZSBhcnRpY2xlXG4gIHZhciBtaW5pbXVtQXZhaWxhYmxlU3BhY2UgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcbiAgdmFyIHJiZXN0XG4gIHZhciBWYmVzdFxuICB2YXIgcGJlc3QgLy8gVGhpcyBpcyBub3QgaW4gdGhlIG9yaWdpbmFsIGFsZ29yaXRobSBidXQgYWxsb3dzIHRvIGVhc2lseSBmaW5kIHRoZSBjb3JyZXNwb25kaW5nIHBvaW50XG4gIFAwLmZvckVhY2gocCA9PiBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwKSlcbiAgUC5mb3JFYWNoKHAgPT4gZXh0ZW5kZWRQb2ludE1ldGhvZHMudXBkYXRlTWluaW1hKHApKVxuICBjb25zdCBwaSA9IFAucmVkdWNlKChpLCBqKSA9PiBpLmF2YWlsYWJsZU1lYXN1cmUgPCBqLmF2YWlsYWJsZU1lYXN1cmUgPyBpIDogailcbiAgbGV0IFIgPSBwaS5yYXlzLmZpbHRlcihyID0+IHIuYXZhaWxhYmxlTWVhc3VyZSA+IDApXG4gIHJpamxvb3A6IGZvciAobGV0IHJpaiBvZiBSKSB7XG4gICAgbGV0IFZpaiA9IFtdXG4gICAgbGV0IHNlZ21lbnQgPSB7eDogcmlqLnZlY3Rvci54ICogcmlqLm1pbmltdW0sIHk6IHJpai52ZWN0b3IueSAqIHJpai5taW5pbXVtfVxuICAgIGNvbnN0IHJlY3RhbmdsZSA9IGV4dGVuZGVkUG9pbnRNZXRob2RzLnRyYW5zbGF0ZUxhYmVsKHBpLCBzZWdtZW50KVxuICAgIGZvciAobGV0IHBrIG9mIFAwKSB7XG4gICAgICBpZiAocGsgPT09IHBpKSBjb250aW51ZVxuICAgICAgLy8gTm8gc2Vuc2UgdG8gd2FpdCBmb3IgdGhlIGludGVyc2VjdGlvbiBpZiByYmVzdCBpcyBkZWZpbmVkXG5cbiAgICAgIC8vIGludCBwa1xuICAgICAgbGV0IGF2YWlsYWJsZVNwYWNlID0gcGsuYXZhaWxhYmxlTWVhc3VyZVxuICAgICAgLy8gTm90IGRvaW5nIHRoZSBwcmVpbnRlcnNlY3Rpb24gaGVyZS4gU29tZXRoaW5nIGZpc2h5IGluIHRoZSBhcnRpY2xlLCBpZiBwcmVpbnRlcnNlY3QgaXMgZW1wdHkgdGhlbiAgaW50ZWdyYWwgcGstIGlzIDAgd2hpY2ggZG9lcyBub3QgbWFrZSBtdWNoIHNlbnNlXG4gICAgICBmb3IgKGxldCBya2wgb2YgcGsucmF5cykge1xuICAgICAgICBsZXQgbGFiZWxJbnRlcnNlY3Rpb25cbiAgICAgICAgbGV0IHNlZ21lbnRJbnRlcnNlY3Rpb25cbiAgICAgICAgLy8gV2UgaGF2ZSBzcGxpdCBsYWJlbCByZWN0YW5nbGUgaW50ZXJzZWN0aW9uIGludG8gdHdvIGFsZ29yaXRobXMsIGxhYmVsIHJlY3RhbmdsZSBhbmQgbGFiZWwgc2VnbWVudC4gVGhvc2UgdHdvIGludGVydmFscyBzaG91bGQgaW50ZXJzZWN0IHNpbmNlIHRoZSBzZWdtZW50IGludGVyc2VjdHMgdGhlIHJlY3RhbmdsZSwgc28gd2UgY2FuIGNvYWxlc2NlIHRoZSBpbnRlcnZhbHNcbiAgICAgICAgY29uc3QgbGFiZWxJbnRlcnZhbCA9IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHJlY3RhbmdsZSwgcGsubGFiZWwsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCBzZWdtZW50SW50ZXJ2YWwgPSBsYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb24ocGkucG9zaXRpb24sIHNlZ21lbnQsIHBrLmxhYmVsLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3QgcmF5SW50ZXJ2YWwgPSByYXlSZWN0YW5nbGVJbnRlcnNlY3Rpb24ocmVjdGFuZ2xlLCBya2wudmVjdG9yLCBway5wb3NpdGlvbilcbiAgICAgICAgY29uc3QgcmF5U2VnbWVudEludGVydmFsID0gcmF5U2VnbWVudEludGVyc2VjdGlvbihwaS5wb3NpdGlvbiwgc2VnbWVudCwgcGsucG9zaXRpb24sIHJrbC52ZWN0b3IpXG4gICAgICAgIGxhYmVsSW50ZXJzZWN0aW9uID0gbGFiZWxJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UocmF5SW50ZXJ2YWwpXG4gICAgICAgIHNlZ21lbnRJbnRlcnNlY3Rpb24gPSBzZWdtZW50SW50ZXJ2YWwuY29hbGVzY2VJblBsYWNlKHJheVNlZ21lbnRJbnRlcnZhbClcbiAgICAgICAgaWYgKCFsYWJlbEludGVyc2VjdGlvbi5lbXB0eSB8fCAhc2VnbWVudEludGVyc2VjdGlvbi5lbXB0eSkge1xuICAgICAgICAgIGF2YWlsYWJsZVNwYWNlIC09IHJrbC5hdmFpbGFibGUubWVhc3VyZU11bHRpcGxlSW50ZXJzZWN0aW9uKG11bHRpSW50ZXJ2YWwuY29hbGVzY2UobGFiZWxJbnRlcnNlY3Rpb24sIHNlZ21lbnRJbnRlcnNlY3Rpb24pKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBUaGlzIHJheSBpcyBub3QgZ29vZCBiZWNhdXNlIHdlIHRyeSB0byBtYXhpbWl6ZSB0aGUgbWluaW11bVxuICAgICAgaWYgKHJiZXN0ICYmIGF2YWlsYWJsZVNwYWNlIDwgbWluaW11bUF2YWlsYWJsZVNwYWNlKSB7XG4gICAgICAgIGNvbnRpbnVlIHJpamxvb3BcbiAgICAgIH1cbiAgICAgIFZpai5wdXNoKGF2YWlsYWJsZVNwYWNlKVxuICAgIH1cbiAgICBWaWouc29ydCgoaSwgaikgPT4gaSAtIGopIC8vIG9yZGVyIHRvIGNvbXBhcmUgaW4gbGV4aWNvZ3JhcGhpY2FsIG9yZGVyXG4gICAgaWYgKCFWYmVzdCB8fCB1dGlscy5jb21wYXJlQXJyYXlzTGV4aWNvZ3JhcGhpY2FsbHkoVmlqLCBWYmVzdCkgPCAwKSB7XG4gICAgICByYmVzdCA9IHJpalxuICAgICAgVmJlc3QgPSBWaWpcbiAgICAgIG1pbmltdW1BdmFpbGFibGVTcGFjZSA9IFZpai5yZWR1Y2UoKGksIGopID0+IE1hdGgubWluKGksIGopLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gICAgICBwYmVzdCA9IHBpXG4gICAgfVxuICB9XG4gIC8vIFdlIG5lZWQgdG8gcmV0dXJuIGludGVyc2VjdGlvbkRhdGEgYmVjYXVzZSB0aGUgcmVmZXJlbmNlIGhhcyBiZWVuIG5ldXRlcmVkIGluIGZpbmQgcmF5IGludGVyc2VjdGlvblxuICByZXR1cm4ge3JiZXN0OiByYmVzdCwgcGJlc3Q6IHBiZXN0fVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7aW50ZXJ2YWx9XG5mdW5jdGlvbiBJbnRlcnZhbCAoc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgLy8gY29uc29sZS5lcnJvcignV3Jvbmcgb3JkZXIgb2YgaW50ZXJ2YWwnLCBzdGFydCwgZW5kKVxuICAgIHRoaXMuZW1wdHkgPSB0cnVlXG4gICAgdGhpcy5zdGFydCA9IG51bGxcbiAgICB0aGlzLmVuZCA9IG51bGxcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIHRoaXMuc3RhcnQgPSBzdGFydFxuICB0aGlzLmVuZCA9IGVuZFxuICByZXR1cm4gdGhpc1xufVxuXG5JbnRlcnZhbC5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBJbnRlcnZhbCgxLCAtMSlcbn1cbkludGVydmFsLnByb3RvdHlwZS5pbnRlcnNlY3QgPSBmdW5jdGlvbiAoaW50ZXJ2YWwpIHtcbiAgaWYgKHRoaXMuZW1wdHkgfHwgaW50ZXJ2YWwuZW1wdHkpIHJldHVybiBJbnRlcnZhbC5lbXB0eSgpXG4gIHJldHVybiBuZXcgSW50ZXJ2YWwoTWF0aC5tYXgoaW50ZXJ2YWwuc3RhcnQsIHRoaXMuc3RhcnQpLCBNYXRoLm1pbihpbnRlcnZhbC5lbmQsIHRoaXMuZW5kKSlcbn1cblxuSW50ZXJ2YWwucHJvdG90eXBlLmNvYWxlc2NlID0gZnVuY3Rpb24gKGludGVydmFsKSB7XG4gIGlmICh0aGlzLmVtcHR5KSByZXR1cm4gaW50ZXJ2YWxcbiAgaWYgKGludGVydmFsLmVtcHR5KSByZXR1cm4gdGhpc1xuICBpZiAoaW50ZXJ2YWwuc3RhcnQgPiB0aGlzLmVuZCB8fCB0aGlzLnN0YXJ0ID4gaW50ZXJ2YWwuZW5kKSB7XG4gICAgLy8gV2UgcHJvYmFibHkgbmVlZCBhIG11bHRpIGludGVydmFsIGluIHRoaXMgY2FzZVxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNvYWxsZXNjZScpXG4gIH1cbiAgcmV0dXJuIG5ldyBJbnRlcnZhbChNYXRoLm1pbihpbnRlcnZhbC5zdGFydCwgdGhpcy5zdGFydCksIE1hdGgubWF4KGludGVydmFsLmVuZCwgdGhpcy5lbmQpKVxufVxuLy8gVE9ETyByZW1vdmUgY29hbGVzY2UgYW5kIHJlbmFtZSB0aGlzIG1ldGhvZCB0byBjb2FsZXNjZVxuLy8gbW9kaWZpZXMgaW50ZXJ2YWxcbkludGVydmFsLnByb3RvdHlwZS5jb2FsZXNjZUluUGxhY2UgPSBmdW5jdGlvbiAoaW50ZXJ2YWwpIHtcbiAgaWYgKHRoaXMuZW1wdHkpIHJldHVybiBpbnRlcnZhbFxuICBpZiAoaW50ZXJ2YWwuZW1wdHkpIHJldHVybiB0aGlzXG4gIGlmIChpbnRlcnZhbC5zdGFydCA+IHRoaXMuZW5kIHx8IHRoaXMuc3RhcnQgPiBpbnRlcnZhbC5lbmQpIHtcbiAgICBkZWJ1Z2dlclxuICAgIC8vIFdlIHByb2JhYmx5IG5lZWQgYSBtdWx0aSBpbnRlcnZhbCBpbiB0aGlzIGNhc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjb2FsbGVzY2UnKVxuICB9XG4gIHRoaXMuc3RhcnQgPSBNYXRoLm1pbihpbnRlcnZhbC5zdGFydCwgdGhpcy5zdGFydClcbiAgdGhpcy5lbmQgPSBNYXRoLm1heChpbnRlcnZhbC5lbmQsIHRoaXMuZW5kKVxuICByZXR1cm4gdGhpc1xufVxuSW50ZXJ2YWwucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5lbXB0eSkgcmV0dXJuIEludGVydmFsLmVtcHR5KClcbiAgcmV0dXJuIG5ldyBJbnRlcnZhbCh0aGlzLnN0YXJ0LCB0aGlzLmVuZClcbn1cbkludGVydmFsLnByb3RvdHlwZS5tZWFzdXJlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5lbXB0eSkgcmV0dXJuIDBcbiAgcmV0dXJuIE1hdGgucG93KDIsIC10aGlzLnN0YXJ0KSAtIE1hdGgucG93KDIsIC10aGlzLmVuZClcbn1cbmZ1bmN0aW9uIGludGVydmFsKHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIG5ldyBJbnRlcnZhbChzdGFydCwgZW5kKVxufVxuaW50ZXJ2YWwuZW1wdHkgPSBJbnRlcnZhbC5lbXB0eSIsIid1c2Ugc3RyaWN0J1xudmFyIGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG5tb2R1bGUuZXhwb3J0cyA9IHtsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbn1cblxuLyogUmVjdGFuZ2xlIGxrIGludGVyc2VjdHMgbGFiZWwgbGkgbW92aW5nIGZyb20gcGkgd2l0aCB2ZWN0b3IgdmkgaW4gcG9zaXRpdmUgdGltZSAqL1xuLy8gQ29tcGFyZSBjZW50ZXJzIG9mIHRoZSBsYWJlbHMgdGhleSBtdXN0IGJlIHdpdGhpbiBsaS5oZWlnaHQgLyAyICsgbGsuaGVpZ2h0IC8gMiBpbiB0aGUgdmVydGljYWwgdmFyaWFibGUgYW5kIGxpLndpZHRoIC8gMiArIGxrLndpZHRoIC8gMiBpbiB0aGUgaG9yaXpvbnRhbCB2YXJpYWJsZSwgaS5lIHNvbHZlIHxsay54IC0gKHBrLnggKyB0ICogdi54KXwgPCBkXG5mdW5jdGlvbiBsYWJlbFJlY3RhbmdsZUludGVyc2VjdGlvbiAobGssIGxpLCB2aSwgcGkpIHtcbiAgbGV0IG1pbiA9IDBcbiAgbGV0IG1heCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICBpZiAodmkueSAhPT0gMCkge1xuICAgIGNvbnN0IGZpcnN0SW50ZXJzZWN0aW9uID0gKGxrLmhlaWdodCAvIDIgKyBsaS5oZWlnaHQgLyAyIC0gbGkub2Zmc2V0WSArIChsay50b3AgKyBsay5ib3R0b20pIC8gMiAtIHBpLnkpIC8gdmkueVxuICAgIGNvbnN0IHNlY29uZEludGVyc2VjdGlvbiA9ICgtbGsuaGVpZ2h0IC8gMiAtIGxpLmhlaWdodCAvIDIgLSBsaS5vZmZzZXRZICsgKGxrLnRvcCArIGxrLmJvdHRvbSkgLyAyIC0gcGkueSkgLyB2aS55XG4gICAgLy8gTXVsdGlwbHlpbmcgYnkgYSBuZWdhdGl2ZSBzaWduIHJldmVyc2VzIGFuIGluZXF1YWxpdHlcbiAgICBpZiAodmkueSA+IDApIHtcbiAgICAgIG1heCA9IE1hdGgubWluKG1heCwgZmlyc3RJbnRlcnNlY3Rpb24pXG4gICAgICBtaW4gPSBNYXRoLm1heChtaW4sIHNlY29uZEludGVyc2VjdGlvbilcbiAgICB9IGVsc2Uge1xuICAgICAgbWluID0gTWF0aC5tYXgobWluLCBmaXJzdEludGVyc2VjdGlvbilcbiAgICAgIG1heCA9IE1hdGgubWluKG1heCwgc2Vjb25kSW50ZXJzZWN0aW9uKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyB2ZWN0b3IgaXMgdmVydGljYWwgYW5kIHRoZXkgd2lsbCBuZXZlciBpbnRlcnNlY3RcbiAgICBpZiAobGkub2Zmc2V0WSArIHBpLnkgLSAobGsudG9wICsgbGsuYm90dG9tKSAvIDIgPiBsay5oZWlnaHQgLyAyICsgbGkuaGVpZ2h0IC8gMikgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgICBpZiAobGkub2Zmc2V0WSArIHBpLnkgLSAobGsudG9wICsgbGsuYm90dG9tKSAvIDIgPCAtbGsuaGVpZ2h0IC8gMiAtIGxpLmhlaWdodCAvIDIpIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gIH1cbiAgaWYgKHZpLnggIT09IDApIHtcbiAgICBjb25zdCB0aGlyZEludGVyc2VjdGlvbiA9IChsay53aWR0aCAvIDIgKyBsaS53aWR0aCAvIDIgKyAobGsucmlnaHQgKyBsay5sZWZ0KSAvIDIgLSBwaS54IC0gbGkub2Zmc2V0WCkgLyB2aS54XG4gICAgY29uc3QgZm91cnRoSW50ZXJzZWN0aW9uID0gKC1say53aWR0aCAvIDIgLSBsaS53aWR0aCAvIDIgKyAobGsucmlnaHQgKyBsay5sZWZ0KSAvIDIgLSBwaS54IC0gbGkub2Zmc2V0WCkgLyB2aS54XG4gICAgaWYgKHZpLnggPiAwKSB7XG4gICAgICBtYXggPSBNYXRoLm1pbihtYXgsIHRoaXJkSW50ZXJzZWN0aW9uKVxuICAgICAgbWluID0gTWF0aC5tYXgobWluLCBmb3VydGhJbnRlcnNlY3Rpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIG1pbiA9IE1hdGgubWF4KG1pbiwgdGhpcmRJbnRlcnNlY3Rpb24pXG4gICAgICBtYXggPSBNYXRoLm1pbihtYXgsIGZvdXJ0aEludGVyc2VjdGlvbilcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKHBpLnggKyBsaS5vZmZzZXRYIC0gKGxrLnJpZ2h0ICsgbGsubGVmdCkgLyAyID4gbGsud2lkdGggLyAyICsgbGkud2lkdGggLyAyKSByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICAgIGlmIChwaS54ICsgbGkub2Zmc2V0WCAtIChsay5yaWdodCArIGxrLmxlZnQpIC8gMiA8IC1say53aWR0aCAvIDIgLSBsaS53aWR0aCAvIDIpIHJldHVybiBpbnRlcnZhbC5lbXB0eSgpXG4gIH1cblxuICAvLyBPbmx5IGludGVyZXN0ZWQgaW4gcG9zaXRpdmUgdmFsdWVzXG4gIHJldHVybiBpbnRlcnZhbChtaW4sIG1heClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuLy8gRmluZCBpbnRlcnZhbCBpbiB3aGljaCBhbiBpbnRlcnZhbCBhbmQgYSBzZWdtZW50IGludGVyc2VjdFxubW9kdWxlLmV4cG9ydHMgPSB7bGFiZWxTZWdtZW50SW50ZXJzZWN0aW9ufVxuXG52YXIgc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3NlZ21lbnQtc2VnbWVudC1pbnRlcnNlY3Rpb24nKS5zZWdtZW50U2VnbWVudEludGVyc2VjdGlvblxudmFyIGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG5cbi8vIExhYmVsIGxpIG1vdmVzIHdpdGggdmVjdG9yIHZpLiBXZSBmaW5kIHRoZSBpbnRlcnZhbCBhdCB3aGljaCBpdCBpbnRlcnNlY3RzIHRoZSBzZWdtZW50IHBrLCB2ay4gSWYgcGsgaXMgY29udGFpbmVkIHRoZW4gdGhlIGludGVydmFsIGdvZXMgdG8gSU5GSU5JVFlcbmZ1bmN0aW9uIGxhYmVsU2VnbWVudEludGVyc2VjdGlvbiAocGssIHZrLCBsaSwgdmksIHBpKSB7XG4gIC8vIHRyYW5zbGF0ZSBzbyB3ZSBjYW4gYXNzdW1lIHRoYXQgcG9pbnQgaXMgaW4gdGhlIGNlbnRyZVxuICBwayA9IHt4OiBway54IC0gcGkueCwgeTogcGsueSAtIHBpLnl9XG4gIC8vIFRPRE8gaGFuZGxlIHBhcmFsbGVsIGxpbmVzXG4gIC8vIFRoZSB0aW1lIGludGVydmFsIHdoZXJlIHRoZXkgbWVldCBpcyBjb25uZWN0ZWQgc28gaXQgaXMgZW5vdWdoIHRvIGZpbmQgdGhlIGVuZCBwb2ludHMuIFRoaXMgbXVzdCBvY2N1ciB3aGVuIGVpdGhlciB0aGUgY29ybmVycyBvZiB0aGUgbGFiZWwgaW50ZXJzZWN0IG9yIHdoZW5cbiAgY29uc3QgaW50ZXJzZWN0aW9ucyA9IFtdXG4gIC8vIHRoZSBlbmQgcG9pbnRzIG9mIHRoZSBzZWdtZW50IGludGVyc2VjdFxuICBmb3IgKGxldCB4IG9mIFstbGkud2lkdGggLyAyICsgbGkub2Zmc2V0WCwgbGkud2lkdGggLyAyICsgbGkub2Zmc2V0WF0pIHtcbiAgICBmb3IgKGxldCB5IG9mIFstbGkuaGVpZ2h0IC8gMiArIGxpLm9mZnNldFksIGxpLmhlaWdodCAvIDIgKyBsaS5vZmZzZXRZXSkge1xuICAgICAgbGV0IGludGVyc2VjdGlvbiA9IHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uKHt4LCB5fSwgdmksIHBrLCB2aylcbiAgICAgIC8vIEludGVyc2VjdHMgaW5zaWRlIHRoZSBzZWdtZW50XG4gICAgICBpZiAoaW50ZXJzZWN0aW9uICYmIGludGVyc2VjdGlvbi5zID49IDAgJiYgaW50ZXJzZWN0aW9uLnMgPD0gMSkge1xuICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goaW50ZXJzZWN0aW9uLnQpXG4gICAgICB9XG5cbiAgICAgIC8vIEdpdmVuIGEgcG9pbnQgdG8gd2UgdGFrZSB0aGUgc2lkZSBjb21pbmcgZnJvbSBpdCBpbiBjb3VudGVyIGNsb2Nrd2lzZVxuICAgICAgbGV0IHNpZGVcbiAgICAgIGlmICh4ICogeSA8IDApIHtcbiAgICAgICAgc2lkZSA9IHt4OiAwLCB5OiAtMiAqIHl9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaWRlID0ge3g6IC0yICogeCwgeTogMH1cbiAgICAgIH1cbiAgICAgIGludGVyc2VjdGlvbiA9IHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uKHt4LCB5fSwgc2lkZSwgcGssIHZpKVxuICAgICAgaWYgKGludGVyc2VjdGlvbiAmJiBpbnRlcnNlY3Rpb24udCA+PSAwICYmIGludGVyc2VjdGlvbi50IDw9IDEpIHtcbiAgICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKC1pbnRlcnNlY3Rpb24ucylcbiAgICAgICAgLy8vLyBUaGUgc2lkZSBjb3ZlcnMgdGhlIHBvaW50IGluIHRoZSBmdXR1cmVcbiAgICAgICAgLy9pZiAoaW50ZXJzZWN0aW9uLnMgPCAwKSB7XG4gICAgICAgIC8vICBpbnRlcnNlY3Rpb25zLnB1c2goTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxuICAgICAgICAvL31cbiAgICAgIH1cbiAgICAgIGludGVyc2VjdGlvbiA9IHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uKHt4LCB5fSwgc2lkZSwge3g6IHBrLnggKyB2ay54LCB5OiBway55ICsgdmsueX0sIHZpKVxuICAgICAgaWYgKGludGVyc2VjdGlvbiAmJiBpbnRlcnNlY3Rpb24udCA+PSAwICYmIGludGVyc2VjdGlvbi50IDw9IDEpIHtcbiAgICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKC1pbnRlcnNlY3Rpb24ucylcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdmFyIG1pbiA9IGludGVyc2VjdGlvbnMucmVkdWNlKChhLCBiKSA9PiBNYXRoLm1pbihhLCBiKSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxuICB2YXIgbWF4ID0gaW50ZXJzZWN0aW9ucy5yZWR1Y2UoKGEsIGIpID0+IE1hdGgubWF4KGEsIGIpLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpXG4gIG1pbiA9IE1hdGgubWF4KG1pbiwgMClcbiAgcmV0dXJuIGludGVydmFsKG1pbiwgbWF4KVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7bWFpbkFsZ29yaXRobX1cbmNvbnN0IHdvcmsgPSByZXF1aXJlKCd3ZWJ3b3JraWZ5JylcbmNvbnN0IGFsZ29yaXRobSA9IHdvcmsocmVxdWlyZSgnLi9tYWluLWFsZ29yaXRobS5qcycpKVxuY29uc3QgcHJvbWlzZVJlc29sdXRpb25zID0ge31cbmZ1bmN0aW9uIG1haW5BbGdvcml0aG0gKGV4dGVuZGVkUG9pbnRzLCBwYXJhbXMgPSB7fSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGV4dGVuZGVkUG9pbnRzID0gZXh0ZW5kZWRQb2ludHMubWFwKHAgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHAuaWQsXG4gICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgeDogcC5wb3NpdGlvbi54LFxuICAgICAgICAgIHk6IC1wLnBvc2l0aW9uLnkgLy8gVGhlIGFsZ29yaXRobSBleHBlY3RzIHkgdG8gZ3JvdyB1cHdhcmRzXG4gICAgICAgIH0sXG4gICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgaGVpZ2h0OiBwLmxhYmVsLmhlaWdodCxcbiAgICAgICAgICB3aWR0aDogcC5sYWJlbC53aWR0aCxcbiAgICAgICAgICBvZmZzZXRYOiBwLmxhYmVsLm9mZnNldFggfHwgMCxcbiAgICAgICAgICBvZmZzZXRZOiBwLmxhYmVsLm9mZnNldFkgfHwgMFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBjb25zdCBwcm9jZXNzVVVJRCA9IHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKS50b1N0cmluZygpIC8vIG5vIG5lZWQgZm9yIGFueXRoaW5nIGZhbmN5XG4gICAgYWxnb3JpdGhtLnBvc3RNZXNzYWdlKHtcbiAgICAgIHR5cGU6ICdzdGFydCcsXG4gICAgICBleHRlbmRlZFBvaW50cyxcbiAgICAgIHBhcmFtcyxcbiAgICAgIHByb2Nlc3NVVUlEXG4gICAgfSlcbiAgICBwcm9taXNlUmVzb2x1dGlvbnNbcHJvY2Vzc1VVSURdID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBldmVudC5kYXRhLnJlc3VsdC5tYXAocCA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IHAuaWQsXG4gICAgICAgICAgcmVjdGFuZ2xlOiB7XG4gICAgICAgICAgICBsZWZ0OiBwLnJlY3RhbmdsZS5sZWZ0LFxuICAgICAgICAgICAgcmlnaHQ6IHAucmVjdGFuZ2xlLnJpZ2h0LFxuICAgICAgICAgICAgdG9wOiAtcC5yZWN0YW5nbGUudG9wLFxuICAgICAgICAgICAgYm90dG9tOiAtcC5yZWN0YW5nbGUuYm90dG9tXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgcmV0dXJuIHJlc29sdmUocmVzdWx0KVxuICAgIH1cbiAgfSlcbn1cbmFsZ29yaXRobS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgZGF0YSA9IGV2ZW50LmRhdGFcbiAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICBjYXNlICdlbmQnOlxuICAgICAgZW5kRXZlbnQoZXZlbnQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmVycm9yKCdUaGlzIGV2ZW50IGNhc2Ugc2hvdWxkIG5vdCBoYXBwZW4nLCBkYXRhLnR5cGUpXG4gIH1cbn1cblxuZnVuY3Rpb24gZW5kRXZlbnQgKGV2ZW50KSB7XG4gIGNvbnN0IHtwcm9jZXNzVVVJRH0gPSBldmVudC5kYXRhXG4gIGNvbnN0IGNhbGxiYWNrID0gcHJvbWlzZVJlc29sdXRpb25zW3Byb2Nlc3NVVUlEXVxuICBjYWxsYmFjayhldmVudClcbiAgZGVsZXRlIHByb21pc2VSZXNvbHV0aW9uc1twcm9jZXNzVVVJRF1cbn0iLCJsZXQgTlVNQkVSX09GX1JBWVNcbi8vIENhbGxlZCBhcyB3ZWJ3b3JrZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNlbGYpIHtcbiAgY29uc3QgZXh0ZW5kZWRQb2ludE1ldGhvZHMgPSByZXF1aXJlKCcuL2V4dGVuZGVkLXBvaW50LW1ldGhvZHMnKVxuICBjb25zdCByYXlJbnRlcnNlY3Rpb24gPSByZXF1aXJlKCcuL3JheS1pbnRlcnNlY3Rpb24nKS5yYXlJbnRlcnNlY3Rpb25cbiAgY29uc3QgaXRlcmF0aXZlR3JlZWR5ID0gcmVxdWlyZSgnaXRlcmF0aXZlLWdyZWVkeScpXG4gIGlmICh0eXBlb2YgcG9zdE1lc3NhZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgc2VsZi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBkYXRhID0gZXZlbnQuZGF0YVxuICAgICAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICAgIGxhdW5jaE1haW5BbGdvcml0aG1Gcm9tRXZlbnQoZXZlbnQpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdOb3QgYSB2YWxpZCBldmVudCB0eXBlJywgZGF0YS50eXBlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxhdW5jaE1haW5BbGdvcml0aG1Gcm9tRXZlbnQgKGV2ZW50KSB7XG4gICAgY29uc3QgZGF0YSA9IGV2ZW50LmRhdGFcbiAgICBjb25zdCBleHRlbmRlZFBvaW50cyA9IGRhdGEuZXh0ZW5kZWRQb2ludHNcbiAgICBjb25zdCBwYXJhbXMgPSBkYXRhLnBhcmFtc1xuICAgIGNvbnN0IHByb2Nlc3NVVUlEID0gZGF0YS5wcm9jZXNzVVVJRCAvLyB3ZSB1c2UgdGhpcyBpbiBjYXNlIHRoZSBhbGdvcmlobSBpcyByZXF1aXJlZCBzZXZlcmFsIHRpbWVzXG4gICAgbWFpbkFsZ29yaXRobShleHRlbmRlZFBvaW50cywgcGFyYW1zKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICBwb3N0TWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ2VuZCcsXG4gICAgICAgICAgcHJvY2Vzc1VVSUQsXG4gICAgICAgICAgcmVzdWx0XG4gICAgICAgIH0pXG4gICAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gbWFpbkFsZ29yaXRobSAoZXh0ZW5kZWRQb2ludHMsIHBhcmFtcyA9IHt9KSB7XG4gICAgTlVNQkVSX09GX1JBWVMgPSAodHlwZW9mIHBhcmFtcy5OVU1CRVJfT0ZfUkFZUyA9PT0gJ251bWJlcicpID8gcGFyYW1zLk5VTUJFUl9PRl9SQVlTIDogM1xuICAgIGNvbnN0IE1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA9ICh0eXBlb2YgcGFyYW1zLk1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA9PT0gJ251bWJlcicpID8gcGFyYW1zLk1BWF9OVU1CRVJfT0ZfSVRFUkFUSU9OUyA6IDFcbiAgICBjb21wdXRlUmF5cyhleHRlbmRlZFBvaW50cylcbiAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5jb21wdXRlSW5pdGlhbEF2YWlsYWJlU3BhY2VzKGV4dGVuZGVkUG9pbnRzLCB7cmFkaXVzOiBwYXJhbXMucmFkaXVzIHx8IDIsIGJib3g6IHBhcmFtcy5iYm94fSlcbiAgICBleHRlbmRlZFBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5yZXNldEF2YWlsYWJsZVNwYWNlKHApXG4gICAgICBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwKVxuICAgIH0pXG4gICAgY29uc3QgcG9zc2libGVQb2ludHMgPSBleHRlbmRlZFBvaW50cy5maWx0ZXIocCA9PiBwLmF2YWlsYWJsZU1lYXN1cmUgPiAwKVxuICAgIHJldHVybiBpdGVyYXRpdmVHcmVlZHkuc29sdmUocmF5SW50ZXJzZWN0aW9uLCBwb3NzaWJsZVBvaW50cywgcmVzZXRGdW5jdGlvbiwge3NlcmlhbGl6ZUZ1bmN0aW9uLCBNQVhfTlVNQkVSX09GX0lURVJBVElPTlN9KVxuICB9XG5cbiAgZnVuY3Rpb24gY29tcHV0ZVJheXMgKGV4dGVuZGVkUG9pbnRzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHRlbmRlZFBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBpID0gZXh0ZW5kZWRQb2ludHNbaV1cbiAgICAgIHBpLnJheXMgPSBbXVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBOVU1CRVJfT0ZfUkFZUzsgaisrKSB7XG4gICAgICAgIHBpLnJheXMucHVzaCh7XG4gICAgICAgICAgaW5kZXg6IGkgKiBOVU1CRVJfT0ZfUkFZUyAqIE5VTUJFUl9PRl9SQVlTICogNCArIGogKiBOVU1CRVJfT0ZfUkFZUyAqIDQsXG4gICAgICAgICAgc2VsZkluZGV4OiBqLFxuICAgICAgICAgIHZlY3Rvcjoge1xuICAgICAgICAgICAgeDogTWF0aC5zaW4oMiAqIE1hdGguUEkgKiBqIC8gTlVNQkVSX09GX1JBWVMpLFxuICAgICAgICAgICAgeTogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBqIC8gTlVNQkVSX09GX1JBWVMpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4vLyBBdCBlYWNoIGl0ZXJhdGlvbiBvZiBpdGVyYXRpdmUgZ3JlZWR5IGlmIHRoZSBzb2x1dGlvbiBpcyBiZXR0ZXIgd2Ugc2VyaWFsaXplIHdoYXQgd2Ugb2J0YWluZWRcbiAgZnVuY3Rpb24gc2VyaWFsaXplRnVuY3Rpb24gKGFycmF5T2ZQb2ludHMpIHtcbiAgICAvLyBXaGVuIHdlIGxhYmVsIGEgcG9pbnQgd2UgcHJvbW90ZSBsYWJlbCB0byByZWN0YW5nbGUgYW5kIHdlIHJlc2V0IGl0IGF0IGVhY2ggaXRlcmF0aW9uXG4gICAgY29uc3QgbGFiZWxlZFBvaW50cyA9IGFycmF5T2ZQb2ludHMuZmlsdGVyKHBvaW50ID0+ICEhcG9pbnQucmVjdGFuZ2xlKVxuICAgIC8vIFRvIHNlcmlhbGl6ZSB3ZSBuZWVkIGFuIGlkXG4gICAgcmV0dXJuIGxhYmVsZWRQb2ludHMubWFwKHBvaW50ID0+IHsgcmV0dXJuIHtpZDogcG9pbnQuaWQsIHJlY3RhbmdsZTogT2JqZWN0LmFzc2lnbih7fSwgcG9pbnQucmVjdGFuZ2xlKX0gfSlcbiAgfVxuXG4vLyBBdCBlYWNoIGl0ZXJhdGlvbiBvZiBpdGVyYXRpdmUgZ3JlZWR5IHdlIHJlc2V0IHRoZSBjb25kaXRpb25zXG4gIGZ1bmN0aW9uIHJlc2V0RnVuY3Rpb24gKGdlbmVyYWxpemVkUG9pbnQpIHtcbiAgICBnZW5lcmFsaXplZFBvaW50LnJlY3RhbmdsZSA9IG51bGxcbiAgICBleHRlbmRlZFBvaW50TWV0aG9kcy5yZXNldEF2YWlsYWJsZVNwYWNlKGdlbmVyYWxpemVkUG9pbnQpXG4gIH1cbn1cblxuIiwiJ3VzZSBzdHJpY3QnXG5tb2R1bGUuZXhwb3J0cyA9IHttdWx0aUludGVydmFsfVxuY29uc3QgaW50ZXJ2YWwgPSByZXF1aXJlKCcuL2ludGVydmFsJykuaW50ZXJ2YWxcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG4vLyBEaXNqb2ludCB1bmlvbiBvZiBzZXZlcmFsIGludGVydmFsc1xuLy8gaW50ZXJ2YWxzIGFycmF5IG9mIGNvb3JkaW5hdGVzXG5mdW5jdGlvbiBNdWx0aUludGVydmFsIChpbnRlcnZhbHMsIGlzQ2xvbmUpIHtcbiAgLy8gTm90IHZlcnkgbmljZSBidXQgaXQgaXMgaGFyZCB0byBjbG9uZSBpbiBqc1xuICBpZiAoaXNDbG9uZSkge1xuICAgIHRoaXMuaW50ZXJ2YWxzID0gWy4uLmludGVydmFsc11cbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheShpbnRlcnZhbHMpIHx8IGludGVydmFscy5sZW5ndGggPT09IDApIHtcbiAgICB0aGlzLmludGVydmFscyA9IFtdXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICB0aGlzLmludGVydmFscyA9IFtdXG4gIHZhciBjaGVja2VkSW50ZXJ2YWxzID0gW11cbiAgLy8gU28gd2UgY2FuIGNoZWNrIGludGVydmFsXG4gIHZhciBpbnRlcnZhbENvbnN0cnVjdG9yID0gaW50ZXJ2YWwoMCwgMSkuY29uc3RydWN0b3JcbiAgZm9yIChsZXQgbXlJbnRlcnZhbCBvZiBpbnRlcnZhbHMpIHtcbiAgICBpZiAoIW15SW50ZXJ2YWwgaW5zdGFuY2VvZiBpbnRlcnZhbENvbnN0cnVjdG9yKSB7XG4gICAgICB0aGlzLmludGVydmFscyA9IFtdXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgICBpZiAoIW15SW50ZXJ2YWwuZW1wdHkpIHtcbiAgICAgIGNoZWNrZWRJbnRlcnZhbHMucHVzaChteUludGVydmFsLmNsb25lKCkpXG4gICAgfVxuICB9XG5cbiAgY2hlY2tlZEludGVydmFscy5zb3J0KChpMSwgaTIpID0+IGkxLnN0YXJ0IC0gaTIuc3RhcnQpXG5cbiAgLy8gTm93IHdlIG5lZWQgdG8gY29hbGVzY2UgaW50ZXJ2YWxzIGlmIG5lZWRlZFxuICBsZXQgbmV4dEludGVydmFsID0gbnVsbFxuICBmb3IgKGxldCBteUludGVydmFsIG9mIGNoZWNrZWRJbnRlcnZhbHMpIHtcbiAgICBpZiAobmV4dEludGVydmFsID09PSBudWxsKSB7XG4gICAgICBuZXh0SW50ZXJ2YWwgPSBteUludGVydmFsXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghbmV4dEludGVydmFsLmludGVyc2VjdChteUludGVydmFsKS5lbXB0eSkge1xuICAgICAgICBuZXh0SW50ZXJ2YWwuY29hbGVzY2VJblBsYWNlKG15SW50ZXJ2YWwpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmludGVydmFscy5wdXNoKG5leHRJbnRlcnZhbC5zdGFydCwgbmV4dEludGVydmFsLmVuZClcbiAgICAgICAgbmV4dEludGVydmFsID0gbXlJbnRlcnZhbFxuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAobmV4dEludGVydmFsKSB7XG4gICAgdGhpcy5pbnRlcnZhbHMucHVzaChuZXh0SW50ZXJ2YWwuc3RhcnQsIG5leHRJbnRlcnZhbC5lbmQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cbk11bHRpSW50ZXJ2YWwuZW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgTXVsdGlJbnRlcnZhbChbXSlcbn1cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAhdGhpcy5pbnRlcnZhbHMubGVuZ3RoXG59XG5cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLmludGVydmFsQ29uc3RydWN0b3IgPSBpbnRlcnZhbCgwLCAxKS5jb25zdHJ1Y3RvclxuXG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBNdWx0aUludGVydmFsKHRoaXMuaW50ZXJ2YWxzLCB0cnVlKVxufVxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKG15SW50ZXJ2YWwpIHtcbiAgaWYgKCFteUludGVydmFsIGluc3RhbmNlb2YgdGhpcy5pbnRlcnZhbENvbnN0cnVjdG9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYW4gaW50ZXJ2YWwnKVxuICB9XG4gIGlmICh0aGlzLmlzRW1wdHkoKSB8fCBteUludGVydmFsLmVtcHR5KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBfcmVtb3ZlKHRoaXMuaW50ZXJ2YWxzLCBteUludGVydmFsLnN0YXJ0LCBteUludGVydmFsLmVuZClcbiAgcmV0dXJuIHRoaXNcbn1cbi8vIFJlbW92ZXMgaW4gcGxhY2VcbmZ1bmN0aW9uIF9yZW1vdmUoaW50ZXJ2YWxzLCBteVN0YXJ0LCBteUVuZCkge1xuICBsZXQgaSA9IDBcbiAgd2hpbGUgKGkgPCBpbnRlcnZhbHMubGVuZ3RoKSB7XG4gICAgY29uc3QgaW50ZXJ2YWxTdGFydCA9IGludGVydmFsc1tpXVxuICAgIGNvbnN0IGludGVydmFsRW5kID0gaW50ZXJ2YWxzW2kgKyAxXVxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15RW5kKSB7XG4gICAgICBicmVhayAvLyBubyBtb3JlIGludGVyc2VjdGlvblxuICAgIH1cbiAgICAvLyBubyBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxFbmQgPD0gbXlTdGFydCkge1xuICAgICAgaSArPSAyXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICAvLyBmdWxsIGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbFN0YXJ0ID49IG15U3RhcnQgJiYgaW50ZXJ2YWxFbmQgPD0gbXlFbmQpIHtcbiAgICAgIGludGVydmFscy5zcGxpY2UoaSwgMilcbiAgICAgIC8vIGkgZG9lcyBub3QgZ3JvdyB3ZSBkZWNyZWFzZSBsZW5ndGhcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGxlZnQgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlTdGFydCAmJiBpbnRlcnZhbEVuZCA+IG15RW5kKSB7XG4gICAgICBpbnRlcnZhbHNbaV0gPSBteUVuZFxuICAgICAgYnJlYWsgLy8gVGhlcmUgd29uJ3QgYmUgYW55IG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIC8vIHJpZ2h0IGludGVyc2VjdGlvblxuICAgIGlmIChpbnRlcnZhbEVuZCA8PSBteUVuZCAmJiBpbnRlcnZhbFN0YXJ0IDwgbXlTdGFydCkge1xuICAgICAgaW50ZXJ2YWxzW2kgKyAxXSA9IG15U3RhcnRcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gaW50ZXJzZWN0cyBpbiB0aGUgbWlkZGxlXG4gICAgaWYgKGludGVydmFsRW5kID4gbXlFbmQgJiYgaW50ZXJ2YWxTdGFydCA8IG15U3RhcnQpIHtcbiAgICAgIGludGVydmFscy5zcGxpY2UoaSArIDEsIDAsIG15U3RhcnQsIG15RW5kKVxuICAgICAgYnJlYWsgLy8gdGhlcmUgd29uJ3QgYmUgYW55IG1vcmUgaW50ZXJzZWN0aW9uXG4gICAgfVxuICAgIGNvbnNvbGUuZXJyb3IoJ1RoaXMgc2hvdWxkIG5vdCBoYXBwZW4nLCBteVN0YXJ0LCBteUVuZCwgaW50ZXJ2YWxTdGFydCwgaW50ZXJ2YWxFbmQpXG4gICAgaSArPSAyXG4gIH1cbiAgcmV0dXJuIGludGVydmFsc1xufVxuXG4vLyBJbiBwbGFjZVxuTXVsdGlJbnRlcnZhbC5wcm90b3R5cGUubXVsdGlwbGVSZW1vdmUgPSBmdW5jdGlvbiAobXlNdWx0aUludGVydmFsKSB7XG4gIGlmICghbXlNdWx0aUludGVydmFsIGluc3RhbmNlb2YgTXVsdGlJbnRlcnZhbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGEgbXVsdGkgaW50ZXJ2YWwnKVxuICB9XG4gIGlmICh0aGlzLmlzRW1wdHkoKSB8fCBteU11bHRpSW50ZXJ2YWwuaXNFbXB0eSgpKSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IG15TXVsdGlJbnRlcnZhbC5pbnRlcnZhbHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBfcmVtb3ZlKHRoaXMuaW50ZXJ2YWxzLCBteU11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzW2ldLCBteU11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzW2kgKyAxXSlcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5mdW5jdGlvbiBfbWVhc3VyZUludGVyc2VjdGlvbiAoaW50ZXJ2YWxzLCBteVN0YXJ0LCBteUVuZCkge1xuICBsZXQgaSA9IDBcbiAgbGV0IG1lYXN1cmUgPSAwXG4gIHdoaWxlIChpIDwgaW50ZXJ2YWxzLmxlbmd0aCkge1xuICAgIGNvbnN0IGludGVydmFsU3RhcnQgPSBpbnRlcnZhbHNbaV1cbiAgICBjb25zdCBpbnRlcnZhbEVuZCA9IGludGVydmFsc1tpICsgMV1cbiAgICBpZiAoaW50ZXJ2YWxTdGFydCA+PSBteUVuZCkge1xuICAgICAgYnJlYWsgLy8gbm8gbW9yZSBpbnRlcnNlY3Rpb25cbiAgICB9XG4gICAgLy8gbm8gaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsRW5kIDw9IG15U3RhcnQpIHtcbiAgICAgIGkgKz0gMlxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gZnVsbCBpbnRlcnNlY3Rpb25cbiAgICBpZiAoaW50ZXJ2YWxTdGFydCA+PSBteVN0YXJ0ICYmIGludGVydmFsRW5kIDw9IG15RW5kKSB7XG4gICAgICBtZWFzdXJlICs9IHV0aWxzLm1lYXN1cmUoaW50ZXJ2YWxTdGFydCwgaW50ZXJ2YWxFbmQpXG4gICAgICBpICs9IDJcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGxlZnQgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsU3RhcnQgPj0gbXlTdGFydCAmJiBpbnRlcnZhbEVuZCA+IG15RW5kKSB7XG4gICAgICBtZWFzdXJlICs9IHV0aWxzLm1lYXN1cmUoaW50ZXJ2YWxTdGFydCwgbXlFbmQpXG4gICAgICBicmVhayAvLyBUaGVyZSB3b24ndCBiZSBhbnkgbW9yZSBpbnRlcnNlY3Rpb25cbiAgICB9XG4gICAgLy8gcmlnaHQgaW50ZXJzZWN0aW9uXG4gICAgaWYgKGludGVydmFsRW5kIDw9IG15RW5kICYmIGludGVydmFsU3RhcnQgPCBteVN0YXJ0KSB7XG4gICAgICBtZWFzdXJlICs9IHV0aWxzLm1lYXN1cmUobXlTdGFydCwgaW50ZXJ2YWxFbmQpXG4gICAgICBpICs9IDJcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGludGVyc2VjdHMgaW4gdGhlIG1pZGRsZVxuICAgIGlmIChpbnRlcnZhbEVuZCA+IG15RW5kICYmIGludGVydmFsU3RhcnQgPCBteVN0YXJ0KSB7XG4gICAgICBtZWFzdXJlICs9IHV0aWxzLm1lYXN1cmUobXlTdGFydCwgbXlFbmQpXG4gICAgICBicmVhayAvLyB0aGVyZSB3b24ndCBiZSBhbnkgbW9yZSBpbnRlcnNlY3Rpb25cbiAgICB9XG4gICAgY29uc29sZS5lcnJvcignVGhpcyBzaG91bGQgbm90IGhhcHBlbicsIG15U3RhcnQsIG15RW5kLCBpbnRlcnZhbFN0YXJ0LCBpbnRlcnZhbEVuZClcbiAgICBpICs9IDJcbiAgfVxuICByZXR1cm4gbWVhc3VyZVxufVxuXG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5tZWFzdXJlTXVsdGlwbGVJbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAobXVsdGlJbnRlcnZhbCkge1xuICBsZXQgbWVhc3VyZSA9IDBcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtdWx0aUludGVydmFsLmludGVydmFscy5sZW5ndGg7IGkgKz0gMikge1xuICAgIG1lYXN1cmUgKz0gX21lYXN1cmVJbnRlcnNlY3Rpb24odGhpcy5pbnRlcnZhbHMsIG11bHRpSW50ZXJ2YWwuaW50ZXJ2YWxzW2ldLCBtdWx0aUludGVydmFsLmludGVydmFsc1tpKzFdKVxuICB9XG4gIHJldHVybiBtZWFzdXJlXG59XG5cbk11bHRpSW50ZXJ2YWwucHJvdG90eXBlLm1lYXN1cmUgPSBmdW5jdGlvbiAoKSB7XG4gIGxldCBtZWFzdXJlID0gMFxuICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW50ZXJ2YWxzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgbWVhc3VyZSArPSB1dGlscy5tZWFzdXJlKHRoaXMuaW50ZXJ2YWxzW2ldLCB0aGlzLmludGVydmFsc1tpICsgMV0pXG4gIH1cbiAgcmV0dXJuIG1lYXN1cmVcbn1cblxuLy8gVE9ETyB0ZXN0XG5NdWx0aUludGVydmFsLnByb3RvdHlwZS5nZXRNaW4gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmlzRW1wdHkoKSkgcmV0dXJuIE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICByZXR1cm4gdGhpcy5pbnRlcnZhbHNbMF1cbn1cblxubXVsdGlJbnRlcnZhbC5jb2FsZXNjZSA9IGZ1bmN0aW9uIChpbnRlcnZhbCwgYW5vdGhlckludGVydmFsKSB7XG4gIGlmIChpbnRlcnZhbC5zdGFydCA+IGFub3RoZXJJbnRlcnZhbC5lbmQgfHwgYW5vdGhlckludGVydmFsLnN0YXJ0ID4gaW50ZXJ2YWwuZW5kKSB7XG4gICAgcmV0dXJuIG11bHRpSW50ZXJ2YWwoW2ludGVydmFsLCBhbm90aGVySW50ZXJ2YWxdKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBtdWx0aUludGVydmFsKFtpbnRlcnZhbC5jb2FsZXNjZShhbm90aGVySW50ZXJ2YWwpXSlcbiAgfVxufVxubXVsdGlJbnRlcnZhbC5lbXB0eSA9IE11bHRpSW50ZXJ2YWwuZW1wdHlcblxuZnVuY3Rpb24gbXVsdGlJbnRlcnZhbCAoaW50ZXJ2YWxzKSB7XG4gIHJldHVybiBuZXcgTXVsdGlJbnRlcnZhbChpbnRlcnZhbHMpXG59XG4iLCIndXNlIHN0cmljdCdcbm1vZHVsZS5leHBvcnRzID0ge3JheUludGVyc2VjdGlvbn1cblxuY29uc3QgZmluZEJlc3RSYXkgPSByZXF1aXJlKCcuL2ZpbmQtYmVzdC1yYXknKVxuY29uc3QgZXh0ZW5kZWRQb2ludE1ldGhvZHMgPSByZXF1aXJlKCcuL2V4dGVuZGVkLXBvaW50LW1ldGhvZHMnKVxuY29uc3QgbXVsdGlJbnRlcnZhbCA9IHJlcXVpcmUoJy4vbXVsdGktaW50ZXJ2YWwnKS5tdWx0aUludGVydmFsXG4vLyBCZXR0ZXIgdG8gZ3JhYiB0aGUgbW9kdWxlIGhlcmUgYW5kIGZldGNoIHRoZSBtZXRob2QgaW4gdGhlIGFsZ29yaXRobSwgdGhhdCB3YXkgd2UgY2FuIHN0dWJcbmNvbnN0IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJylcbmNvbnN0IGxhYmVsU2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vbGFiZWwtc2VnbWVudC1pbnRlcnNlY3Rpb24nKVxuY29uc3QgcmF5UmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9yYXktcmVjdGFuZ2xlLWludGVyc2VjdGlvbicpLnJheVJlY3RhbmdsZUludGVyc2VjdGlvblxuY29uc3QgcmF5U2VnbWVudEludGVyc2VjdGlvbiA9IHJlcXVpcmUoJy4vcmF5LXNlZ21lbnQtaW50ZXJzZWN0aW9uJykucmF5U2VnbWVudEludGVyc2VjdGlvblxuXG4vLyBUT0RPIHVzZSBzZXRzXG5hc3luYyBmdW5jdGlvbiByYXlJbnRlcnNlY3Rpb24gKHBvaW50c1RvTGFiZWwsIHBvaW50c05vdFRvTGFiZWwpIHtcbiAgcG9pbnRzVG9MYWJlbC5mb3JFYWNoKHA9PiBleHRlbmRlZFBvaW50TWV0aG9kcy51cGRhdGVBdmFpbGFibGVTcGFjZShwKSlcbiAgY29uc3QgcmVqZWN0ZWRQb2ludHMgPSBwb2ludHNUb0xhYmVsLmZpbHRlcihwID0+IHAuYXZhaWxhYmxlTWVhc3VyZSA9PT0gMClcbiAgLy8gUCBpbiB0aGUgYXJ0aWNsZVxuICB2YXIgcmVtYWluaW5nUG9pbnRzID0gcG9pbnRzVG9MYWJlbC5maWx0ZXIocCA9PiBwLmF2YWlsYWJsZU1lYXN1cmUgPiAwKVxuICB2YXIgUDAgPSBwb2ludHNUb0xhYmVsLmNvbmNhdChwb2ludHNOb3RUb0xhYmVsKVxuICBjb25zdCBwb2ludHNMYWJlbGVkID0gW10gLy8gSGVyZSB3ZSBkaWZmZXIgZnJvbSB0aGUgb3JpZ2luYWwgYXJ0aWNsZSwgb25jZSB3ZSBmaW5kIGEgcG9pbnQgaW4gUCB0byBsYWJlbCB3ZSByZW1vdmUgaXQgZnJvbSBQIGFuZCBhZGQgaXQgdG8gcG9pbnRzTGFiZWxlZCwgb3RoZXJ3aXNlIHRoZSBhbGdvcml0aG0gZG9lcyBub3QgZmluaXNoXG4gIHdoaWxlIChyZW1haW5pbmdQb2ludHMubGVuZ3RoICE9PSAwKSB7XG4gICAgbGV0IGJlc3RSYXkgPSBhd2FpdCBmaW5kQmVzdFJheS5maW5kQmVzdFJheShyZW1haW5pbmdQb2ludHMsIHBvaW50c05vdFRvTGFiZWwpXG4gICAgbGV0IHJpaiA9IGJlc3RSYXkucmJlc3RcbiAgICBsZXQgcGkgPSBiZXN0UmF5LnBiZXN0XG4gICAgaWYgKHJpaiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBJdCBjb3VsZCBvbmx5IGhhcHBlbiB0aGF0IHdlIGdldCByaWogdW5kZWZpbmVkIGluIHRoZSBmaXJzdCBpdGVyYXRpb25cbiAgICAgIGlmIChwb2ludHNMYWJlbGVkLmxlbmd0aCAhPT0gMCB8fCByZWplY3RlZFBvaW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGJlaGF2aW91cicpXG4gICAgICB9XG4gICAgICByZXR1cm4ge2Nob3NlbjogW10sIHJlamVjdGVkOiBbLi4ucG9pbnRzVG9MYWJlbF19XG4gICAgfVxuICAgIGxldCB2aSA9IHt4OiByaWoudmVjdG9yLnggKiByaWouYXZhaWxhYmxlLmdldE1pbigpLCB5OiByaWoudmVjdG9yLnkgKiByaWouYXZhaWxhYmxlLmdldE1pbigpfVxuICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnByb21vdGVMYWJlbFRvUmVjdGFuZ2xlKHBpLCB2aSlcbiAgICByZW1haW5pbmdQb2ludHMgPSByZW1haW5pbmdQb2ludHMuZmlsdGVyKGVsID0+IGVsICE9PSBwaSlcbiAgICBQMCA9IFAwLmZpbHRlcihlbCA9PiBlbCAhPT0gcGkpXG4gICAgcG9pbnRzTGFiZWxlZC5wdXNoKHBpKVxuICAgIGZvciAobGV0IHBrIG9mIFAwKSB7XG4gICAgICBmb3IgKGxldCBya2wgb2YgcGsucmF5cykge1xuICAgICAgICBsZXQgbGFiZWxJbnRlcnNlY3Rpb25cbiAgICAgICAgbGV0IHNlZ21lbnRJbnRlcnNlY3Rpb25cbiAgICAgICAgY29uc3QgbGFiZWxJbnRlcnZhbCA9IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uLmxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uKHBpLnJlY3RhbmdsZSwgcGsubGFiZWwsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCBzZWdtZW50SW50ZXJ2YWwgPSBsYWJlbFNlZ21lbnRJbnRlcnNlY3Rpb24ubGFiZWxTZWdtZW50SW50ZXJzZWN0aW9uKHBpLnBvc2l0aW9uLCB2aSwgcGsubGFiZWwsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCByYXlJbnRlcnZhbCA9IHJheVJlY3RhbmdsZUludGVyc2VjdGlvbihwaS5yZWN0YW5nbGUsIHJrbC52ZWN0b3IsIHBrLnBvc2l0aW9uKVxuICAgICAgICBjb25zdCByYXlTZWdtZW50SW50ZXJ2YWwgPSByYXlTZWdtZW50SW50ZXJzZWN0aW9uKHBpLnBvc2l0aW9uLCB2aSwgcGsucG9zaXRpb24sIHJrbC52ZWN0b3IpXG4gICAgICAgIGxhYmVsSW50ZXJzZWN0aW9uID0gbGFiZWxJbnRlcnZhbC5jb2FsZXNjZUluUGxhY2UocmF5SW50ZXJ2YWwpXG4gICAgICAgIHNlZ21lbnRJbnRlcnNlY3Rpb24gPSBzZWdtZW50SW50ZXJ2YWwuY29hbGVzY2VJblBsYWNlKHJheVNlZ21lbnRJbnRlcnZhbClcbiAgICAgICAgaWYgKCFsYWJlbEludGVyc2VjdGlvbi5lbXB0eSB8fCAhc2VnbWVudEludGVyc2VjdGlvbi5lbXB0eSkge1xuICAgICAgICAgIHJrbC5hdmFpbGFibGUubXVsdGlwbGVSZW1vdmUobXVsdGlJbnRlcnZhbC5jb2FsZXNjZShsYWJlbEludGVyc2VjdGlvbiwgc2VnbWVudEludGVyc2VjdGlvbikpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGV4dGVuZGVkUG9pbnRNZXRob2RzLnVwZGF0ZUF2YWlsYWJsZVNwYWNlKHBrKVxuXG4gICAgICAvLyBUaGUgb3JpZ2luYWwgYXJ0aWNsZSBpcyBub3QgdmVyeSBjbGVhciBoZXJlLiBJdCByZW1vdmVzIHRoZSBwb2ludCBmcm9tIFAgYnV0IHRoZSBpdGVyYXRpb24gd2FzIG9uIFAwLiBJIHN1cHBvc2UgdGhhdCBpZiB0aGUgaW50ZWdyYWwgaXMgMCBhbmQgdGhlIHBvaW50IGlzIGluIFAgdGhlbiBpdCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5leHQgaXRlcmF0aW9uIG9mIHRoZSBncmVlZHkgYWxnb3JpdGhtXG4gICAgICBpZiAocGsuYXZhaWxhYmxlTWVhc3VyZSA9PT0gMCAmJiByZW1haW5pbmdQb2ludHMuZmluZEluZGV4KGVsID0+IGVsID09PSBwaykgIT09IC0xKXtcbiAgICAgICAgUDAgPSBQMC5maWx0ZXIoZWwgPT4gZWwgIT09IHBrKVxuICAgICAgICByZW1haW5pbmdQb2ludHMgPSByZW1haW5pbmdQb2ludHMuZmlsdGVyKGVsID0+IGVsICE9PSBwaylcbiAgICAgICAgcmVqZWN0ZWRQb2ludHMucHVzaChwaylcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtjaG9zZW46IHBvaW50c0xhYmVsZWQsIHJlamVjdGVkOiByZWplY3RlZFBvaW50c31cbn0iLCIvLyBHaXZlbiBhIHJheSBhbmQgYSByZWN0YW5nbGUsIHJldHVybiB0aGUgaW50ZXJ2YWwgZnJvbSB0aGUgaW50ZXJzZWN0aW9uIHRvIGluZmluaXR5IChpdCBibG9ja3MgdGhlIHJheSlcbm1vZHVsZS5leHBvcnRzID0ge3JheVJlY3RhbmdsZUludGVyc2VjdGlvbn1cbmNvbnN0IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9sYWJlbC1yZWN0YW5nbGUtaW50ZXJzZWN0aW9uJykubGFiZWxSZWN0YW5nbGVJbnRlcnNlY3Rpb25cbmNvbnN0IGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG5cbmZ1bmN0aW9uIHJheVJlY3RhbmdsZUludGVyc2VjdGlvbiAobGssIHZpLCBwaSkge1xuICAvLyBCYXNpY2FsbHkgbWFrZSBhIGZha2UgbGFiZWwgb2YgMCBoZWlnaHQgYW5kIHdpZHRoXG4gIGNvbnN0IGxpID0ge2hlaWdodDogMCwgb2Zmc2V0WDogMCwgb2Zmc2V0WTogMCwgd2lkdGg6IDB9XG4gIGNvbnN0IGludGVyc2VjdGlvbiA9IGxhYmVsUmVjdGFuZ2xlSW50ZXJzZWN0aW9uKGxrLCBsaSwgdmksIHBpKVxuICBpZiAoaW50ZXJzZWN0aW9uLmVtcHR5KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdGlvblxuICB9XG4gIHJldHVybiBpbnRlcnZhbChpbnRlcnNlY3Rpb24uc3RhcnQsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge3JheVNlZ21lbnRJbnRlcnNlY3Rpb259XG5cbmNvbnN0IHNlZ21lbnRTZWdtZW50SW50ZXJzZWN0aW9uID0gcmVxdWlyZSgnLi9zZWdtZW50LXNlZ21lbnQtaW50ZXJzZWN0aW9uJykuc2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb25cbmNvbnN0IGludGVydmFsID0gcmVxdWlyZSgnLi9pbnRlcnZhbCcpLmludGVydmFsXG5cbi8qXG5waiwgdmogZGVmaW5lcyBhIHJheVxuICovXG5mdW5jdGlvbiByYXlTZWdtZW50SW50ZXJzZWN0aW9uIChwaSwgdmksIHBqLCB2aikge1xuICBjb25zdCBpbnRlcnNlY3Rpb24gPSBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbihwaiwgdmosIHBpLCB2aSlcbiAgaWYgKGludGVyc2VjdGlvbiA9PT0gbnVsbCkgcmV0dXJuIGludGVydmFsLmVtcHR5KClcbiAgY29uc3Qge3QsIHN9ID0gaW50ZXJzZWN0aW9uXG4gIC8vIHQgaXMgdGltZSBpbiByYXksIHMgcGFyYW1ldGVyIG9uIHRoZSBzZWdtZW50XG4gIGlmICh0IDw9IDAgfHwgcyA8IDAgfHwgcyA+IDEpIHtcbiAgICByZXR1cm4gaW50ZXJ2YWwuZW1wdHkoKVxuICB9XG4gIHJldHVybiBpbnRlcnZhbCh0LCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG59IiwibW9kdWxlLmV4cG9ydHMgPSB7c2VnbWVudFNlZ21lbnRJbnRlcnNlY3Rpb259XG4vLyBBIHBvaW50IHBpIG1vdmVzIHdpdGggdmksIGEgc2VnbWVudCBpcyBkZWZpbmVkIHdpdGggcGosIHZqLCB3ZSBmaW5kIHRoZSB0aW1lIHQgYXQgd2hpY2ggdGhlIHBvaW50IGludGVyc2VjdHMgYW5kIHJldHVybnMgcGFyYW1ldGVycyBzIG9uIHRoZSBzZWdtZW50XG4vLyBUT0RPIGNoYW5nZSBvcmRlciBzbyB0aGF0IHBqLCB2aiBpcyB0aGUgcmF5XG5mdW5jdGlvbiBzZWdtZW50U2VnbWVudEludGVyc2VjdGlvbiAocGksIHZpLCBwaiwgdmogLyogVmVjdG9yIG9mIHRoZSBzZWdtZW50ICovKSB7XG4gIC8vICh2aSAtdmopKHQsIHMpXlQgPSAocGogLSBwaSlcbiAgdmFyIGRldCA9IC0odmkueCAqIHZqLnkgLSB2ai54ICogdmkueSlcbiAgaWYgKGRldCA9PT0gMCkgeyAvLyBQYXJhbGxlbCBsaW5lc1xuICAgIC8vIFRlc3QgdGhpc1xuICAgIGlmICgocGkueCAtIHBqLngpICogdmoueSAtIChwaS5qIC0gcGoueSkgKiB2ai54ICE9PSAwKSByZXR1cm4gbnVsbCAvLyBMaW5lIGRvZXMgbm90IGJlbG9uZ1xuICAgIC8vIFRPRE8gY29uY3VycmVudCBsaW5lc1xuICAgIHRocm93IG5ldyBFcnJvcignUGFyYWxsZWwgbGluZXMgbm90IGFsbG93ZWQnKSAvLyBUaGlzIG11c3QgYmUgaGFuZGxlZCBvdXQgb2YgdGhlIGFsZ29yaXRobVxuICB9XG4gIGNvbnN0IHQgPSAoLShwai54IC0gcGkueCkgKiB2ai55ICsgKHBqLnkgLSBwaS55KSAqIHZqLngpIC8gZGV0XG4gIGNvbnN0IHMgPSAoLShwai54IC0gcGkueCkgKiB2aS55ICsgKHBqLnkgLSBwaS55KSAqIHZpLngpIC8gZGV0XG4gIHJldHVybiB7dCwgc31cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge2NvbXBhcmVBcnJheXNMZXhpY29ncmFwaGljYWxseSwgbWVhc3VyZX1cblxuZnVuY3Rpb24gY29tcGFyZUFycmF5c0xleGljb2dyYXBoaWNhbGx5IChhcnIxLCBhcnIyKSB7XG4gIHZhciBpID0gMFxuICB3aGlsZSAoaSA8IE1hdGgubWluKGFycjEubGVuZ3RoLCBhcnIyLmxlbmd0aCkpIHtcbiAgICBpZiAoYXJyMVtpXSAhPT0gYXJyMltpXSkgcmV0dXJuIGFycjFbaV0gLSBhcnIyW2ldXG4gICAgaSsrXG4gIH1cbiAgcmV0dXJuIGFycjEubGVuZ3RoIC0gYXJyMi5sZW5ndGhcbn1cblxuZnVuY3Rpb24gbWVhc3VyZSAoc3RhcnQsIGVuZCkge1xuICByZXR1cm4gTWF0aC5wb3coMiwgLXN0YXJ0KSAtIE1hdGgucG93KDIsIC1lbmQpXG59Il19
