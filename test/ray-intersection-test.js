const rayIntersection = require('./../src/ray-intersection')
const assert = require('assert')
const multiInterval = require('../src/multi-interval')
const interval = require('../src/interval')

describe('Ray intersection', function () {
  it('empty arrays', function () {
    const pointsToLabel = []
    const pointsNotToLabel = []
    const result = rayIntersection(pointsToLabel, pointsNotToLabel)
    assert.deepEqual(result, {N: [], pointsLabeled: []})
  })
  it.only('One point to label', function () {
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
})