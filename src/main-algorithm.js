'use strict'
module.exports = {mainAlgorithm}

const extendedPointMethods = require('./extended-point-methods')
const rayIntersection = require('./ray-intersection').rayIntersection
const _ = require('lodash')
const iterativeGreedy = require('iterative-greedy')
const webgl = require('./webgl/webgl')
let NUMBER_OF_RAYS

function mainAlgorithm (extendedPoints, params = {}) {
  NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3
  const MAX_NUMBER_OF_ITERATIONS = _.isNumber(params.MAX_NUMBER_OF_ITERATIONS) ? params.MAX_NUMBER_OF_ITERATIONS : 1
  const isWebgl = true
  computeRays(extendedPoints)
  if (isWebgl) {
    var {intersectionData, radiusData, computeIntersection} = webgl.setUp(extendedPoints, NUMBER_OF_RAYS)
  }
  extendedPointMethods.computeInitialAvailabeSpaces(extendedPoints, {radius: params.radius || 2, bbox: params.bbox})
  return iterativeGreedy.solve(_.partialRight(rayIntersection, isWebgl, intersectionData, computeIntersection), extendedPoints, resetFunction, {serializeFunction, MAX_NUMBER_OF_ITERATIONS})
}

function computeRays (extendedPoints) {
  for (let j = 0; j < extendedPoints.length; j++) {
    let pi = extendedPoints[j]
    pi.rays = []
    for (let i = 0; i <= NUMBER_OF_RAYS; i++) {
      pi.rays.push( {
        index: j*NUMBER_OF_RAYS*4 + i * 4,
        vector : {
          x: Math.sin(2 * Math.PI * i / NUMBER_OF_RAYS),
          y: Math.cos(2 * Math.PI * i / NUMBER_OF_RAYS)
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