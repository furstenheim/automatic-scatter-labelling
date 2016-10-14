const assert = require('assert')
const extendedPointMethods = require('./../src/extended-point-methods')
const multiInterval = require('./../src/multi-interval')
const interval = require('./../src/interval')
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