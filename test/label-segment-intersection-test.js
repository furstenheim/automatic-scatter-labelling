var interval = require('./../src/interval')
var labelSegmentIntersection = require('./../src/label-segment-intersection')
var assert = require('assert')
// TODO test rectangle
describe('Label segment Intersection', function () {
  describe('Second point at origin', function () {
    var tests = [
      {
        description: 'Non intersecting',
        expected: interval.empty(),
        li: {width: 2, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 2, y: 2},
        vk: {x:1, y:1}
      },
      {
        description: 'Label containing the point',
        expected: interval(1,4),
        li: {width: 2, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 0, y: 2},
        vk: {x:1, y:1}
      },
      {
        description: 'Segment parallel to vector',
        expected: interval(1, 4),
        li: {width: 2, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 0, y: 2},
        vk: {x:0, y:1}
      },
      {
        description: 'Diagonal vector',
        expected: interval(1, 4),
        li: {width: 2, height: 2},
        vi: {x: 1, y: 1},
        pk: {x: 2, y: 2},
        vk: {x:1, y:1}
      },
      {
        description: 'Diagonal vector, point is not contained',
        expected: interval(3, 5),
        li: {width: 2, height: 2},
        vi: {x: 1, y: 1},
        pk: {x: 0, y: 4},
        vk: {x:4, y:0}
      }
    ]
    tests.forEach(function (test) {
      it(test.description, function () {
        var result = labelSegmentIntersection(test.pk, test.vk, test.li, test.vi, {x: 0, y: 0})
        assert.deepEqual(result, test.expected)
      })
    })
  })
  describe('Second point not at origin', function () {
    var tests = [
      {
        description: 'Non intersecting',
        expected: interval.empty(),
        pi: {x: 0, y: 2},
        li: {width: 2, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 2, y: 2},
        vk: {x:1, y:1},
      },
      {
        description: 'Label containing the point',
        expected: interval(1,4),
        pi: {x: 1, y: 0},
        li: {width: 3, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 0, y: 2},
        vk: {x:1, y:1}
      },
      {
        description: 'Segment parallel to vector',
        expected: interval(0, 3),
        pi: {x: 1, y: 1},
        li: {width: 3, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 0, y: 2},
        vk: {x:0, y:1}
      },
      {
        description: 'Diagonal vector',
        expected: interval(0, 1),
        pi: {x: 2, y: 3},
        li: {width: 2, height: 2},
        vi: {x: 1, y: 1},
        pk: {x: 2, y: 2},
        vk: {x:1, y:1}
      },
      {
        description: 'Diagonal vector, point is not contained',
        expected: interval(3, 5),
        pi: {x: -1, y: 0},
        li: {width: 2, height: 2},
        vi: {x: 1, y: 1},
        pk: {x: 0, y: 4},
        vk: {x:4, y:0}
      }
    ]
    tests.forEach(function (test) {
      it(test.description, function () {
        var result = labelSegmentIntersection(test.pk, test.vk, test.li, test.vi, test.pi)
        assert.deepEqual(result, test.expected)
      })
    })
  })
})