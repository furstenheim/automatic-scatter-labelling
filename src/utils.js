module.exports = {compareArraysLexicographically, measure}

function compareArraysLexicographically (arr1, arr2) {
  var i = 0
  while (i < Math.min(arr1.length, arr2.length)) {
    if (arr1[i] != arr2[i]) return arr1[i] - arr2[i]
    i++
  }
  return arr1.length - arr2.length
}

function measure (start, end) {
  return Math.pow(2, -start) - Math.pow(2, -end)
}