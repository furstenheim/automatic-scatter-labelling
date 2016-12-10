var assert = require('assert')
var labelRectangleIntersection = require('./../src/label-rectangle-intersection').labelRectangleIntersection
var interval = require('./../src/interval').interval
describe('Origin point', function () {
  // TODO test intersection from the beginning
  // TODO test no intersection
  var pi = {x: 0, y: 0}
  describe('Vertical vector', function () {
    var vi = {x: 0, y: 1}
    describe('Label to the side of the vector', function () {
      var lk = {top: 4, left: 1, bottom: 3, right: 2}
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
  describe('Vector with negative coordinates', function () {
    var vi = {y: 0.8660254037844387, x: -0.4999999999999998}
    var pi = {x: 1164.1499999999999, y: -382.50000000000017}
    var li = {height: 21.25, width: 111.296875}
    var lk = {"height":21.25,"width":61.265625,"top":-350.62500000000017,"bottom":-371.87500000000017,"left":1175.9734942797204,"right":1237.2391192797204}
    it('Intersect', function ()  {
      assert.ok((Math.abs((lk.top + lk.bottom) / 2 - (pi.y + vi.y * 5)) < li.height) && Math.abs((lk.left + lk.right) / 2 - (pi.x + vi.y * 5)) <  li.width, 'Label intersect at 5')
      var intersection = labelRectangleIntersection(lk, li, vi, pi)
      console.log(intersection)
      assert.notDeepEqual(intersection, interval.empty(), 'Interval should not be empty')
    })
  })
})