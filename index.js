var margin = {top: 20, right: 20, bottom: 30, left: 50}
var width = 960 - margin.left - margin.right
var height = 500 - margin.top - margin.bottom

var x = d3.scaleLinear().range([0, width])
var y = d3.scaleLinear().range([height, 0])

var color = d3.scaleOrdinal(d3.schemeCategory10)

var svg = d3.select('body').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
d3.tsv('data.tsv', function (err, data) {
  if (err) throw  err
  data.forEach(function (d) {
    d.sepalLength = +d.sepalLength
    d.sepalWidth = +d.sepalWidth
  })
  x.domain(d3.extent(data, d=>d.sepalWidth)).nice()
  y.domain(d3.extent(data, d=>d.sepalLength)).nice()
  svg.selectAll('dot')
    .data(data)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('r', 3.5)
    .attr('cx', d=>x(d.sepalWidth))
    .attr('cy', d=>y(d.sepalLength))
    .style('fill', d=> color(d.species))
  
})