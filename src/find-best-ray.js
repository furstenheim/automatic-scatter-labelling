'use strict'
module.exports = {findBestRay}

const _ = require('lodash')
const csp = require('js-csp')

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
  let {intersectionData, rectangleData, rectangleData2, intersectionData2} = webglExtra
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
  P.sort((p1, p2) => p2.availableMeasure - p1.availableMeasure )
  const gpu2cpu = csp.chan(1)
  const gpu2gpu = csp.chan(1)
  // Is there a better way to get notified at the end of a coroutine? Like q.async
  const gpuPromise = (function () {
    return new Promise(function (resolve) {
      csp.go(computeInGPU, [gpu2gpu, gpu2cpu, resolve])
    })
  })()
  const cpuPromise = (function () {
    return new Promise(function (resolve) {
      csp.go(computeInCPU, [gpu2cpu, resolve])
    })
  })()
  await Promise.all([gpuPromise, cpuPromise])
  gpu2cpu.close()
  gpu2gpu.close()
  // We need to return intersectionData because the reference has been neutered in find ray intersection
  return {rbest: rbest, pbest: pbest, intersectionData, rectangleData, intersectionData2, rectangleData2}

  function * computeInGPU (gpu2gpu, gpu2cpu, callback) {
    let intersectionBuffer, rectangleBuffer
    let i = 0
    for (let pi of P) {
      i++
      // Get buffer
      if (i % 2) {
        intersectionBuffer = intersectionData
        rectangleBuffer = rectangleData
      } else {
        intersectionBuffer = intersectionData2
        rectangleBuffer = rectangleData2
      }
      pi.rays.forEach(function (rij) {
        let segment = {x: rij.vector.x * rij.minimum, y: rij.vector.y * rij.minimum}
        const rectangle = extendedPointMethods.translateLabel(pi, segment)
        rectangleBuffer[rij.selfIndex] = rectangle.top
        rectangleBuffer[rij.selfIndex + 1] = rectangle.left
        rectangleBuffer[rij.selfIndex + 2] = rectangle.bottom
        rectangleBuffer[rij.selfIndex + 3] = rectangle.right
      })
      // It would be nice for co spawn to resolve promises
      computeIntersection(rectangleBuffer, pi.position.x, pi.position.y, intersectionBuffer)
        .then(function (result) {
          csp.putAsync(gpu2gpu, result)
        });
      ({intersectionData: intersectionBuffer, rectangleData: rectangleBuffer} = yield csp.take(gpu2gpu))
      // Reassign buffers
      if (i % 2) {
        intersectionData = intersectionBuffer
        rectangleData = rectangleBuffer
      } else {
        intersectionData2 = intersectionBuffer
        rectangleData2 = rectangleBuffer
      }
      yield csp.put(gpu2cpu, intersectionBuffer)
    }
    callback()
  }
  function * computeInCPU (gpu2cpu, callback) {
    let intersectionBuffer
    for (let pi of P) {
      let mindik = _.minBy(pi.rays, 'minimum').minimum
      if (isWebgl) {
        intersectionBuffer = yield csp.take(gpu2cpu)
      }
      let R = pi.rays.filter(rij => rij.minimum < mindik + TOLERANCE)
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
              labelIntersection = interval(intersectionBuffer[index], intersectionBuffer[index + 1])
              segmentIntersection = interval(intersectionBuffer[index + 2], intersectionBuffer[index + 3])
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
    }
    callback()
  }
}