const webgl = require('./../../src/webgl/webgl')
const webglUtils = require('./../../src/webgl/utils')
const mainIntersectionFragment = require('./../../src/webgl/main-intersection-fragment')

const sinon = require('sinon')
let sandbox
beforeEach(() => sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())
// Same tests as in js
describe.only('Label segment Intersection', function () {
  const numberOfRays = 16
  beforeEach(function () {
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
        vec2 intersection;
        vec4 point = read_point();
        vec4 radius = read_radius();
        vec4 rect = read_rectangle();
        vec4 rect_point = read_rectangle_point();
        vec2 segment = rect.ra - rect.bg - rect_point.rg;
        intersection = label_segment_intersection(rect_point.xy, segment, point.ba, radius.rg, point.rg);
        commit(vec4(intersection, 0., 0.));
      }`
    })
  })
  describe('Second point at origin', function () {
    it.skip('Not intersecting', function () {
      const extendedPoints = [{position: {x: 0, y: 0}, label: {height: 2, width: 2}}, {
        position: {x: 5, y: 6},
        label: {width: 4, height: 4}
      }]
      sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
        radiusData[0] = 0
        radiusData[1] = 1
      })
      const {intersectionData, labelData, radiusData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
      // rectangle at 3, 3, 3, 3 so the vector goes from 2, 2, to 3, 3
      computeIntersection(3, 3, 3, 3, 2, 2)
      console.log(intersectionData.slice(0, 4))
      assert.equal(intersectionData[0], 2)
      assert.equal(intersectionData[1], 5)
    })
    it('Label containing the point', function () {
      const extendedPoints = [{position: {x: 0, y: 0}, label: {height: 2, width: 2}}, {
        position: {x: 5, y: 6},
        label: {width: 4, height: 4}
      }]
      sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
        radiusData[0] = 0
        radiusData[1] = 1
      })
      const {intersectionData, labelData, radiusData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
      // rectangle without width or height so the vector goes from 0, 2, to 1, 3
      computeIntersection(3, 1, 3, 1, 0, 2)
      console.log(intersectionData.slice(0, 4))
      assert.equal(intersectionData[0], 1)
      assert.equal(intersectionData[1], 4)
    })
  })

})