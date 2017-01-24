module.exports = {mainAlgorithm}
var MainAlgorithmWorker = require('worker-loader!./main-algorithm')
const webgl = require('./webgl/webgl')
const algorithm = new MainAlgorithmWorker
const webGLFunctions = {} // Here we store the reference to the functions
const promiseResolutions = {}
function mainAlgorithm (extendedPoints, params = {}) {
  return new Promise(function (resolve, reject) {
    const NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3
    const isWebgl = params.isWebgl
    let intersectionData, computeIntersection, rectangleData
    const processUUID = parseInt(Math.random() * 1000000).toString() // no need for anything fancy
    if (isWebgl) {
      ({intersectionData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, NUMBER_OF_RAYS))
      algorithm.postMessage({
        type: 'start',
        extendedPoints,
        params,
        intersectionData,
        rectangleData,
        processUUID
      }, [intersectionData.buffer, rectangleData.buffer])
      webGLFunctions[processUUID] = computeIntersection
    } else {
      algorithm.postMessage({
        type: 'start',
        extendedPoints,
        params,
        processUUID
      })
    }
    promiseResolutions[processUUID] = function (event) {
      const data = event.data
      return resolve(data.result)
    }
  })
}
algorithm.onmessage = function (event) {
  const data = event.data
  switch (data.type) {
    case 'end':
      endEvent(event)
      break
    case 'computeIntersection':
      computeInGPU(event)
      break
    default:
      console.error('This event case should not happen', data.type)
  }
}
function computeInGPU (event) {
  const data = event.data
  const processUUID = data.processUUID
  const computeIntersection = webGLFunctions[processUUID]
  const {intersectionData, rectangleData} = computeIntersection(data.rectangleData, data.pix, data.piy, data.intersectionData)
  algorithm.postMessage({
    intersectionData,
    rectangleData,
    uuid: data.uuid,
    type: 'computeIntersection'
  }, [intersectionData.buffer, rectangleData.buffer])
}

function endEvent (event) {
  const {processUUID} = event.data
  const callback = promiseResolutions[processUUID]
  callback(event)
  delete promiseResolutions[processUUID]
  delete webGLFunctions[processUUID]
}