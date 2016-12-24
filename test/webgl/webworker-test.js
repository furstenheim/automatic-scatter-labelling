const _ = require('lodash')
describe.skip('Load webworker', function () {
  it('webworker', function (done) {
    var uInt8Array = new Float32Array(16)
    uInt8Array[0] = 2
    var Worker = require('worker-loader!./../../src/webgl/webworker')
    var worker = new Worker
    console.log(uInt8Array)
    worker.postMessage({str: 'b', aBuf: uInt8Array}, [uInt8Array.buffer])
    setTimeout(done, 1000)
    worker.onmessage = function (e) {
      console.log(e)
    }
    console.log(_)
  })
})
