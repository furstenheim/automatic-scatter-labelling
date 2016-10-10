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

describe('Remove interval', function () {
  var tests = [
    {
      description: 'Remove empty interval from empty interval',
      multiInterval: multiInterval([interval.empty()]),
      toRemove: interval.empty(),
      expected: multiInterval.empty()
    },
    {
      description: 'Remove empty interval from non empty',
      multiInterval: multiInterval([interval(0, 3)]),
      toRemove: interval.empty(),
      expected: multiInterval([interval(0, 3)]),
      notExpected: multiInterval([interval.empty()])
    },
    {
      description: 'Disjoint multiinterval, intersect one',
      multiInterval: multiInterval([interval(0, 4), interval(5, 6)]),
      toRemove: interval(-1, 2),
      expected: multiInterval([interval(2, 4), interval(5, 6)]),
      notExpected: multiInterval([interval(2, 4)])
    },
    {
      description: 'Disjoint multiinterval, intersect two',
      multiInterval: multiInterval([interval(0, 4), interval(5, 6)]),
      toRemove: interval(3, 5.5),
      expected: multiInterval([interval(0, 3), interval(5.5, 6)]),
      notExpected: multiInterval([interval(2, 4)])
    },
    {
      description: 'Disjoint multiinterval, contained in one',
      multiInterval: multiInterval([interval(0, 4), interval(5, 6)]),
      toRemove: interval(1, 3),
      expected: multiInterval([interval(0, 1), interval(3,4), interval(5, 6)]),
      notExpected: multiInterval([interval(2, 4)])
    },
    {
      description: 'Disjoint multiinterval, contains one',
      multiInterval: multiInterval([interval(0, 4), interval(5, 6)]),
      toRemove: interval(-0.1, 5),
      expected: multiInterval([interval(5, 6)]),
      notExpected: multiInterval([interval(2, 4)])
    }
  ]
  tests.forEach(function (test) {
    it(test.description, function () {
      var actual = test.multiInterval.remove(test.toRemove)
      assert.deepEqual(actual, test.expected)
      if (test.notExpected) {
        assert.notDeepEqual(actual, test.notExpected)
      }
    })
  })
})

/* Only works on positive intervals */
describe('Interval integral', function () {
  var tests = [
    {
      description: 'Empty interval',
      multiInterval: multiInterval([interval.empty()]),
      expected: 0
    },
    {
      description: 'Simple interval',
      multiInterval: multiInterval([interval(0, 3)]),
      expected: 1 - 1/8,
    },
    {
      description: 'Disjoint multiinterval',
      multiInterval: multiInterval([interval(0, 4), interval(5, 6)]),
      expected: 1 - 1 / 16 + 1 / 32 - 1 / 64
    }
  ]
  tests.forEach(function (test) {
    it(test.description, function () {
      var actual = test.multiInterval.measure()
      assert.deepEqual(actual, test.expected)
    })
  })
})