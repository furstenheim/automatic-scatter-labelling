const findBestRay = require('./../src/find-best-ray').findBestRay
const multiInterval = require('./../src/multi-interval').multiInterval
const interval = require('./../src/interval').interval
const assert = require('chai').assert
describe('Find best ray', function () {
  it('It returns a ray from points to Label', async function () {
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
    const {rbest, pbest} = await findBestRay(pointsToLabel, pointsNotToLabel, false, {})
    assert.equal(rbest, pointsToLabel[0].rays[0], 'There was only one ray')
    assert.equal(pbest, pointsToLabel[0], 'There was only one ray')
  })

  // TODO add more tests
})