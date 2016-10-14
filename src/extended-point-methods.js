'use strict'
module.exports = {updateAvailableSpace, promoteLabelToRectangle, updateMinima}
/*
 An extended point may contain the following
  rays a collection of rays starting from the point as well as the intervals where they are allowed
  label in case the label is not yet settled
  rectangle in case the label is settled
 */
// TODO test
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

function updateMinima (extendedPoint) {
  var rays = extendedPoint.rays
  for (let ray of rays) {
    ray.minimum = ray.available.getMin()
  }
}

// TODO test
function promoteLabelToRectangle (extendedPoint, vi) {
  const point = extendedPoint.position
  const label = extendedPoint.label
  extendedPoint.rectangle = {
    height: label.height,
    width: label.width,
    top: point.y + vi.y + label.height / 2,
    bottom: point.y + vi.y - label.height / 2,
    left: point.x + vi.x - label.width / 2,
    right: point.x + vi.x + label.width / 2
  }
  extendedPoint.segment = {x: vi.x, y: vi.y}
}