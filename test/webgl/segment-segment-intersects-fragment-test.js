const webgl = require('./../../src/webgl/webgl')
const webglUtils = require('./../../src/webgl/utils')
const mainIntersectionFragment = require('./../../src/webgl/main-intersection-fragment')

const sinon = require('sinon')
let sandbox
beforeEach(() => sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())
describe('Segment ray intersects', function () {
  const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
  const numberOfRays = 16
  beforeEach(function () {
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
        bool intersects;
        vec4 point = read_point();
        vec2 radius = read_radius();
        vec4 rect = read_rectangle();
        intersects = segment_segment_intersects(vec2(0., 0.), radius, vec2(0., 0.), rect.rg - rect.ba);
        if (intersects) {
          commit(vec4(1.0, 1.0, 1.0, 1.0));
        } else {
          commit(vec4(-1., -1., -1., -1.));
        }
      }`
    })
  })
  it('Parallel lines', function () {
    sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
      radiusData[0] = 1
      radiusData[1] = 0
    })
    const {intersectionData, labelData, radiusData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    Object.assign(rectangleData, [2, 0, 0, 0])
    computeIntersection(rectangleData, 0, 0, intersectionData)
    console.log(intersectionData.slice(0, 4))
    assert.equal(intersectionData[0], -1, 'Parallel lines')
  })
  it('Crossing lines', function () {
    sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
      radiusData[0] = 1
      radiusData[1] = 0
    })
    const {intersectionData, labelData, radiusData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    Object.assign(rectangleData, [1, 3, 0, 0])
    computeIntersection(rectangleData, 0, 0, intersectionData)
    console.log(intersectionData.slice(0, 4))
    assert.equal(intersectionData[0], 1, 'Crossing lines')
  })
})