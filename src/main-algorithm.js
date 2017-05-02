let NUMBER_OF_RAYS
// Called as webworker
module.exports = function (self) {
  importScripts('https://cdn.jsdelivr.net/lodash/4.17.4/lodash.min.js')
  const extendedPointMethods = require('./extended-point-methods')
  const _ = require('lodash')
  const rayIntersection = require('./ray-intersection').rayIntersection
  const iterativeGreedy = require('iterative-greedy')
  if (typeof postMessage !== 'undefined') {
    self.onmessage = function (event) {
      var data = event.data
      switch (data.type) {
        case 'start':
          launchMainAlgorithmFromEvent(event)
          break
        default:
          console.error('Not a valid event type', data.type)
      }
    }
  }

  function launchMainAlgorithmFromEvent (event) {
    const data = event.data
    const extendedPoints = data.extendedPoints
    const params = data.params
    const processUUID = data.processUUID // we use this in case the algorihm is required several times
    mainAlgorithm(extendedPoints, params)
      .then(function (result) {
        postMessage({
          type: 'end',
          processUUID,
          result
        })
      })
  }

  function mainAlgorithm (extendedPoints, params = {}) {
    NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3
    const MAX_NUMBER_OF_ITERATIONS = _.isNumber(params.MAX_NUMBER_OF_ITERATIONS) ? params.MAX_NUMBER_OF_ITERATIONS : 1
    computeRays(extendedPoints)
    extendedPointMethods.computeInitialAvailabeSpaces(extendedPoints, {radius: params.radius || 2, bbox: params.bbox})
    extendedPoints.forEach(function (p) {
      extendedPointMethods.resetAvailableSpace(p)
      extendedPointMethods.updateAvailableSpace(p)
    })
    const possiblePoints = extendedPoints.filter(p => p.availableMeasure > 0)
    return iterativeGreedy.solve(_.partialRight(rayIntersection), possiblePoints, resetFunction, {serializeFunction, MAX_NUMBER_OF_ITERATIONS})
  }

  function computeRays (extendedPoints) {
    for (let i = 0; i < extendedPoints.length; i++) {
      let pi = extendedPoints[i]
      pi.rays = []
      for (let j = 0; j < NUMBER_OF_RAYS; j++) {
        pi.rays.push( {
          index: i*NUMBER_OF_RAYS * NUMBER_OF_RAYS *4 + j * NUMBER_OF_RAYS * 4,
          selfIndex: j,
          vector : {
            x: Math.sin(2 * Math.PI * j / NUMBER_OF_RAYS),
            y: Math.cos(2 * Math.PI * j / NUMBER_OF_RAYS)
          }
        })
      }
    }
  }

// At each iteration of iterative greedy if the solution is better we serialize what we obtained
  function serializeFunction (arrayOfPoints) {
    // When we label a point we promote label to rectangle and we reset it at each iteration
    const labeledPoints = arrayOfPoints.filter(point => !!point.rectangle)
    // To serialize we need an id
    return labeledPoints.map(point => { return {id: point.id, rectangle: _.clone(point.rectangle)} })
  }

// At each iteration of iterative greedy we reset the conditions
  function resetFunction (generalizedPoint) {
    generalizedPoint.rectangle = null
    extendedPointMethods.resetAvailableSpace(generalizedPoint)
  }
}

