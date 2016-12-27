module.exports = {mainAlgorithm}

const extendedPointMethods = require('./extended-point-methods')
const rayIntersection = require('./ray-intersection').rayIntersection
const _ = require('lodash')
const iterativeGreedy = require('iterative-greedy')
const webgl = require('./webgl/webgl')
let NUMBER_OF_RAYS

// Called as webworker
if (typeof postMessage !== 'undefined') {
  const csp = require('js-csp')
  const computeAsyncCh = csp.chan(1)
  const computeCh = csp.chan(1)
  const readCh = csp.chan(1)
  onmessage = function (event) {
    var data = event.data
    if (data.type === 'computeIntersectionAsync') {
      return csp.putAsync(computeAsyncCh, data)
    } else if (data.type === 'readIntersection') {
      return csp.putAsync(readCh, data)
    } else if (data.type === 'computeIntersection') {
      return csp.putAsync(computeCh, data)
    }
    var extendedPoints = data.extendedPoints
    var params = data.params
    var computeIntersection, computeIntersectionAsync, readIntersection
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
          csp.takeAsync(computeCh, data => resolve({intersectionData: data.intersectionData, rectangleData: data.rectangleData}))
        })
      }
      computeIntersectionAsync = function (rectangleData, pix, piy) {
        return new Promise(function (resolve, reject) {
          postMessage({
            type: 'computeIntersectionAsync',
            rectangleData,
            pix,
            piy,
          }, [rectangleData.buffer])
          csp.takeAsync(computeAsyncCh, data => resolve({rectangleData: data.rectangleData}))
        })
      }
      readIntersection = function (intersectionData) {
        return new Promise(function (resolve, reject) {
          postMessage({
            type: 'readIntersection',
            intersectionData
          }, [intersectionData.buffer])
          csp.takeAsync(readCh, data => resolve({intersectionData: data.intersectionData}))
        })
      }
      params.intersectionData = data.intersectionData
      params.rectangleData = data.rectangleData
      params.computeIntersection = computeIntersection
      params.computeIntersectionAsync = computeIntersectionAsync
      params.readIntersection = readIntersection
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
  var intersectionData, computeIntersection, rectangleData, readIntersection, computeIntersectionAsync
  if (isWebgl && !params.intersectionData) {
    ({intersectionData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, NUMBER_OF_RAYS))
  } else if (isWebgl && params.intersectionData) {
    ({intersectionData, computeIntersection, rectangleData, readIntersection, computeIntersectionAsync} = params)
  }
  extendedPointMethods.computeInitialAvailabeSpaces(extendedPoints, {radius: params.radius || 2, bbox: params.bbox})
  return iterativeGreedy.solve(_.partialRight(rayIntersection, isWebgl, {intersectionData, computeIntersection, rectangleData, readIntersection, computeIntersectionAsync}), extendedPoints, resetFunction, {serializeFunction, MAX_NUMBER_OF_ITERATIONS})
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