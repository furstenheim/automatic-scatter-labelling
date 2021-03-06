'use strict'
module.exports = {rayIntersection}

const findBestRay = require('./find-best-ray')
const extendedPointMethods = require('./extended-point-methods')
const multiInterval = require('./multi-interval').multiInterval
// Better to grab the module here and fetch the method in the algorithm, that way we can stub
const labelRectangleIntersection = require('./label-rectangle-intersection')
const labelSegmentIntersection = require('./label-segment-intersection')
const rayRectangleIntersection = require('./ray-rectangle-intersection').rayRectangleIntersection
const raySegmentIntersection = require('./ray-segment-intersection').raySegmentIntersection

// TODO use sets
async function rayIntersection (pointsToLabel, pointsNotToLabel) {
  pointsToLabel.forEach(p=> extendedPointMethods.updateAvailableSpace(p))
  const rejectedPoints = pointsToLabel.filter(p => p.availableMeasure === 0)
  // P in the article
  var remainingPoints = pointsToLabel.filter(p => p.availableMeasure > 0)
  var P0 = pointsToLabel.concat(pointsNotToLabel)
  const pointsLabeled = [] // Here we differ from the original article, once we find a point in P to label we remove it from P and add it to pointsLabeled, otherwise the algorithm does not finish
  while (remainingPoints.length !== 0) {
    let bestRay = await findBestRay.findBestRay(remainingPoints, pointsNotToLabel)
    let rij = bestRay.rbest
    let pi = bestRay.pbest
    if (rij === undefined) {
      // It could only happen that we get rij undefined in the first iteration
      if (pointsLabeled.length !== 0 || rejectedPoints.length !== 0) {
        throw new Error('Unexpected behaviour')
      }
      return {chosen: [], rejected: [...pointsToLabel]}
    }
    let vi = {x: rij.vector.x * rij.available.getMin(), y: rij.vector.y * rij.available.getMin()}
    extendedPointMethods.promoteLabelToRectangle(pi, vi)
    remainingPoints = remainingPoints.filter(el => el !== pi)
    P0 = P0.filter(el => el !== pi)
    pointsLabeled.push(pi)
    for (let pk of P0) {
      for (let rkl of pk.rays) {
        let labelIntersection
        let segmentIntersection
        const labelInterval = labelRectangleIntersection.labelRectangleIntersection(pi.rectangle, pk.label, rkl.vector, pk.position)
        const segmentInterval = labelSegmentIntersection.labelSegmentIntersection(pi.position, vi, pk.label, rkl.vector, pk.position)
        const rayInterval = rayRectangleIntersection(pi.rectangle, rkl.vector, pk.position)
        const raySegmentInterval = raySegmentIntersection(pi.position, vi, pk.position, rkl.vector)
        labelIntersection = labelInterval.coalesceInPlace(rayInterval)
        segmentIntersection = segmentInterval.coalesceInPlace(raySegmentInterval)
        if (!labelIntersection.empty || !segmentIntersection.empty) {
          rkl.available.multipleRemove(multiInterval.coalesce(labelIntersection, segmentIntersection))
        }
      }
      extendedPointMethods.updateAvailableSpace(pk)

      // The original article is not very clear here. It removes the point from P but the iteration was on P0. I suppose that if the integral is 0 and the point is in P then it will be removed in the next iteration of the greedy algorithm
      if (pk.availableMeasure === 0 && remainingPoints.findIndex(el => el === pk) !== -1){
        P0 = P0.filter(el => el !== pk)
        remainingPoints = remainingPoints.filter(el => el !== pk)
        rejectedPoints.push(pk)
      }
    }
  }
  return {chosen: pointsLabeled, rejected: rejectedPoints}
}