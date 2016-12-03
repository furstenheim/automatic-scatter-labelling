'use strict'
module.exports = {mainAlgorithm}

const extendedPointMethods = require('./extended-point-methods')
const rayIntersection = require('./ray-intersection').rayIntersection
const _ = require('lodash')
const iterativeGreedy = require('iterative-greedy')

let NUMBER_OF_RAYS

function mainAlgorithm (extendedPoints, params = {}) {
  NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3
  computeRays(extendedPoints)
  extendedPointMethods.computeInitialAvailabeSpaces(extendedPoints, {radius: params.radius, bbox: params.bbox})
  return iterativeGreedy.solve(rayIntersection, extendedPoints, resetFunction, {serializeFunction, MAX_NUMBER_OF_ITERATIONS: 1})
}

function computeRays (extendedPoints) {
  for (let pi of extendedPoints) {
    pi.rays = []
    for (let i = 0; i <= NUMBER_OF_RAYS; i++) {
      pi.rays.push( {
        vector : {
          y: Math.sin(2 * Math.PI * i / NUMBER_OF_RAYS),
          x: Math.cos(2 * Math.PI * i / NUMBER_OF_RAYS)
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