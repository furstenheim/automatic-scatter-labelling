module.exports = {iterativeGreedy}

const extendedPointMethods = require('./extended-point-methods')
const _ = require('lodash')

const NUMBER_OF_RAYS = 128

function iterativeGreedy (extendedPoints) {
  computeRays(extendedPoints)
  extendedPointMethods.computeInitialAvailabeSpaces(extendedPoints)
  const pointQueue = [extendedPoints]
  const MAX_NUMBER_OF_ITERATIONS = 100000
  var iteration
  for (iteration = 0; iteration < MAX_NUMBER_OF_ITERATIONS; iteration++) {
    extendedPointMethods.resetAvailableSpace(extendedPoints)
    const nextIteration = []
    // We change the order here wrt to the article
    for (let i = 0; i < pointQueue.length; i++) {

    }
  }

}

function computeRays (extendedPoints) {
  for (let pi of extendedPoints) {
    pi.rays = []
    for (let i = 0; i < NUMBER_OF_RAYS; i++) {
      pi.rays.push( {
        vector : {
          y: Math.sin(2 * Math.PI / i),
          x: Math.cos(2 * Math.PI / i)
        }
      })
    }
  }
}