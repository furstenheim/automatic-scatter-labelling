var interval = require('./../src/interval').interval
var assert = require('assert')
describe('Intervals', function () {
  describe('coallesce', function () {
    it ('Containing', function () {
      var i1 = interval(1,2)
      var i2 = interval(0,3)
      var i3 = i2.coalesce(i1)
      assert.deepEqual(i2, i3)
      var i4 = i1.coalesce(i2)
      assert.deepEqual(i2, i4)
    })
    it('Contiguous', function () {
      var i1 = interval(1,2)
      var i2 = interval(2,3)
      var i3 = i2.coalesce(i1)
      assert.deepEqual(i3, interval(1,3))
    })
    it('Intersecting', function () {
      var i1 = interval(1,3)
      var i2 = interval(2, 4)
      var i3 = i2.coalesce(i1)
      var expected = interval(1,4)
      assert.deepEqual(i3, expected)
    })
    it('Empty array', function () {
      var i1 = interval.empty()
      var i2 = interval(2,4)
      var i3 = i1.coalesce(i2)
      assert.deepEqual(i3, i2)
    })
  })
  describe('Intersection', function () {
    it('Containing', function () {
      var i1 = interval(1,2)
      var i2 = interval(0,3)
      var i3 = i2.intersect(i1)
      assert.deepEqual(i1, i3)
      var i4 = i1.intersect(i2)
      assert.deepEqual(i1, i4)
    })
    it('Contiguous', function () {
      var i1 = interval(1,2)
      var i2 = interval(2,3)
      var i3 = i2.intersect(i1)
      assert.deepEqual(i3, interval(2,2))
    })
    it('Intersecting', function () {
      var i1 = interval(1,3)
      var i2 = interval(2, 4)
      var i3 = i2.intersect(i1)
      var expected = interval(2,3)
      assert.deepEqual(i3, expected)
    })
    it('disjoint', function () {
      var i1 = interval(1,2)
      var i2 = interval(3,4)
      var expected = interval.empty()
      var i3 = i1.intersect(i2)
      assert.deepEqual(i3, expected)
    })
  })
})