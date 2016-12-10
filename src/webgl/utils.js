module.exports = {computeRays}
function computeRays (radiusData, numberOfPoints, numberOfRays) {
  for (let i = 0; i < numberOfPoints; i++) {
    for (let j = 0; j < numberOfRays; j++) {
      const index = numberOfRays * i * 4 + j * 4
      radiusData[index] = Math.sin(2 * Math.PI * j / numberOfRays)
      radiusData[index + 1] = Math.cos(2 * Math.PI * j / numberOfRays)
    }
  }
}