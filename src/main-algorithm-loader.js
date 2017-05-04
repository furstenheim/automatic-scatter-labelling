module.exports = {mainAlgorithm}
const work = require('webworkify')
const algorithm = work(require('./main-algorithm.js'))
const promiseResolutions = {}
function mainAlgorithm (extendedPoints, params = {}) {
  return new Promise(function (resolve, reject) {
    extendedPoints = extendedPoints.map(p => {
      return {
        id: p.id,
        position: {
          x: p.position.x,
          y: -p.position.y // The algorithm expects y to grow upwards
        },
        label: {
          height: p.label.height,
          width: p.label.width,
          offsetX: p.label.offsetX || 0,
          offsetY: p.label.offsetY || 0
        }
      }
    })
    const processUUID = parseInt(Math.random() * 1000000).toString() // no need for anything fancy
    algorithm.postMessage({
      type: 'start',
      extendedPoints,
      params,
      processUUID
    })
    promiseResolutions[processUUID] = function (event) {
      const result = event.data.result.map(p => {
        return {
          id: p.id,
          rectangle: {
            left: p.rectangle.left,
            right: p.rectangle.right,
            top: -p.rectangle.top,
            bottom: -p.rectangle.bottom
          }
        }
      })
      return resolve(result)
    }
  })
}
algorithm.onmessage = function (event) {
  const data = event.data
  switch (data.type) {
    case 'end':
      endEvent(event)
      break
    default:
      console.error('This event case should not happen', data.type)
  }
}

function endEvent (event) {
  const {processUUID} = event.data
  const callback = promiseResolutions[processUUID]
  callback(event)
  delete promiseResolutions[processUUID]
}