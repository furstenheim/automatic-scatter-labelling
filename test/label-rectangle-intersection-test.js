var assert = require('assert')
var labelRectangleIntersection = require('./../src/label-rectangle-intersection')
var interval = require('./../src/interval')
describe('Origin point', function () {
  var pi = {x: 0, y: 0}
  describe('Vertical vector', function () {
    var vi = {x: 0, y: 1}
    describe('Label to the side of the vector', function () {
      var lk = {top: 4, left: 1, right: 2, bottom: 3 }
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
})