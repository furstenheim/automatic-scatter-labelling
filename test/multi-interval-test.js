var interval = require('./../src/interval')
var multiInterval = require('./../src/multi-interval')
var assert = require('assert')

describe('Creation of intervals', function () {
  var tests = [
    {
      description: 'Empty multi interval',
      intervals: [interval.empty()],
      expected: multiInterval.empty()
    },
    {
      description: 'Two intersecting intervals',
      intervals: [interval(0, 2), interval(1, 3)],
      expected: multiInterval([interval(0, 3)]),
      notExpected: multiInterval([interval.empty()])
    },
    {
      description: 'Three intervals in two groups',
      intervals: [interval(0, 3), interval(1, 4), interval(5, 6)],
      expected: multiInterval([interval(0, 4), interval(5, 6)]),
      notExpected: multiInterval([interval(0,6)])
    },
    {
      description: 'Reverse order',
      intervals: [interval(2, 6), interval(-5, -7)],
      expected: multiInterval([interval(-5, -7), interval(2, 6)]),
      notExpected: multiInterval([interval(-5, 6)])
    }
  ]
  tests.forEach(function (test) {
    it(test.description, function () {
      var actual = multiInterval(test.intervals)
      assert.deepEqual(actual, test.expected)
      if (test.notExpected) {
        assert.notDeepEqual(actual, test.notExpected)
      }
    })
  })
})
