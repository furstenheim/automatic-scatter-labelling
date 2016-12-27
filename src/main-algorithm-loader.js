module.exports = {mainAlgorithm}
var MainAlgorithmWorker = require('worker-loader!./main-algorithm')
const webgl = require('./webgl/webgl')

function mainAlgorithm (extendedPoints, params = {}) {
  return new Promise(function (resolve, reject) {
    const NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3
    const isWebgl = params.isWebgl
    const algorithm = new MainAlgorithmWorker
    let intersectionData, computeIntersectionAsync, computeIntersection, rectangleData, readIntersection
    if (isWebgl) {
      ({intersectionData, computeIntersection, rectangleData, computeIntersectionAsync, readIntersection} = webgl.setUp(extendedPoints, NUMBER_OF_RAYS))
      algorithm.postMessage({
        extendedPoints,
        params,
        intersectionData,
        rectangleData,
      }, [intersectionData.buffer, rectangleData.buffer])
      algorithm.onmessage = function (event) {
        var data = event.data
        if (data.type === 'end') {
          return resolve(data.result)
        } else if (data.type === 'computeIntersectionAsync') {
          const {rectangleData} = computeIntersectionAsync(data.rectangleData, data.pix, data.piy)
          algorithm.postMessage({
            type: 'computeIntersectionAsync',
            rectangleData
          }, [rectangleData.buffer])
        } else if (data.type === 'readIntersection'){
          const {intersectionData} = readIntersection(data.intersectionData)
          algorithm.postMessage({
            type: 'readIntersection',
            intersectionData,
          }, [intersectionData.buffer])
        } else {
          const {intersectionData, rectangleData} = computeIntersection(data.rectangleData, data.pix, data.piy, data.intersectionData)
          algorithm.postMessage({
            type: 'computeIntersection',
            intersectionData,
            rectangleData
          }, [intersectionData.buffer, rectangleData.buffer])
        }
      }
    } else {
      algorithm.postMessage({
        extendedPoints,
        params
      })
      algorithm.onmessage = function (event) {
        var data = event.data
        if (data.type === 'end') {
          return resolve(data.result)
        }
      }
    }


  })
}