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
})