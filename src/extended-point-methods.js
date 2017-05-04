'use strict'
module.exports = {
  updateAvailableSpace,
  promoteLabelToRectangle,
  computeInitialAvailabeSpaces,
  resetAvailableSpace,
  updateMinima,
  translateLabel
}

const labelRectangleIntersection = require('./label-rectangle-intersection').labelRectangleIntersection
const rayRectangleIntersection = require('./ray-rectangle-intersection').rayRectangleIntersection
const multiInterval = require('./multi-interval').multiInterval
const interval = require('./interval').interval
/*
 An extended point may contain the following
  rays a collection of rays starting from the point as well as the intervals where they are allowed
  label in case the label is not yet settled
  rectangle in case the label is settled
 */
function updateAvailableSpace (extendedPoint) {
  var rays = extendedPoint.rays
  var measure = 0
  for (let ray of rays) {
    let rayMeasure = ray.available.measure()
    ray.availableMeasure = rayMeasure
    measure += rayMeasure
  }
  extendedPoint.availableMeasure = measure
}

function computeInitialAvailabeSpaces (extendedPoints, params) {
  const radius = params.radius
  const bbox = params.bbox
  for (let pi of extendedPoints) {
    for (let rij of pi.rays) {
      rij.initiallyAvailable = multiInterval([interval(0, Number.POSITIVE_INFINITY)])
      for (let pk of extendedPoints) {
        const rectangle = {top: pk.position.y + radius, bottom: pk.position.y - radius, left: pk.position.x - radius, right: pk.position.x + radius, width: 2 * radius, height: 2 * radius}
        rij.initiallyAvailable.remove(labelRectangleIntersection(rectangle, pi.label, rij.vector, pi.position))
        if (pi !== pk) {
          rij.initiallyAvailable.remove(rayRectangleIntersection(rectangle, rij.vector, pi.position))
        }
      }
      if (bbox) {
        const labelContainedInterval = labelRectangleIntersection({top: -bbox.top - pi.label.height, bottom: -bbox.bottom + pi.label.height, left: bbox.left + pi.label.width, right: bbox.right - pi.label.width, width: bbox.width - 2 * pi.label.width, height: bbox.height - 2 * pi.label.height}, pi.label, rij.vector, pi.position)
        // Want labels inside of the graph
        rij.initiallyAvailable.remove(interval(labelContainedInterval.end, Number.POSITIVE_INFINITY))
      }
      rij.available = rij.initiallyAvailable.clone()
    }
  }
}

function resetAvailableSpace (extendedPoint) {
  for (let rij of extendedPoint.rays) {
    rij.available = rij.initiallyAvailable.clone()
  }
}

function updateMinima (extendedPoint) {
  var rays = extendedPoint.rays
  for (let ray of rays) {
    ray.minimum = ray.available.getMin()
  }
}

function promoteLabelToRectangle (extendedPoint, vi) {
  extendedPoint.rectangle = translateLabel(extendedPoint, vi)
  extendedPoint.segment = {x: vi.x, y: vi.y}
}

function translateLabel (extendedPoint, vi) {
  const point = extendedPoint.position
  const label = extendedPoint.label
  return {
    height: label.height,
    width: label.width,
    top: point.y + vi.y + label.height / 2 + label.offsetY,
    bottom: point.y + vi.y - label.height / 2 + label.offsetY,
    left: point.x + vi.x - label.width / 2 + label.offsetX,
    right: point.x + vi.x + label.width / 2 + label.offsetX
  }
}
