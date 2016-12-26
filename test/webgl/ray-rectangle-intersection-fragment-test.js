const webgl = require('./../../src/webgl/webgl')
const webglUtils = require('./../../src/webgl/utils')
const mainIntersectionFragment = require('./../../src/webgl/main-intersection-fragment')
const labelRectangleIntersection = require('./../../src/label-rectangle-intersection').labelRectangleIntersection
const rayRectangleIntersection = require('./../../src/ray-rectangle-intersection').rayRectangleIntersection
const interval = require('./../../src/interval').interval
const sinon = require('sinon')
let sandbox
beforeEach(() => sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())
// Same tests as in js
describe('Ray rectangle Intersection', function () {
  const numberOfRays = 16
  /*beforeEach(function () {
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
        vec2 intersection;
        vec4 point = read_point();
        vec4 radius = read_radius();
        vec4 rect = read_rectangle();
        vec4 rect_point = read_rectangle_point();
        vec2 ray_interval = ray_rectangle_intersection(rect, radius.rg, point.rg);
        intersection = label_rectangle_intersection(rect, point.ba, radius.rg, point.rg);
        commit(vec4(ray_interval, 0., 0.));
      }`
    })
  })*/
  it('Not intersecting', function () {
    const extendedPoints = [{position: {x: 1065.7555555555555, y: -170}, label: {height: 24.5, width: 55.5} }]
    const radius = {x: -2.4492935982947064e-16, y: 1}
    sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
      radiusData[0] = radius.x
      radiusData[1] = radius.y
    })
    const pi ={x: 1286.8666666666668, y: -262.72727272727263}
    const {intersectionData, labelData, radiusData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    const rectangle = {"height":24.5,"width":49.9375,"top":-227.72727272727263,"bottom":-252.22727272727263,"left":1261.8979166666668,"right":1311.8354166666668}
    Object.assign(rectangleData, [rectangle.top, rectangle.left, rectangle.bottom, rectangle.right])
    computeIntersection(rectangleData, pi.x, pi.y, intersectionData)
    rectangle.width = rectangle.right - rectangle.left
    rectangle.height = rectangle.top - rectangle.bottom
    console.log(intersectionData.slice(0, 2), labelRectangleIntersection(rectangle,extendedPoints[0].label, radius,  extendedPoints[0].position))
    //rayRectangleIntersection(rectangle, radius, extendedPoints[0].position)
    assert.isBelow(intersectionData[0], 0, 'Not intersecting')
    assert.isBelow(intersectionData[1], 0, 'Not intersecting')
  })
})
