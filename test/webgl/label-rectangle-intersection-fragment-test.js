const webgl = require('./../../src/webgl/webgl')
const webglUtils = require('./../../src/webgl/utils')
const mainIntersectionFragment = require('./../../src/webgl/main-intersection-fragment')

const sinon = require('sinon')
let sandbox
beforeEach(() => sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())
// Same tests as in js
describe.only('Label rectangle intersection', function () {
  const numberOfRays = 16
  beforeEach(function () {
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
        vec2 intersection;
        vec4 point = read_point();
        vec4 radius = read_radius();
        vec4 rect = read_rectangle();
        intersection = label_rectangle_intersection(rect, point.ba, radius.rg, point.rg);
        commit(vec4(intersection, 0., 0.));
      }`
    })
  })
  describe('Vertical vector', function () {
    describe('Label to the side of the vector', function () {
      it.only('Initial label contains the original label', function () {
        const extendedPoints = [{position: {x: 0, y: 0}, label: {height: 2, width: 5}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
        sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
          radiusData[0] = 0
          radiusData[1] = 1
        })
        const {intersectionData, labelData, radiusData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
        computeIntersection(4, 1, 3, 2)
        console.log(intersectionData.slice(0, 4))
        assert.equal(intersectionData[0], 2)
        assert.equal(intersectionData[1], 5)

      })
    })
  })
})