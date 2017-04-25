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

  it('empty arrays', async function () {
    const pointsToLabel = []
    const pointsNotToLabel = []
    const result = await rayIntersection(pointsToLabel, pointsNotToLabel, false, {})
    assert.deepEqual(result, {rejected: [], chosen: []})
  })
  it('One point to label', async function () {
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
    const {chosen, rejected} = await rayIntersection(pointsToLabel, pointsNotToLabel, false, {})
    // There is only one ray to label so it is labeled and measure is updated in the not to label
    assert.equal(rejected.length, 0, 'All rays where accepted')
    assert.equal(chosen.length, 1, 'Only point was labeled')
    assert.equal(chosen[0], pointsToLabel[0], 'The only point was labeled')
  })
  it('Two points stubbed methods', async function () {
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
    const {chosen, rejected} = await rayIntersection(pointsToLabel, pointsNotToLabel, false, {})
    assert.equal(chosen[0], pointsToLabel[1], 'Best ray was stubbed to return second point')
    assert.equal(rejected[0], pointsToLabel[0], 'intersection algorithms where stubbed to make intersection impossible')
    assert.deepEqual(rejected[0].rays[0].available, multiInterval.empty(), 'There was no room left')
  })

  it('One point to label without free space', async function () {
    const pointsToLabel = [
      {
        position: {
          x: 0,
          y: 0
        },
        rays: [
          {
            available: multiInterval.empty(),
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
    const {chosen, rejected} = await rayIntersection(pointsToLabel, pointsNotToLabel, false, {})
    // There is only one ray to label so it is labeled and measure is updated in the not to label
    assert.equal(rejected.length, 1, 'All rays where accepted')
    assert.equal(chosen.length, 0, 'Only point was labeled')
  })
})