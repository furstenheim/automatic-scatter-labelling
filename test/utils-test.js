const utils = require('./../src/utils')
const assert = require('assert')

describe('Compare arrays lexicographically', function () {
  const tests = [
    {
      description: 'Empty arrays',
      arr1: [],
      arr2: [],
      expectedSign: 0
    },
    {
      description: 'Non empty vs empty',
      arr1: [1],
      arr2: [],
      expectedSign: 1
    },
    {
      description: 'Same length',
      arr1: [1],
      arr2: [2],
      expectedSign: -1
    },
    {
      description: 'Different length, shorter is bigger',
      arr1: [1, 5],
      arr2: [2],
      expectedSign: -1
    }
  ]
  tests.forEach(function (test) {
    it(test.description, function () {
      var result = utils.compareArraysLexicographically(test.arr1, test.arr2)
      assert(sameSign(test.expectedSign, result))
    })
  })
})

function sameSign (a, b) {
  if (a !== 0 && b !== 0) {
    return a / b > 0
  }
  return a === b
}