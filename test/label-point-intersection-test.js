var assert = require('assert')
var labelPointIntersection = require('./../src/label-point-intersection').labelPointIntersection
var interval = require('./../src/interval').interval
describe('Origin point', function () {
  var pi = {x: 0, y: 0}
  describe('Vertical vector', function () {
    var vi = {x: 0, y: 1}
    describe('Point to the side of the vector', function () {
      var pk = {x: 1.5, y: 3.5}
      it('Initial label contains the point', function () {
        var li = {offsetX: 0, offsetY: 0, width: 5, height: 2}
        var intersection = labelPointIntersection(pk, li, vi, pi)
        // The intersection starts when the center is at 2 and ends when the center is at 5
        assert.deepEqual(intersection, interval(2.5, 4.5))
      })
      it('Label does not intersect', function () {
        var li = {offsetX: 0, offsetY: 0, width: 2, height: 2}
        var intersection = labelPointIntersection(pk, li, vi, pi)
        // The intersection starts when the center is at 2 and ends when the center is at 5
        assert.deepEqual(intersection, interval.empty())
      })
    })
    it('Point is contained in the line', function () {
      var pk = {x: 0, y: 5}
      var li = {offsetX: 0, offsetY: 0, width: 5, height: 2}
      var intersection = labelPointIntersection(pk, li, vi, pi)
      assert.deepEqual(intersection, interval(4, Number.POSITIVE_INFINITY))
    })
  })
  describe('Diagonal vector', function () {
    var vi = {x: 1, y: 1}
    it('Point to the side', function () {
      var pk = {x: 2.5, y: 1.5}
      var li = {offsetX: 0, offsetY: 0, width: 5, height: 2}
      var intersection = labelPointIntersection(pk, li, vi, pi)
      assert.deepEqual(intersection, interval(0.5, 2.5))
    })
    it('Point in the line', function () {
      var pk = {x: 3, y: 3}
      var li = {offsetX: 0, offsetY: 0, width: 10, height: 4}
      var intersection = labelPointIntersection(pk, li, vi, pi)
      assert.deepEqual(intersection, interval(1, Number.POSITIVE_INFINITY))
    })
  })
  describe('Horizontal vector', function () {
    var vi = {x: 1, y: 0}
    var pk = {x: 3, y: 1.5}
    it('Point to the side', function () {
      var li = {offsetX: 0, offsetY: 0, height: 5, width: 2}
      var intersection = labelPointIntersection(pk, li, vi, pi)
      assert.deepEqual(intersection, interval(2, 4))
    })
  })
})