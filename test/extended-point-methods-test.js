const assert = require('assert')
const extendedPointMethods = require('./../src/extended-point-methods')
const multiInterval = require('./../src/multi-interval')
const interval = require('./../src/interval')

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