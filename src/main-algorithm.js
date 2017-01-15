module.exports = {mainAlgorithm}

const extendedPointMethods = require('./extended-point-methods')
const rayIntersection = require('./ray-intersection').rayIntersection
const _ = require('lodash')
const iterativeGreedy = require('iterative-greedy')
const webgl = require('./webgl/webgl')
let NUMBER_OF_RAYS

// Called as webworker
if (typeof postMessage !== 'undefined') {
  onmessage = function (event) {
    var data = event.data
    var extendedPoints = data.extendedPoints
    var params = data.params
    var computeIntersection
    var intersectionData
    if (params.isWebgl) {
      computeIntersection = function (rectangleData, pix, piy, intersectionData) {
        return new Promise(function (resolve, reject) {
          postMessage({
            type: 'computeIntersection',
            rectangleData,
            pix,
            piy,
            intersectionData
          }, [rectangleData.buffer, intersectionData.buffer])
          onmessage = function (event) {
            resolve({intersectionData: event.data.intersectionData, rectangleData: event.data.rectangleData})
          }
        })
      }
      params.intersectionData = data.intersectionData
      params.rectangleData = data.rectangleData
      params.computeIntersection = computeIntersection
    }
    mainAlgorithm(extendedPoints, params)
      .then(function (result) {
        postMessage({
          type: 'end',
          result
        })
      })
  }
}

function mainAlgorithm (extendedPoints, params = {}) {
  NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3
  const MAX_NUMBER_OF_ITERATIONS = _.isNumber(params.MAX_NUMBER_OF_ITERATIONS) ? params.MAX_NUMBER_OF_ITERATIONS : 1
  const isWebgl = params.isWebgl
  computeRays(extendedPoints)
  var intersectionData, computeIntersection, rectangleData
  if (isWebgl && !params.intersectionData) {
    ({intersectionData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, NUMBER_OF_RAYS))
  } else if (isWebgl && params.intersectionData) {
    ({intersectionData, computeIntersection, rectangleData} = params)
  }
  extendedPointMethods.computeInitialAvailabeSpaces(extendedPoints, {radius: params.radius || 2, bbox: params.bbox})
  extendedPoints.forEach(function (p) {
    extendedPointMethods.resetAvailableSpace(p)
    extendedPointMethods.updateAvailableSpace(p)
  })
  const possiblePoints = extendedPoints.filter(p => p.availableMeasure > 0)
  return iterativeGreedy.solve(_.partialRight(rayIntersection, isWebgl, {intersectionData, computeIntersection, rectangleData}), possiblePoints, resetFunction, {serializeFunction, MAX_NUMBER_OF_ITERATIONS})
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