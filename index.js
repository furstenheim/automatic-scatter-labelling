var interval  = require('./src/interval.js')

var margin = {top: 20, right: 20, bottom: 30, left: 50}
var width = 2060 - margin.left - margin.right
var height = 900 - margin.top - margin.bottom

var x = d3.scaleLinear().range([0, width])
var y = d3.scaleLinear().range([height, 0])

var color = d3.scaleOrdinal(d3.schemeCategory10)

var svg = d3.select('body').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

d3.csv('data.csv', function (err, data) {
  if (err) throw  err
  data.forEach(function (d) {
    d.obesity_percentage = +d.obesity_percentage
    d.life_expectancy_at_60 = +d.life_expectancy_at_60
  })
  x.domain(d3.extent(data, d=>d.obesity_percentage)).nice()
  y.domain(d3.extent(data, d=>d.life_expectancy_at_60)).nice()
  svg.selectAll('dot')
    .data(data)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('r', 3.5)
    .attr('cx', d=>x(d.obesity_percentage))
    .attr('cy', d=>y(d.life_expectancy_at_60))
    .style('fill', d=> color(d.development_group))

  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x))
  svg.append('g')
    .call(d3.axisLeft(y))

  /* Let's start the label algorithm
    Only a finite number of angles, 128 is used, we prepare the unit vectors
   */
  var vectors
  for (let i = 0; i< 128; i++) {
    vectors.push([Math.cos(i * 2 * Math.PI / 128), Math.sin(i * 2 * Math.PI / 128)])
  }
})

// Given label lk, and label li moving on vector vi from point pi it computes the interval at which li intersects lk
function labelRectangleIntersection (lk, li, vi, pi) {

}



// Given a bbox and an angle (of the ray coming from the point, We find the relative coordinates of the box. For example if the angle was P/2 the label would be clipped from the corner
function getRelativeCornerToBBox (bbox, angle) {
  var verticalDifference = 0
  var horizontalDifference = 0
  // Angles grow counterclockwise because height grows from top to bottom
  if (angle < Math.PI / 4) {
    verticalDifference = bbox.height * (angle - Math.PI/4) / (Math.PI / 2)
  } else if (angle  < 3 * Math.PI / 4) {
    horizontalDifference = -bbox.width * (angle - Math.PI / 4) / (Math.PI / 2)
  } else if (angle < 5 * Math.PI / 4) {
    horizontalDifference = -bbox.width
    verticalDifference = - bbox.height * (angle - 3 * Math.PI / 4) / (Math.PI / 2)
  } else if (angle < 7 * Math.PI  / 4 ) {
    verticalDifference = -bbox.height
    horizontalDifference = -bbox.width * (angle - 7 * Math.PI / 4) / (Math.PI / 2)
  } else {
    verticalDifference = bbox.height (angle - 9*Math.PI / 4) / (Math.PI / 2)
  }
  return {bottom: verticalDifference, top: verticalDifference, left: horizontalDifference, right: horizontalDifference}
}