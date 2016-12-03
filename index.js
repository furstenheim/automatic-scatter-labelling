'use strict'
const mainAlgorithm = require('./src/main-algorithm').mainAlgorithm

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
  data.forEach(function (d, i) {
    d.obesity_percentage = Number(d.obesity_percentage)
    d.life_expectancy_at_60 = Number(d.life_expectancy_at_60)
    d.id = i
  })
  const xAxis = svg.append('g')
    .attr('transform', `translate(0, ${height})`)
  const yAxis = svg.append('g')
    .attr('class', 'axis-y')
  render(data.slice(0, 40), xAxis, yAxis)
/*  setTimeout(function () {
    render(data.slice(0, 5), xAxis, yAxis)
  }, 2000)*/
})


function render (data, xAxis, yAxis) {
  const radius = 3.5
  x.domain(d3.extent(data, d => d.obesity_percentage)).nice()
  y.domain(d3.extent(data, d => d.life_expectancy_at_60)).nice()
  //data = _.filter(data, d => _.includes(['Ireland', 'United Kingdom', 'Luxembourg'], d.country))

  const labels = svg.selectAll('text.graph-label')
    .data(data, function (d, i) {
      return d.id
    })
    .enter()
    .append('text')
    .attr('class', 'graph-label')
    .attr('font-size', '20px')
    .attr('text-anchor', 'middle')
    .attr('x', d => x(d.obesity_percentage))
    .attr('y', d => y(d.life_expectancy_at_60))
    .attr('opacity', 100)
    .text(function (d) {
      return d.country
    }).each(function (d) { // Get sizes for the algorithm
      var bbox = this.getBBox()
      d.label = {
        height: bbox.height,
        width: bbox.width
      }
    })

  const extendedPoints = data.map((d) => {
   return {
     id: d.id,
     position: {
       x: x(d.obesity_percentage),
       y: -y(d.life_expectancy_at_60)
     },
     label: {
       height: d.label.height + 2,
       width: d.label.width + 2
     }
   }
  })
  const idToPoints = _.groupBy(extendedPoints, 'id')
  console.log('start ', JSON.stringify(extendedPoints))
  //debugger
  const result = mainAlgorithm(extendedPoints, {NUMBER_OF_RAYS: 3, radius: 3 * radius, bbox: {top: -margin.top, bottom: -margin.top - height, left: margin.left, right: margin.left + width, width, height: height}})
  console.log(result)
  const dots = svg.selectAll('.dot')
    .data(data)
  dots.enter().append('circle')
    .attr('class', 'dot')
    .attr('r', radius)
    .attr('opacity', 100)
    .attr('cx', d => x(d.obesity_percentage))
    .attr('cy', d => y(d.life_expectancy_at_60))
    .style('fill', d=> color(d.development_group))
  dots.exit()
    .transition()
    .duration(500)
    .attr('opacity', 0)
    .attr('r', 0)
    .remove()

  const lines = svg.selectAll('.segment')
    .data(result)
  lines.enter().append('line')
    .attr('class', 'segment')
    .style('stroke', 'black')
    .style('stroke-with', '2px')
    .attr('x1', d => idToPoints[d.id][0].position.x)
    .attr('y1', d => -idToPoints[d.id][0].position.y)
    .attr('x2', d => (d.rectangle.left + d.rectangle.right) / 2)
    .attr('y2', d => -(d.rectangle.top + d.rectangle.bottom) / 2)

  const label2 = svg.selectAll('text.graph-label')
    .data(result, function (d, i) {
        return d.id
    }) // id corresponds to previous position

  label2.transition()
    .duration(500)
    .attr('opacity', 100)
    .attr('x', function (d) {
      return (d.rectangle.left + d.rectangle.right) / 2
    })
    .attr('y', d => -(d.rectangle.top + d.rectangle.bottom) / 2)
  label2.exit()
    .each(function (d, i){
      console.log(d, i)
    }).remove()
  xAxis.call(d3.axisBottom(x))
  yAxis.call(d3.axisLeft(y))

}

