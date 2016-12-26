module.exports = {mainAlgorithm}
var MainAlgorithmWorker = require('worker-loader!./main-algorithm')
const webgl = require('./webgl/webgl')

function mainAlgorithm (extendedPoints, params = {}) {
  return new Promise(function (resolve, reject) {
    const NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3
    const isWebgl = params.isWebgl
    const algorithm = new MainAlgorithmWorker
    let intersectionData, computeIntersection
    if (isWebgl) {
      ({intersectionData, computeIntersection} = webgl.setUp(extendedPoints, NUMBER_OF_RAYS))
      algorithm.postMessage({
        extendedPoints,
        params,
        intersectionData
      }, [intersectionData.buffer])
      algorithm.onmessage = function (event) {
        var data = event.data
        if (data.type === 'end') {
          return resolve(data.result)
        } else {
          const {intersectionData} = computeIntersection(data.top, data.left, data.bottom, data.right, data.pix, data.piy, data.intersectionData)
          algorithm.postMessage({
            intersectionData
          }, [intersectionData.buffer])
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