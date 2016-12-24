module.exports = {setUp}
var WebGLWorker = require('worker-loader!./webgl')

function setUp (extendedPoints, numberOfRays) {
  return new Promise (function (resolve, reject) {
    // Load webgl in a webwoker
    var webgl = new WebGLWorker
    webgl.postMessage({
      extendedPoints,
      numberOfRays
    })
    webgl.onmessage = function (e) {
      console.log('set up finished')
      resolve({
        radiusData: e.data.radiusData,
        intersectionData: e.data.intersectionData,
        computeIntersection (top, left, bottom, right, pix, piy, intersectionData) {
          return new Promise(function (resolve, reject) {

            webgl.postMessage({
              top,
              left,
              bottom,
              right,
              pix,
              piy,
              intersectionData
            }, [intersectionData.buffer])
            webgl.onmessage = function (e) {
              resolve(e.data.intersectionData)
            }
          })
        }
      })
    }
  })
}