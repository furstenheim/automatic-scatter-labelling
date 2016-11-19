const mainAlgorithm = require('./../src/main-algorithm').mainAlgorithm
const multiInterval = require('./../src/multi-interval').multiInterval
const interval = require('./../src/interval').interval
describe('Main algorithm', function () {
  it('Label one point', function () {
    const pointsToLabel = [
      {
        id: 1,
        position: {
          x: 0,
          y: 0
        },
        label: {
          height: 1, width: 2
        }
      }
    ]

    const result = mainAlgorithm(pointsToLabel)
  })

})