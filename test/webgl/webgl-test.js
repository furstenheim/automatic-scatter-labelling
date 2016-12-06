const webgl = require('./../../src/webgl/webgl')
const setUpFragment = require('./../../src/webgl/set-up-fragment')
const sinon = require('sinon')
let sandbox
describe('Set up', function () {
  beforeEach(() => sandbox = sinon.sandbox.create())
  afterEach(() => sandbox.restore())
  const extendedPoints = [{position: {x: 1, y: 2}, label: {width: 1, height: 3}}, {position: {x: 5, y: 6}, label: {width: 4, height: 4}}]
  it('Size should fit 1', function () {
    const numberOfRays = 5
    const {radiusData, intersectionData, labelData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.isAtMost(extendedPoints.length * numberOfRays, intersectionData.length, 'Data fits in buffer' )
  })
  it('Size should fit 2', function () {
    const numberOfRays = 16
    const {radiusData, intersectionData, labelData} = webgl.setUp(extendedPoints, numberOfRays)
    assert.isAtMost(extendedPoints.length * numberOfRays, intersectionData.length, 'Data fits in buffer' )
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
    assert.equal(radiusData[2], 0, 'Only compute first two coordinates')
    assert.equal(radiusData[3], 0, 'Only compute first two coordinates')
    assert.equal(radiusData[6], 0, 'Only compute first two coordinates')
    assert.equal(radiusData[7], 0, 'Only compute first two coordinates')
    assert.isOk(radiusData[8], 0, 'Radius should contain sin and cos')
    console.log(radiusData.slice(0, 32))
  })
})