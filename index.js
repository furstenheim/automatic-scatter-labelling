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
  data.forEach(function (d) {
    d.obesity_percentage = Number(d.obesity_percentage)
    d.life_expectancy_at_60 = Number(d.life_expectancy_at_60)
  })
  const xAxis = svg.append('g')
    .attr('transform', `translate(0, ${height})`)
  const yAxis = svg.append('g')
    .attr('class', 'axis-y')
  render(data.slice(0, 10), xAxis, yAxis)
/*  setTimeout(function () {
    render(data.slice(0, 5), xAxis, yAxis)
  }, 2000)*/
})


function render (data, xAxis, yAxis) {
  x.domain(d3.extent(data, d => d.obesity_percentage)).nice()
  y.domain(d3.extent(data, d => d.life_expectancy_at_60)).nice()
  const extendedPoints = data.map((d,i) => {
   return {
     id: i,
     position: {
       x: x(d.obesity_percentage),
       y: y(d.life_expectancy_at_60)
     },
     label: {
       height: 1,
       width: 2
     }
   }
  })
  console.log('start ', extendedPoints)
  debugger
  const result = mainAlgorithm(extendedPoints)
  console.log(result)
  const dots = svg.selectAll('.dot')
    .data(data)
  dots.enter().append('circle')
    .attr('class', 'dot')
    .attr('r', 3.5)
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
    /*.on('end', function (){
      this.remove()
    })*/
  const lines = svg.selectAll('.segment')
    .data(result)
  lines.enter().append('line')
    .attr('class', 'segment')
    .style('stroke', 'black')
    .attr('x1', d => extendedPoints[d.id].position.x)
    .attr('y1', d => extendedPoints[d.id].position.y)
    .attr('x2', d => (d.rectangle.left + d.rectangle.right) / 2)
    .attr('y2', d => (d.rectangle.top + d.rectangle.bottom) / 2)
  xAxis.call(d3.axisBottom(x))
  yAxis.call(d3.axisLeft(y))

}

