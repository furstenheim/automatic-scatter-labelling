module.exports = {mainAlgorithm}

const extendedPointMethods = require('./extended-point-methods')
const findBestRay = require('./find-best-ray').findBestRay
const _ = require('lodash')
const iterativeGreedy = require('iterative-greedy')

const NUMBER_OF_RAYS = 128

function mainAlgorithm (extendedPoints) {
  computeRays(extendedPoints)
  extendedPointMethods.computeInitialAvailabeSpaces(extendedPoints)
  var result = iterativeGreedy.solve(findBestRay, extendedPoints, resetFunction, {serializeFunction})
  console.log(result)
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
  console.log('reset function', generalizedPoint)
}