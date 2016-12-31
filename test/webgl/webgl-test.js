const webgl = require('./../../src/webgl/webgl')
const mainIntersectionFragment = require('./../../src/webgl/main-intersection-fragment')
const sinon = require('sinon')
let sandbox

beforeEach(() => sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())
describe('Set up', function () {
  const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
  it('Size should fit 1', function () {
    const numberOfRays = 5
    const {radiusData, intersectionData, labelData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.isAtMost(extendedPoints.length * numberOfRays * 4, intersectionData.length, 'Data fits in buffer' )
  })
  it('Size should fit 2', function () {
    const numberOfRays = 16
    const {radiusData, intersectionData, labelData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.isAtMost(extendedPoints.length * numberOfRays * 4, intersectionData.length, 'Data fits in buffer' )
  })
  it('Set up fragment additional coordinates', function () {
    const numberOfRays = 16
    const {radiusData, intersectionData, labelData} = webgl.setUp(extendedPoints, numberOfRays)
    console.log(radiusData.slice(0, 32))
    assert.equal(radiusData[2], 0, 'Only compute first two coordinates')
    assert.equal(radiusData[3], 0, 'Only compute first two coordinates')
    assert.equal(radiusData[6], 0, 'Only compute first two coordinates')
    assert.equal(radiusData[7], 0, 'Only compute first two coordinates')
    assert.equal(radiusData[0], radiusData[numberOfRays * numberOfRays * 4], 'Radius data is the same for all points')
    assert.isAtMost(Math.abs(Math.pow(radiusData[0], 2) + Math.pow(radiusData[1], 2)) -  1.0, 0.001, 'Pithagoras')
    assert.isAtMost(Math.abs(radiusData[0] - Math.sin(2 * Math.PI * 0 / numberOfRays)), 0.001, 'It should be sin')
    assert.isAtMost(Math.abs(radiusData[4 * numberOfRays] - Math.sin(2 * Math.PI * 1 / numberOfRays)), 0.001, 'It should be sin')
    assert.isAtMost(Math.abs(radiusData[1] - Math.cos(2 * Math.PI * 0 / numberOfRays)), 0.001, 'It should be cos')
    assert.isAtMost(Math.abs(radiusData[1 + 4 * numberOfRays] -  Math.cos(2 * Math.PI * 1 / numberOfRays)), 0.001, 'It should be cos')

    console.log(radiusData.slice(0, 32))
  })
  it('Document is clean', function () {
    const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    const numberOfRays = 16
    var c = document.querySelectorAll('canvas')
    assert.equal(c.length, 0)
    const {intersectionData, labelData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    c = document.querySelectorAll('canvas')
    assert.equal(c.length, 0)
  })
})

describe('Main fragment', function () {
  it('Algorithm is not ran on set up', function () {
    const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    const numberOfRays = 16
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
         commit(vec4(2., 1., 0., 0.));
      }`
    })
    const {intersectionData, labelData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.equal(intersectionData[0], 0, 'No intersection is computed on set up')
    Object.assign(rectangleData, [0, 0, 0, 0])
    computeIntersection(rectangleData, 0, 0, intersectionData)
    assert.equal(intersectionData[0], 2, 'main intersection was ran')
  })
  it('Read from point', function () {
    const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    const numberOfRays = 16
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
         vec4 point = read_point();
         commit(vec4(point));
      }`
    })
    const {intersectionData, labelData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.equal(intersectionData[0], 0, 'No intersection is computed on set up')
Object.assign(rectangleData, [5, 6, 7, 8, ])
    computeIntersection(rectangleData,0, 0, intersectionData)
    console.log(intersectionData.slice(0, 10))
    assert.equal(intersectionData[0], 1, 'Point x')
    assert.equal(intersectionData[1], 2, 'Point y')
    assert.equal(intersectionData[3], 1, 'Point width')
    assert.equal(intersectionData[2], 3, 'Point height')
    assert.equal(intersectionData[4 * numberOfRays * numberOfRays], 5, 'Second point x')
  })
  it('Read from radius', function () {
    const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    const numberOfRays = 16
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
         vec2 radius = read_radius();
         commit(vec4(radius, 0., 0.));
      }`
    })
    const {intersectionData, labelData, radiusData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.equal(intersectionData[0], 0, 'No intersection is computed on set up')
    Object.assign(rectangleData, [5, 6, 7, 8])
    computeIntersection(rectangleData, 0, 0, intersectionData)
    console.log(intersectionData.slice(0, 10))
    assert.equal(intersectionData[0], radiusData[0], 'Reading from radius')
    assert.equal(intersectionData[1], radiusData[1], 'Reading from radius')
    assert.equal(intersectionData[2], radiusData[2], 'Reading from radius')
    assert.equal(intersectionData[3], radiusData[3], 'Reading from radius')
    assert.equal(intersectionData[4 * numberOfRays], radiusData[4 * numberOfRays], 'Reading from radius')
  })
  it('Read from rectangle', function () {
    const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    const numberOfRays = 12
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
         vec4 rect = read_rectangle();
         commit(vec4(rect));
         //commit(vec4(get_index(), 0., 0., 0.));
         //commit(vec4(get_rectangle_index()- pos, pos));
      }`
    })
    const {intersectionData, labelData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.equal(intersectionData[0], 0, 'No intersection is computed on set up')
    Object.assign(rectangleData, _.times(4 * numberOfRays))
    computeIntersection(rectangleData, 0, 0, intersectionData)
    console.log(intersectionData.slice(0, 0+ 50))

    //console.log(intersectionData.slice(4 * numberOfRays * 11, 4 * numberOfRays * 11+ 50))
    assert.equal(intersectionData[0], 0, 'main intersection was ran')
    assert.equal(intersectionData[1], 1)
    assert.equal(intersectionData[4], 4)
    assert.equal(intersectionData[5], 5)
    assert.equal(intersectionData[8], 8)
    assert.equal(intersectionData[4 * numberOfRays], 0)
    assert.equal(intersectionData[4 * numberOfRays + 1], 1)
    assert.equal(intersectionData[4 * numberOfRays * 2 + 1], 1)
    console.log(Math.sqrt(intersectionData.length), 4 *numberOfRays)
    assert.equal(intersectionData[4 * numberOfRays * numberOfRays + 1], 1, 'Over the first line')
    assert.equal(intersectionData.findIndex((v, i) => (i % (4 * numberOfRays)) !== 1 && v === 1 ), -1, 'Only rectangle in first coordinate')
  })
  it.only('Read from rectangle only write some coordinates', function () {
    const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    const numberOfRays = 12
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
         vec4 rect = read_rectangle();
         commit(vec4(rect));
         //commit(vec4(mod(get_index(), ${numberOfRays}.) + 1., 0., 0., 0.));
      }`
    })
    const {intersectionData, labelData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.equal(intersectionData[0], 0, 'No intersection is computed on set up')
    rectangleData[4] = 1
    rectangleData[5] = 2
    rectangleData[6] = 3
    rectangleData[7] = 4
    computeIntersection(rectangleData, 0, 0, intersectionData)
    console.log(intersectionData.slice(4 * numberOfRays * 11, 4 * numberOfRays * 11+ 50))
    assert.equal(intersectionData[4], 1)
    assert.equal(intersectionData[5], 2)
    assert.equal(intersectionData[4 * numberOfRays + 4], 1)
    assert.equal(intersectionData[4 * numberOfRays * 2 + 4], 1)
    console.log(Math.sqrt(intersectionData.length), numberOfRays)
    assert.equal(intersectionData[4 * numberOfRays * numberOfRays + 4], 1, 'Over the first line')
    assert.equal(intersectionData.findIndex((v, i) => (i % (4 * numberOfRays)) !== 4 && v === 1 ), -1, 'Only rectangle in first coordinate')
  })
  it('Read from rectangle_point', function () {
    const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    const numberOfRays = 16
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
         vec4 rect = read_rectangle_point();
         commit(vec4(rect));
      }`
    })
    const {intersectionData, labelData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.equal(intersectionData[0], 0, 'No intersection is computed on set up')
    Object.assign(rectangleData, [5, 6, 7, 8])
    computeIntersection(rectangleData, 9, 10, intersectionData)
    console.log(intersectionData.slice(0, 10))
    assert.equal(intersectionData[0], 9, 'main intersection was ran')

  })
  it('Read twice from rectangle', function () {
    const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    const numberOfRays = 16
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
         vec4 rect = read_rectangle();
         commit(vec4(rect));
      }`
    })
    const {intersectionData, labelData, computeIntersection, rectangleData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.equal(intersectionData[0], 0, 'No intersection is computed on set up')
    Object.assign(rectangleData, [5, 6, 7, 8])
    computeIntersection(rectangleData, 0, 0, intersectionData)
    assert.equal(intersectionData[0], 5, 'main intersection was ran')
    Object.assign(rectangleData, [10, 6, 7, 8])
    computeIntersection(rectangleData, 0, 0, intersectionData)
    assert.equal(intersectionData[0], 10, 'main intersection was ran')
  })
})