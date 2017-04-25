const mainAlgorithm = require('./../src/main-algorithm-loader').mainAlgorithm
const multiInterval = require('./../src/multi-interval').multiInterval
const interval = require('./../src/interval').interval
describe('Main algorithm', function () {
  it.only('Label one point', async function () {
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

    const result = await mainAlgorithm(pointsToLabel)
  })
  it.skip('Performance test', function () {
    // 40 points
    const pointsToLabel = [{"id":0,"position":{"x":985.05,"y":-318.75},"label":{"height":23.25,"width":71.03125}},{"id":1,"position":{"x":1248.7250000000001,"y":-201.8749999999999},"label":{"height":23.25,"width":83.6875}},{"id":2,"position":{"x":741.275,"y":-212.5},"label":{"height":23.25,"width":106.75}},{"id":3,"position":{"x":805.9499999999999,"y":-371.875},"label":{"height":23.25,"width":111.078125}},{"id":4,"position":{"x":1582.0500000000002,"y":-403.75000000000006},"label":{"height":23.25,"width":123.3125}},{"id":5,"position":{"x":1059.675,"y":-371.875},"label":{"height":23.25,"width":86.734375}},{"id":6,"position":{"x":1343.25,"y":-308.1249999999999},"label":{"height":23.25,"width":119.96875}},{"id":7,"position":{"x":1208.9250000000002,"y":-276.2500000000001},"label":{"height":23.25,"width":74.671875}},{"id":8,"position":{"x":318.40000000000003,"y":-265.625},"label":{"height":23.25,"width":95.796875}},{"id":9,"position":{"x":805.9499999999999,"y":-488.75000000000017},"label":{"height":23.25,"width":84.375}},{"id":10,"position":{"x":1218.875,"y":-382.50000000000017},"label":{"height":23.25,"width":63.265625}},{"id":11,"position":{"x":825.85,"y":-308.1249999999999},"label":{"height":23.25,"width":75.640625}},{"id":12,"position":{"x":1089.5249999999999,"y":-286.8749999999999},"label":{"height":23.25,"width":66.609375}},{"id":13,"position":{"x":1238.7749999999999,"y":-371.875},"label":{"height":23.25,"width":145.140625}},{"id":14,"position":{"x":363.175,"y":-318.75},"label":{"height":23.25,"width":175.140625}},{"id":15,"position":{"x":223.875,"y":-95.62499999999989},"label":{"height":23.25,"width":57.859375}},{"id":16,"position":{"x":1268.625,"y":-286.8749999999999},"label":{"height":23.25,"width":51.453125}},{"id":17,"position":{"x":776.1,"y":-201.8749999999999},"label":{"height":23.25,"width":65.609375}},{"id":18,"position":{"x":910.4250000000001,"y":-329.3750000000001},"label":{"height":23.25,"width":68.109375}},{"id":19,"position":{"x":950.225,"y":-361.24999999999983},"label":{"height":23.25,"width":75.09375}},{"id":20,"position":{"x":1164.1499999999999,"y":-382.50000000000017},"label":{"height":23.25,"width":113.296875}},{"id":21,"position":{"x":990.0249999999999,"y":-339.99999999999994},"label":{"height":23.25,"width":67.71875}},{"id":22,"position":{"x":1343.25,"y":-446.24999999999994},"label":{"height":23.25,"width":81.34375}},{"id":23,"position":{"x":855.6999999999999,"y":-244.3750000000001},"label":{"height":23.25,"width":39.921875}},{"id":24,"position":{"x":1198.9750000000001,"y":-233.7499999999999},"label":{"height":23.25,"width":54.515625}},{"id":25,"position":{"x":1427.825,"y":-626.8749999999999},"label":{"height":23.25,"width":144.5625}},{"id":26,"position":{"x":870.625,"y":-371.875},"label":{"height":23.25,"width":70.203125}},{"id":27,"position":{"x":393.02500000000003,"y":-595.0000000000001},"label":{"height":23.25,"width":172.90625}},{"id":28,"position":{"x":1646.7250000000001,"y":-616.2500000000001},"label":{"height":23.25,"width":55.359375}},{"id":29,"position":{"x":1164.1499999999999,"y":-531.25},"label":{"height":23.25,"width":67.84375}},{"id":30,"position":{"x":940.275,"y":-722.5000000000001},"label":{"height":23.25,"width":70.078125}},{"id":31,"position":{"x":1751.2000000000003,"y":-828.7500000000001},"label":{"height":23.25,"width":119.140625}},{"id":32,"position":{"x":1228.8249999999998,"y":-839.3749999999999},"label":{"height":23.25,"width":84.546875}},{"id":33,"position":{"x":1154.1999999999998,"y":-626.8749999999999},"label":{"height":23.25,"width":64.390625}},{"id":34,"position":{"x":1223.85,"y":-764.9999999999999},"label":{"height":23.25,"width":80.21875}},{"id":35,"position":{"x":1323.3500000000001,"y":-499.37499999999994},"label":{"height":23.25,"width":52.28125}},{"id":36,"position":{"x":1676.575,"y":-764.9999999999999},"label":{"height":23.25,"width":193.328125}},{"id":37,"position":{"x":1447.7250000000001,"y":-361.24999999999983},"label":{"height":23.25,"width":50.203125}},{"id":38,"position":{"x":1074.6000000000001,"y":-403.75000000000006},"label":{"height":23.25,"width":77.046875}},{"id":39,"position":{"x":1233.8,"y":-754.3750000000001},"label":{"height":23.25,"width":78.84375}}]
    console.time('algorithm 3 rays')
    mainAlgorithm(pointsToLabel, {NUMBER_OF_RAYS: 3})
    console.timeEnd('algorithm 3 rays') //1267ms
    console.time('algorithm 128 rays')
    mainAlgorithm(pointsToLabel, {NUMBER_OF_RAYS: 128})
    console.timeEnd('algorithm 128 rays') //658699.277ms
  })

})