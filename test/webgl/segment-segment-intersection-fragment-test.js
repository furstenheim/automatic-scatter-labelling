const webgl = require('./../../src/webgl/webgl')
const webglUtils = require('./../../src/webgl/utils')
const mainIntersectionFragment = require('./../../src/webgl/main-intersection-fragment')

const sinon = require('sinon')
let sandbox
beforeEach(() => sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())
// Same tests as in js
describe('Segment ray intersection', function () {
  const numberOfRays = 16
  beforeEach(function () {
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
        vec2 intersection;
        vec4 point = read_point();
        vec4 radius = read_radius();
        vec4 rect = read_rectangle();
        // Just to make tests easier we pass rect.rg, and rect.ba instead of computing a segment
        intersection = segment_segment_intersection(point.xy, radius.rg, rect.rg, rect.ba);
        commit(vec4(intersection, 0., 0.));
      }`
    })
  })
  it('Orthogonal vectors', function () {
    const extendedPoints = [{position: {x: 0, y: 1}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
      radiusData[0] = 0
      radiusData[1] = 1
    })
    const {intersectionData, labelData, radiusData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
    computeIntersection(3, 0, 1, 0, 0, 0, intersectionData)
    console.log(intersectionData.slice(0, 4))
    assert.equal(intersectionData[0], -1)
    assert.equal(intersectionData[1], -3)
  })
  it('Orthogonal vectors 2', function () {
    const extendedPoints = [{position: {x: 3, y: 0}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
      radiusData[0] = 1
      radiusData[1] = 0
    })
    const {intersectionData, labelData, radiusData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
    computeIntersection(0, 1, 0, 1, 0, 0, intersectionData)
    console.log(intersectionData.slice(0, 4))
    assert.equal(intersectionData[0], -3)
    assert.equal(intersectionData[1], -1)
  })
  it('Fourty five degrees', function () {
    const extendedPoints = [{position: {x: 1, y: 1}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
      radiusData[0] = 1
      radiusData[1] = 1
    })
    const {intersectionData, labelData, radiusData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
    computeIntersection(3, 0, 1, 0, 0 , 0, intersectionData)
    console.log(intersectionData.slice(0, 4))
    assert.equal(intersectionData[0], -1)
    assert.equal(intersectionData[1], -3)
  })
})