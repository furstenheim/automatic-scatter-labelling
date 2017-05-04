const assert = require('assert')
const extendedPointMethods = require('./../src/extended-point-methods')
const multiInterval = require('./../src/multi-interval').multiInterval
const interval = require('./../src/interval').interval
const _ = require('lodash')

describe('Update available space', function () {
  const tests = [
    {
      description: 'No rays',
      point: {
        rays: [
        ]
      },
      expected: 0
    },
    {
      description: 'Empty multiarrays',
      point: {
        rays: [
          {
            available: multiInterval([interval.empty()])
          }
        ]
      },
      expected: 0
    },
    {
      description: 'One multiarray',
      point: {
        rays: [
          {
            available: multiInterval([interval(0, 4), interval(5, 6)])
          }
        ]
      },
      expected: 1 - 1 / 16 + 1 / 32 - 1 / 64
    },
    {
      description: 'Two multiarrays',
      point: {
        rays: [
          {
            available: multiInterval([interval(0, 4), interval(5, 6)])
          },
          {
            available: multiInterval([interval(0, 4), interval(5, 6)])
          }
        ]
      },
      expected: (1 - 1 / 16 + 1 / 32 - 1 / 64)*2
    }
  ]
  tests.forEach(function (test) {
    it(test.description, function () {
      extendedPointMethods.updateAvailableSpace(test.point)
      assert.equal(test.expected, test.point.availableMeasure)
    })
  })
})


describe('Update minima', function () {
  const tests = [
    {
      description: 'No rays',
      point: {
        rays: [
        ]
      },
      expected: Number.POSITIVE_INFINITY
    },
    {
      description: 'Empty multiarrays',
      point: {
        rays: [
          {
            available: multiInterval([interval.empty()])
          }
        ]
      },
      expected: Number.POSITIVE_INFINITY
    },
    {
      description: 'One multiarray',
      point: {
        rays: [
          {
            available: multiInterval([interval(0, 4), interval(5, 6)])
          }
        ]
      },
      expected: 0
    },
    {
      description: 'Two multiarrays',
      point: {
        rays: [
          {
            available: multiInterval([interval(2, 4), interval(5, 6)])
          },
          {
            available: multiInterval([interval(3, 4), interval(5, 6)])
          }
        ]
      },
      expected: 2
    }
  ]
  tests.forEach(function (test) {
    it(test.description, function () {
      extendedPointMethods.updateMinima(test.point)
      // If there are no rays there is no much we can test apart from no breaking
      const minimumRay = _.minBy(test.point.rays, 'minimum')
      if (minimumRay) {
        assert.equal(test.expected, minimumRay.minimum)
      }
    })
  })
})


describe('Promote label to rectangle', function () {
  const tests = [
    {
      description: 'Diagonal vector, point at origin',
      point: {
        position: {x: 0, y: 0},
        label: {offsetX: 0, offsetY: 0, height: 1, width: 2},
        rays: [
        ]
      },
      vi: {x: 1, y: 1},
      expected: {height: 1, width: 2, top: 1.5, bottom: 0.5, left: 0, right: 2}
    },
    {
      description: 'Horizontal negative vector point at origin',
      point: {
        position: {x: 0, y: 0},
        label: {offsetX: 0, offsetY: 0, height: 2, width: 2},
        rays: [
          {
            available: multiInterval([interval.empty()])
          }
        ]
      },
      vi: {x: 0, y: -2},
      expected: {height: 2, width: 2, top: -1, bottom: -3, left: -1, right: 1}
    },
    {
      description: 'Point not at origin',
      point: {
        position: {x: -1, y: -1},
        label: {offsetX: 0, offsetY: 0, height: 2, width: 2},
        rays: [
          {
            available: multiInterval([interval.empty()])
          }
        ]
      },
      vi: {x: 0, y: -2},
      expected: {height: 2, width: 2, top: -2, bottom: -4, left: -2, right: 0}
    }
  ]
  tests.forEach(function (test) {
    it(test.description, function () {
      extendedPointMethods.promoteLabelToRectangle(test.point, test.vi)
      // If there are no rays there is no much we can test apart from no breaking
      assert.deepEqual(test.expected, test.point.rectangle)
    })
  })
})
