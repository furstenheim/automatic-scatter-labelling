var assert = require('assert')
var segmentSegmentIntersection = require('./../src/segment-segment-intersection').segmentSegmentIntersection
describe('Intersection of vectors', function () {
  it('Orthogonal vectors', function () {
    var p1 = {x: 0, y: 1}
    var v1 = {x: 0, y: 1}
    var p2 = {x: 3, y: 0}
    var v2 = {x: 1, y: 0}
    var intersection = segmentSegmentIntersection(p1, v1, p2, v2)
    assert.deepEqual(intersection, {t: -1, s: -3})
  })
  it('Orthogonal vectors 2', function () {
    var p1 = {x: 3, y: 0}
    var v1 = {x: 1, y: 0}
    var p2 = {x: 0, y: 1}
    var v2 = {x: 0, y: 1}
    var intersection = segmentSegmentIntersection(p1, v1, p2, v2)
    assert.deepEqual(intersection, {t: -3, s: -1})
  })
  it('Fourty five degrees', function () {
    var p1 = {x: 1, y: 1}
    var v1 = {x: 1, y: 1}
    var p2 = {x: 3, y: 0}
    var v2 = {x: 1, y: 0}
    var intersection = segmentSegmentIntersection(p1, v1, p2, v2)
    assert.deepEqual(intersection, {t: -1, s: -3})
  })
})