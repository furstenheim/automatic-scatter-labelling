module.exports = {computeRays}
function computeRays (radiusData, numberOfPoints, numberOfRays) {
  for (let i = 0; i < numberOfPoints; i++) {
    for (let j = 0; j < numberOfRays; j++) {
      for (let k = 0; k < numberOfRays; k++) {
        const index = numberOfRays * numberOfRays * i * 4 + numberOfRays * j * 4 + k*4
        radiusData[index] = Math.sin(2 * Math.PI * j / numberOfRays)
        radiusData[index + 1] = Math.cos(2 * Math.PI * j / numberOfRays)

      }
    }
  }
}