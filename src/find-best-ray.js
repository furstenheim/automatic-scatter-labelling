'use strict'
module.exports = {findBestRay}

import _ from 'lodash'

const extendedPointMethods = require('./extended-point-methods')
const labelRectangleIntersection = require('./label-rectangle-intersection').labelRectangleIntersection
const labelSegmentIntersection = require('./label-segment-intersection').labelSegmentIntersection
const rayRectangleIntersection = require('./ray-rectangle-intersection').rayRectangleIntersection
const raySegmentIntersection = require('./ray-segment-intersection').raySegmentIntersection
const multiInterval = require('./multi-interval').multiInterval
const interval = require('./interval').interval
const utils = require('./utils')

const TOLERANCE = 2 // pixels

async function findBestRay (pointsToLabel, pointsNotToLabel, isWebgl, webglExtra) {
  let {intersectionData, rectangleData} = webglExtra
  const computeIntersection = webglExtra.computeIntersection
  // We follow the article page 4 Algorithm 1
  var P = pointsToLabel
  var P0 = pointsNotToLabel.concat(pointsToLabel)
  // int P min in the article
  var minimumAvailableSpace = Number.POSITIVE_INFINITY
  var rbest
  var Vbest
  var pbest // This is not in the original algorithm but allows to easily find the corresponding point
  P0.forEach(p=> extendedPointMethods.updateAvailableSpace(p))
  P.forEach(p=> extendedPointMethods.updateMinima(p))
  const pi = _.minBy(P, 'availableMeasure')
  let mindik = _.minBy(pi.rays, 'minimum').minimum
  let R = pi.rays.filter(r => r.availableMeasure > 0)
  if (isWebgl) {
    R.forEach(function (rij) {
      const index = 4 * rij.selfIndex
      let segment = {x: rij.vector.x * rij.minimum, y: rij.vector.y * rij.minimum}
      const rectangle = extendedPointMethods.translateLabel(pi, segment)
      rectangleData[index] = rectangle.top
      rectangleData[index + 1] = rectangle.left
      rectangleData[index + 2] = rectangle.bottom
      rectangleData[index + 3] = rectangle.right
    });
    ({intersectionData, rectangleData} = await computeIntersection(rectangleData, pi.position.x, pi.position.y, intersectionData))
  }
  rijloop: for (let rij of R) {
    let Vij = []
    let segment = {x: rij.vector.x * rij.minimum, y: rij.vector.y * rij.minimum}
    const rectangle = extendedPointMethods.translateLabel(pi, segment)
    for (let pk of P0) {
      if (pk === pi) continue
      // No sense to wait for the intersection if rbest is defined

      //int pk
      let availableSpace = pk.availableMeasure
      // Not doing the preintersection here. Something fishy in the article, if preintersect is empty then  integral pk- is 0 which does not make much sense
      for (let rkl of pk.rays) {
        let labelIntersection
        let segmentIntersection
        if (isWebgl) {
          const index = rkl.index + rij.selfIndex * 4
          labelIntersection = interval(intersectionData[index], intersectionData[index + 1])
          segmentIntersection = interval(intersectionData[index + 2], intersectionData[index + 3])
        } else {
          // We have split label rectangle intersection into two algorithms, label rectangle and label segment. Those two intervals should intersect since the segment intersects the rectangle, so we can coalesce the intervals
          const labelInterval = labelRectangleIntersection(rectangle, pk.label, rkl.vector, pk.position)
          const segmentInterval = labelSegmentIntersection(pi.position, segment, pk.label, rkl.vector, pk.position)
          const rayInterval = rayRectangleIntersection(rectangle, rkl.vector, pk.position)
          const raySegmentInterval = raySegmentIntersection(pi.position, segment, pk.position, rkl.vector)
          labelIntersection = labelInterval.coalesceInPlace(rayInterval)
          segmentIntersection = segmentInterval.coalesceInPlace(raySegmentInterval)
        }
        if (!labelIntersection.empty || !segmentIntersection.empty) {
          availableSpace -= rkl.available.measureMultipleIntersection(multiInterval.coalesce(labelIntersection, segmentIntersection))
        }
      }
      // This ray is not good because we try to maximize the minimum
      if (rbest && availableSpace < minimumAvailableSpace) {
        continue rijloop
      }
      Vij.push(availableSpace)
    }
    Vij.sort((i,j) => i - j) // order to compare in lexicographical order
    if (!Vbest || utils.compareArraysLexicographically(Vij, Vbest) < 0) {
      rbest = rij
      Vbest = Vij
      minimumAvailableSpace = _.min(Vij)
      pbest = pi
    }
  }
  // We need to return intersectionData because the reference has been neutered in find ray intersection
  return {rbest: rbest, pbest: pbest, intersectionData, rectangleData, usedWebgl: isWebgl}
}