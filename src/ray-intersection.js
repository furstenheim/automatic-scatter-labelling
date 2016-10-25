'use strict'
module.exports = {rayIntersection}

const findBestRay = require('./find-best-ray')
const extendedPointMethods = require('./extended-point-methods')
// Better to grab the module here and fetch the method in the algorithm, that way we can stub
const labelRectangleIntersection = require('./label-rectangle-intersection')
const labelSegmentIntersection = require('./label-segment-intersection')


// TODO use sets
function rayIntersection (pointsToLabel, pointsNotToLabel) {
  var N = []
  var P = pointsToLabel
  var P0 = pointsToLabel.concat(pointsNotToLabel)
  const pointsLabeled = [] // Here we differ from the original article, once we find a point in P to label we remove it from P and add it to pointsLabeled, otherwise the algorithm does not finish
  while (P.length !== 0) {
    let bestRay = findBestRay.findBestRay(P, pointsNotToLabel)
    let rij = bestRay.rbest
    let pi = bestRay.pbest
    let vi = {x: rij.vector.x * rij.available.getMin(), y: rij.vector.y * rij.available.getMin()}
    extendedPointMethods.promoteLabelToRectangle(pi, vi)
    let index = pointsToLabel.findIndex(el => el === pi)
    P0 = P0.filter((el, i) => i!== index)
    P = P.filter((el, i) => i!== index)
    pointsLabeled.push(pi)
    for (let pk of P0) {
      for (let rkl of pk.rays) {
        const labelInterval = labelRectangleIntersection.labelRectangleIntersection(pi.rectangle, pk.label, rkl.vector, pk.position)
        const segmentInterval = labelSegmentIntersection.labelSegmentIntersection(pi.position, vi, pk.label, rkl.vector, pk.position)
        rkl.available = rkl.available.remove(labelInterval.coalesce(segmentInterval))
      }
      extendedPointMethods.updateAvailableSpace(pk)

      // The original article is not very clear here. It removes the point from P but the iteration was on P0. I suppose that if the integral is 0 and the point is in P then it will be removed in the next iteration of the greedy algorithm
      if (pk.availableMeasure === 0 && P.findIndex(el => el === pk) !== -1){
        const index = P.findIndex(el => el === pk)
        P0 = P0.filter((el, i) => i!== index)
        P = P.filter((el, i) => i!== index)
        N.push(pk)
      }
    }
  }

  return {N: N, pointsLabeled: pointsLabeled}
}