module.exports = {mainAlgorithm}
var MainAlgorithmWorker = require('worker-loader!./main-algorithm')
const webgl = require('./webgl/webgl')

function mainAlgorithm (extendedPoints, params = {}) {
  return new Promise(function (resolve, reject) {
    const NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3
    const isWebgl = params.isWebgl
    const algorithm = new MainAlgorithmWorker
    let intersectionData, intersectionData2, computeIntersection, rectangleData, rectangleData2
    if (isWebgl) {
      ({intersectionData, computeIntersection, rectangleData, intersectionData2, rectangleData2} = webgl.setUp(extendedPoints, NUMBER_OF_RAYS))
      algorithm.postMessage({
        extendedPoints,
        params,
        intersectionData,
        rectangleData,
        intersectionData2,
        rectangleData2
      }, [intersectionData.buffer, rectangleData.buffer, intersectionData2.buffer, rectangleData2.buffer])
      algorithm.onmessage = function (event) {
        var data = event.data
        if (data.type === 'end') {
          return resolve(data.result)
        } else {
          const {intersectionData, rectangleData} = computeIntersection(data.rectangleData, data.pix, data.piy, data.intersectionData)
          algorithm.postMessage({
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