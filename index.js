'use strict'
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
    d.obesity_percentage = Number(d.obesity_percentage)
    d.life_expectancy_at_60 = Number(d.life_expectancy_at_60)
  })
  render(data)
  /*setTimeout(function () {
    render(data.slice(0, 5))
  }, 10000)*/
})


function render (data) {
  x.domain(d3.extent(data, d => d.obesity_percentage)).nice()
  y.domain(d3.extent(data, d => d.life_expectancy_at_60)).nice()
  const dots = svg.selectAll('dot')
    .data(data)
  dots.enter().append('circle')
    .attr('class', 'dot')
    .attr('r', 3.5)
    .attr('cx', d => x(d.obesity_percentage))
    .attr('cy', d => y(d.life_expectancy_at_60))
    .style('fill', d=> color(d.development_group))
  dots.exit()
    .remove()
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x))
  svg.append('g')
    .call(d3.axisLeft(y))

}

