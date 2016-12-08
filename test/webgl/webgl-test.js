const webgl = require('./../../src/webgl/webgl')
const setUpFragment = require('./../../src/webgl/set-up-fragment')
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
  it('Set up fragment is run', function () {
    const numberOfRays = 16
    sandbox.stub(setUpFragment, 'setUpFragment', function (size, numberOfRays) {
      return `
      void main (void) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
      `
    })
    const {radiusData, intersectionData, labelData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.equal(radiusData[0], 1, 'All radius should be set to 1')
  })
  it('Set up fragment additional coordinates', function () {
    const numberOfRays = 16
    const {radiusData, intersectionData, labelData} = webgl.setUp(extendedPoints, numberOfRays)
    console.log(radiusData.slice(0, 32))
    assert.equal(radiusData[2], 0, 'Only compute first two coordinates')
    assert.equal(radiusData[3], 0, 'Only compute first two coordinates')
    assert.equal(radiusData[6], 0, 'Only compute first two coordinates')
    assert.equal(radiusData[7], 0, 'Only compute first two coordinates')
    assert.isOk(radiusData[8], 0, 'Radius should contain sin and cos')
    assert.equal(radiusData[0], radiusData[numberOfRays * 4], 'Radius data is the same for all points')
    assert.isAtMost(Math.abs(Math.pow(radiusData[0], 2) + Math.pow(radiusData[1], 2) -  1.0), 0.001, 'Pithagoras')
    assert.isAtMost(Math.abs(radiusData[0] - Math.sin(2 * Math.PI * 0 / numberOfRays)), 0.001, 'It should be sin')
    assert.isAtMost(Math.abs(radiusData[4] - Math.sin(2 * Math.PI * 1 / numberOfRays)), 0.001, 'It should be sin')
    assert.isAtMost(Math.abs(radiusData[1] - Math.cos(2 * Math.PI * 0 / numberOfRays)), 0.001, 'It should be cos')
    assert.isAtMost(Math.abs(radiusData[5] -  Math.cos(2 * Math.PI * 1 / numberOfRays)), 0.001, 'It should be cos')

    console.log(radiusData.slice(0, 32))
  })
  it('Document is clean', function () {
    const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    const numberOfRays = 16
    var c = document.querySelectorAll('canvas')
    assert.equal(c.length, 0)
    const {intersectionData, labelData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
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
    const {intersectionData, labelData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
    assert.equal(intersectionData[0], 0, 'No intersection is computed on set up')
    computeIntersection()
    assert.equal(intersectionData[0], 2, 'main intersection was ran')
  })
  it('Read from rectangle', function () {
    const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
    const numberOfRays = 16
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
         vec4 rect = read_rectangle();
         commit(vec4(rect.g, rect.b, 0., 0.));
      }`
    })
    const {intersectionData, labelData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
    assert.equal(intersectionData[0], 0, 'No intersection is computed on set up')
    computeIntersection(5, 6, 7, 8)
    console.log(intersectionData.slice(0, 10))
    assert.equal(intersectionData[0], 5, 'main intersection was ran')
  })
})