const webgl = require('./../../src/webgl/webgl')
const webglUtils = require('./../../src/webgl/utils')
const mainIntersectionFragment = require('./../../src/webgl/main-intersection-fragment')

const sinon = require('sinon')
let sandbox
beforeEach(() => sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())
// Same tests as in js
describe('Label rectangle intersection', function () {
  const numberOfRays = 16
  beforeEach(function () {
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
        vec2 intersection;
        vec4 point = read_point();
        vec2 radius = read_radius();
        vec4 rect = read_rectangle();
        intersection = label_rectangle_intersection(rect, point.ba, radius, point.rg);
        commit(vec4(intersection, 0., 0.));
      }`
    })
  })
  describe('Vertical vector', function () {
    beforeEach(function () {
      sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
        radiusData[0] = 0
        radiusData[1] = 1
      })
    })
    describe('Label to the side of the vector', function () {
      it('Initial label contains the original label', function () {
        const extendedPoints = [{position: {x: 0, y: 0}, label: {height: 2, width: 5}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
        const {intersectionData, labelData, radiusData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
        Object.assign(rectangleData, [4, 1, 3, 4])
        computeIntersection(rectangleData, 0, 0, intersectionData)
        console.log(intersectionData.slice(0, 4))
        assert.equal(intersectionData[0], 2)
        assert.equal(intersectionData[1], 5)

      })
      it('Initial label intersects in the middle and the height is bigger than the other height', function () {
        const extendedPoints = [{position: {x: 0, y: 0}, label: {height: 2, width: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
        const {intersectionData, labelData, radiusData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
        Object.assign(rectangleData, [4, 1, 3, 2])
        computeIntersection(rectangleData, 0, 0, intersectionData)
        console.log(intersectionData.slice(0, 4))
        assert.equal(intersectionData[0], 2)
        assert.equal(intersectionData[1], 5)
      })
      it('Initial label intersects in the middle and height is smaller', function () {
        const extendedPoints = [{position: {x: 0, y: 0}, label: {height: 0.5, width: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
        const {intersectionData, labelData, radiusData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
        Object.assign(rectangleData, [4, 1, 3, 2])
        computeIntersection(rectangleData, 0, 0, intersectionData)
        console.log(intersectionData.slice(0, 4))
        assert.equal(intersectionData[0], 2.75)
        assert.equal(intersectionData[1], 4.25)
      })
    })
  })
  describe('Diagonal vector', function () {
    beforeEach(function () {
      sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
        radiusData[0] = 1
        radiusData[1] = 1
      })
    })
    it('Width of the label is smaller', function () {
      const extendedPoints = [{position: {x: 0, y: 0}, label: {height: 2, width: 5}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
      const {intersectionData, labelData, radiusData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
      Object.assign(rectangleData, [3, 1, 2, 2])
      computeIntersection(rectangleData, 0, 0, intersectionData)
      console.log(intersectionData.slice(0, 4))
      assert.equal(intersectionData[0], 1)
      assert.equal(intersectionData[1], 4)
    })
  })
  describe('Horizontal vector', function () {
    beforeEach(function () {
      sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
        radiusData[0] = 1
        radiusData[1] = 0
      })
    })
    it('First label contained', function () {
      const extendedPoints = [{position: {x: 0, y: 0}, label: {height: 5, width: 2}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
      const {intersectionData, labelData, radiusData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
      Object.assign(rectangleData, [2, 3, 1, 4])
      computeIntersection(rectangleData, 0, 0, intersectionData)
      console.log(intersectionData.slice(0, 4))
      assert.equal(intersectionData[0], 2)
      assert.equal(intersectionData[1], 5)
    })
  })
  describe('Vector with negative coordinates', function () {
    beforeEach(function () {
      sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
        radiusData[0] = -0.4999999999999998
        radiusData[1] = 0.8660254037844387
      })
    })
    it('First label contained', function () {
      const extendedPoints = [{position: {x: 1164.1499999999999, y: -382.50000000000017}, label: {height: 21.25, width: 111.296875}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
      const {intersectionData, labelData, radiusData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
      Object.assign(rectangleData, [-350.62500000000017, 1175.9734942797204, -371.87500000000017, 1237.2391192797204])

      computeIntersection(rectangleData, 0, 0, intersectionData)
      console.log(intersectionData.slice(0, 4))
      assert.notEqual(intersectionData[0], -1, 'Rectangle intersects at t 5')
      assert.notEqual(intersectionData[1], -1)
    })
  })
})