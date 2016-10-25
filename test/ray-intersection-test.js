const rayIntersection = require('./../src/ray-intersection').rayIntersection
const findBestRay = require('./../src/find-best-ray')
const labelRectangleIntersection = require('./../src/label-rectangle-intersection')
const labelSegmentIntersection = require('./../src/label-segment-intersection')
const assert = require('assert')
const multiInterval = require('../src/multi-interval').multiInterval
const interval = require('../src/interval').interval
const sinon = require('sinon')
var sandbox
describe('Ray intersection', function () {
  // Easier releasing
  beforeEach(() => {sandbox = sinon.sandbox.create()})
  afterEach(() => sandbox.restore())

  it('empty arrays', function () {
    const pointsToLabel = []
    const pointsNotToLabel = []
    const result = rayIntersection(pointsToLabel, pointsNotToLabel)
    assert.deepEqual(result, {N: [], pointsLabeled: []})
  })
  it('One point to label', function () {
    const pointsToLabel = [
      {
        position: {
          x: 0,
          y: 0
        },
        rays: [
          {
            available: multiInterval([interval(0, Number.POSITIVE_INFINITY)]),
            vector: {x: 1, y: 1}
          }
        ],
        label: {
          height: 1, width: 2
        }
      }
    ]
    const pointsNotToLabel = [
      {
        position: {
          x: 0,
          y: 1
        },
        rays: [
          {
            available: multiInterval([interval(0, Number.POSITIVE_INFINITY)]),
            vector: {x: 1, y: 1}
          }
        ],
        label: {
          height: 1, width: 2
        }
      }
    ]
    const result = rayIntersection(pointsToLabel, pointsNotToLabel)
    // There is only one ray to label so it is labeled and measure is updated in the not to label
    assert.equal(result.N.length, 0, 'All rays where accepted')
    assert.equal(result.pointsLabeled.length, 1, 'Only point was labeled')
    assert.equal(result.pointsLabeled[0], pointsToLabel[0], 'The only point was labeled')
  })
  it('Two points stubbed methods', function () {
    const pointsToLabel = [
      {
        position: {
          x: -1,
          y: 0
        },
        rays: [
          {
            available: multiInterval([interval(0, Number.POSITIVE_INFINITY)]),
            vector: {x: 3, y: 2}
          }
        ],
        label: {
          height: 1, width: 2
        }
      },
      {
        position: {
          x: 0,
          y: 0
        },
        rays: [
          {
            available: multiInterval([interval(0, Number.POSITIVE_INFINITY)]),
            vector: {x: 1, y: 1}
          }
        ],
        label: {
          height: 1, width: 2
        }
      }
    ]
    const pointsNotToLabel = [
      {
        position: {
          x: 0,
          y: 1
        },
        rays: [
          {
            available: multiInterval([interval(0, Number.POSITIVE_INFINITY)]),
            vector: {x: 1, y: 1}
          }
        ],
        label: {
          height: 1, width: 2
        }
      }
    ]
    sandbox.stub(findBestRay, 'findBestRay', () => { return {pbest: pointsToLabel[1], rbest: pointsToLabel[1].rays[0]} })
    // Intersection is the whole positive axis, this means that the remaining label cannot be displayed
    sandbox.stub(labelSegmentIntersection, 'labelSegmentIntersection', () => interval(0, Number.POSITIVE_INFINITY))
    const result = rayIntersection(pointsToLabel, pointsNotToLabel)
    assert.equal(result.pointsLabeled[0], pointsToLabel[1], 'Best ray was stubbed to return second point')
    assert.equal(result.N[0], pointsToLabel[0], 'intersection algorithms where stubbed to make intersection impossible')
    assert.deepEqual(result.N[0].rays[0].available, multiInterval.empty(), 'There was no room left')
  })
})