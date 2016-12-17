const webgl = require('./../../src/webgl/webgl')
const webglUtils = require('./../../src/webgl/utils')
const mainIntersectionFragment = require('./../../src/webgl/main-intersection-fragment')
const interval = require('./../../src/interval').interval
const sinon = require('sinon')
let sandbox
beforeEach(() => sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())
// Same tests as in js
describe.only('Label segment Intersection', function () {
  const numberOfRays = 16
  beforeEach(function () {
    sandbox.stub(mainIntersectionFragment, 'mainIntersectionFragment', function () {
      return `void main (void) {
        vec2 intersection;
        vec4 point = read_point();
        vec4 radius = read_radius();
        vec4 rect = read_rectangle();
        vec4 rect_point = read_rectangle_point();
        vec2 segment = (rect.ar + rect.gb) / 2. - rect_point.rg;
        intersection = label_segment_intersection(rect_point.xy, segment, point.ba, radius.rg, point.rg);
        commit(vec4(intersection, 0., 0.));
      }`
    })
  })
  describe('Second point at origin', function () {
    var tests = [
      {
        description: 'Non intersecting',
        expected: interval.empty(),
        li: {width: 2, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 2, y: 2},
        vk: {x:1, y:1}
      },
      {
        description: 'Label containing the point',
        expected: interval(1,4),
        li: {width: 2, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 0, y: 2},
        vk: {x:1, y:1}
      },
      {
        description: 'Segment parallel to vector',
        expected: interval(1, 4),
        li: {width: 2, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 0, y: 2},
        vk: {x:0, y:1}
      },
      {
        description: 'Diagonal vector',
        expected: interval(1, 4),
        li: {width: 2, height: 2},
        vi: {x: 1, y: 1},
        pk: {x: 2, y: 2},
        vk: {x:1, y:1}
      },
      {
        description: 'Diagonal vector, point is not contained',
        expected: interval(3, 5),
        li: {width: 2, height: 2},
        vi: {x: 1, y: 1},
        pk: {x: 0, y: 4},
        vk: {x:4, y:0}
      }
    ]
    tests.forEach(function (test) {
      it(test.description, function () {
        const extendedPoints = [{position: {x: 0, y: 0}, label: test.li}, {position: {x: 4, y: 45}, label: {width: 4, height: 4}}]
        sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
          radiusData[0] = test.vi.x
          radiusData[1] = test.vi.y
        })
        const {intersectionData, labelData, radiusData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
        // rectangle at pk + vk
        const pk = test.pk
        const vk = test.vk
        computeIntersection(pk.y + vk.y, pk.x + vk.x, pk.y + vk.y, pk.x + vk.x, pk.y + vk.y, pk.x, pk.y)
        assert.deepEqual(interval(intersectionData[0], intersectionData[1]), test.expected, `intersection ${intersectionData[0]}, ${intersectionData[1]} <-> ${test.expected.start} ${test.expected.end}`)
      })
    })
  })
  describe('Second point not at origin', function () {
    var tests = [
      {
        description: 'Non intersecting',
        expected: interval.empty(),
        pi: {x: 0, y: 2},
        li: {width: 2, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 2, y: 2},
        vk: {x:1, y:1},
      },
      {
        description: 'Label containing the point',
        expected: interval(1,4),
        pi: {x: 1, y: 0},
        li: {width: 3, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 0, y: 2},
        vk: {x:1, y:1}
      },
      {
        description: 'Segment parallel to vector',
        expected: interval(0, 3),
        pi: {x: 1, y: 1},
        li: {width: 3, height: 2},
        vi: {x: 0, y: 1},
        pk: {x: 0, y: 2},
        vk: {x:0, y:1}
      },
      {
        description: 'Diagonal vector',
        expected: interval(0, 1),
        pi: {x: 2, y: 3},
        li: {width: 2, height: 2},
        vi: {x: 1, y: 1},
        pk: {x: 2, y: 2},
        vk: {x:1, y:1}
      },
      {
        description: 'Diagonal vector, point is not contained',
        expected: interval(3, 5),
        pi: {x: -1, y: 0},
        li: {width: 2, height: 2},
        vi: {x: 1, y: 1},
        pk: {x: 0, y: 4},
        vk: {x:4, y:0}
      }
    ]
    tests.forEach(function (test) {
      it(test.description, function () {
        const extendedPoints = [{position: test.pi, label: test.li}, {position: {x: 4, y: 45}, label: {width: 4, height: 4}}]
        sandbox.stub(webglUtils, 'computeRays', function (radiusData) {
          radiusData[0] = test.vi.x
          radiusData[1] = test.vi.y
        })
        const {intersectionData, labelData, radiusData, computeIntersection} = webgl.setUp(extendedPoints, numberOfRays)
        // rectangle at pk + vk
        const pk = test.pk
        const vk = test.vk
        computeIntersection(pk.y + vk.y, pk.x + vk.x, pk.y + vk.y, pk.x + vk.x, pk.y + vk.y, pk.x, pk.y)
        assert.deepEqual(interval(intersectionData[0], intersectionData[1]), test.expected, `intersection ${intersectionData[0]}, ${intersectionData[1]} <-> ${test.expected.start} ${test.expected.end}`)
      })
    })
    // TODO rest of the tests
  })
})