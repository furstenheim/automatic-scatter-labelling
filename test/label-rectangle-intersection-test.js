var assert = require('assert')
var labelRectangleIntersection = require('./../src/label-rectangle-intersection')
var interval = require('./../src/interval')
describe('Origin point', function () {
  // TODO test intersection from the beginning
  // TODO test no intersection
  var pi = {x: 0, y: 0}
  describe('Vertical vector', function () {
    var vi = {x: 0, y: 1}
    describe('Label to the side of the vector', function () {
      var lk = {top: 4, left: 1, right: 2, bottom: 3 }
      lk.width = lk.right - lk.left
      lk.height = lk.top - lk.bottom
      it('Initial label contains the original label', function () {
        var li = {width: 5, height: 2}
        var intersection = labelRectangleIntersection(lk, li, vi, pi)
        // The intersection starts when the center is at 2 and ends when the center is at 5
        assert.deepEqual(intersection, interval(2,5))
      })
      it('Initial label intersects in the middle and height is bigger than the other height', function (){
        var li = {width: 3, height: 2}
        var intersection = labelRectangleIntersection(lk, li, vi, pi)
        // The intersection starts when the center is at 2 and ends when the center is at 5
        assert.deepEqual(intersection, interval(2,5))
      })
      it('Initial label intersects in the middle and height is smaller', function () {
        var li = {width: 3, height: 0.5}
        var intersection = labelRectangleIntersection(lk, li, vi, pi)
        assert.deepEqual(intersection, interval(2.75, 4.25))
      })
    })
  })
  describe('Diagonal vector', function () {
    var vi = {x: 1, y: 1}
    it('Width of the label is smaller', function () {
      var lk = {top: 3, left: 1, right: 2, bottom: 2 }
      lk.width = lk.right - lk.left
      lk.height = lk.top - lk.bottom
      var li = {width: 5, height: 2}
      var intersection = labelRectangleIntersection(lk, li, vi, pi)
      assert.deepEqual(intersection, interval(1,4))
    })
  })
  describe('Horizontal vector', function () {
    var vi = {x: 1, y: 0}
    var lk = {top : 2, bottom: 1, left: 3, right :4}
    lk.width = lk.right - lk.left
    lk.height = lk.top - lk.bottom
    it('First label contained', function () {
      var li = {height: 5, width: 2}
      var intersection = labelRectangleIntersection(lk, li, vi, pi)
      assert.deepEqual(intersection, interval(2, 5))
    })
  })
})