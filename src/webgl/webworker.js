const _ = require('lodash')
onmessage = function (event) {
  var message = event.data
  console.log(event)
  console.log(_)
  postMessage('c')
}