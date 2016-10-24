var interval = require('./../src/interval').interval
var pointSegmentIntersection = require('./../src/point-segment-intersection').pointSegmentIntersection
var assert = require('assert')

describe('Point segment intersection', function () {
  var tests = [
    {
      description: 'Non intersecting',
      expected: interval.empty(),
      pi: {x: 2, y: 2},
      pk: {x: 1, y: 1},
      vk: {x: 0, y: 1}
    },
    {
      description: 'Intersection in the negative time',
      expected: interval.empty(),
      pi: {x: 2, y: 2},
      pk: {x: 3, y: 3},
      vk: {x: 1, y: 1}
    },
    {
      description: 'Intersection in the future',
      expected: interval(1, Number.POSITIVE_INFINITY),
      pi: {x: 3, y: 3},
      pk: {x: 2, y: 2},
      vk: {x: 1, y: 1}
    },
    {
      description: 'Vertical vector intersection',
      expected: interval(1, Number.POSITIVE_INFINITY),
      pi: {x: 0, y: 3},
      pk: {x: 0, y: 2},
      vk: {x: 0, y: 1}
    },
    {
      description: 'Horizontal vector',
      expected: interval(2, Number.POSITIVE_INFINITY),
      pi: {x: 0, y: 6},
      pk: {x: 0, y: 2},
      vk: {x: 0, y: 2}
    }
  ]
  tests.forEach(function (test) {
    it(test.description, function () {
      var result = pointSegmentIntersection(test.pi, test.pk, test.vk)
      assert.deepEqual(result, test.expected)
    })
  })

})