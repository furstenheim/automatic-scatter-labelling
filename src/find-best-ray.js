module.exports = findBestRay

const _ = require('lodash')

const extendedPointMethods = require('./extended-point-methods')

const TOLERANCE = 2 // pixels

function findBestRay (pointsToLabel, pointsNotToLabel) {
  // We follow the article page 4 Algorithm 1
  var P = pointsToLabel
  var P0 = pointsNotToLabel.concat(pointsToLabel)
  P.forEach(p=> extendedPointMethods.updateAvailableSpace(p))
  P.forEach(p=> extendedPointMethods.updateMinima(p))
  P.sort((p1, p2) => p2.availableMeasure - p1.availableMeasure )
  for (let pi of P) {
    let mindik = _.minBy(pi.rays, 'availableMeasure').availableMeasure
    let R = pi.rays.filter(rij => rij.availableMeasure < mindik + TOLERANCE)
    for (let rij of R) {
      rij.vector
    }
  }
}