module.exports = findBestRay

const _ = require('lodash')

const extendedPointMethods = require('./extended-point-methods')
const labelRectangleIntersection = require('./label-rectangle-intersection')
const labelSegmentIntersection = require('./label-segment-intersection')

const TOLERANCE = 2 // pixels

function findBestRay (pointsToLabel, pointsNotToLabel) {
  // We follow the article page 4 Algorithm 1
  var P = pointsToLabel
  var P0 = pointsNotToLabel.concat(pointsToLabel)
  // int P min in the article
  var minimumAvailableSpace = Number.POSITIVE_INFINITY
  var rbest
  P0.forEach(p=> extendedPointMethods.updateAvailableSpace(p))
  P.forEach(p=> extendedPointMethods.updateMinima(p))
  P.sort((p1, p2) => p2.availableMeasure - p1.availableMeasure )
  for (let pi of P) {
    let mindik = _.minBy(pi.rays, 'minimun').minimum
    let R = pi.rays.filter(rij => rij.miminum < mindik + TOLERANCE)
    for (let rij of R) {
      extendedPointMethods.promoteLabelToRectangle(pi, {x: rij.vector.x * rij.minimum, y: rij.vector.y * rij.minimum})
      for (let pk of P0) {
        if (pk === pi) continue
        // No sense to wait for the intersection if rbest is defined
        if (rbest) break // If rbest is already assign we can skip computations

        // Not doing the preintersection here. Something fishy in the article, if preintersect is empty then  integral pk- is 0 which does not make much sense
        for (let rkl of pk.rays) {
          // We have split label rectangle intersection into two algorithms, label rectangle and label segment
        }

      }
      if (rbest) break // If rbest is already assign we can skip computations
    }
  }
}