/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	var interval  = __webpack_require__(2)

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
	  render(data, xAxis, yAxis)
	  setTimeout(function () {
	    render(data.slice(0, 5), xAxis, yAxis)
	  }, 2000)
	})


	function render (data, xAxis, yAxis) {
	  x.domain(d3.extent(data, d => d.obesity_percentage)).nice()
	  y.domain(d3.extent(data, d => d.life_expectancy_at_60)).nice()
	  const dots = svg.selectAll('.dot')
	    .data(data)
	  dots.enter().append('circle')
	    .attr('class', 'dot')
	    .attr('r', 3.5)
	    .attr('cx', d => x(d.obesity_percentage))
	    .attr('cy', d => y(d.life_expectancy_at_60))
	    .style('fill', d=> color(d.development_group))
	  dots.exit()
	    .transition(500)
	    .attr('oppacitiy', 0)
	    .remove()
	  xAxis.call(d3.axisBottom(x))
	  yAxis.call(d3.axisLeft(y))

	}



/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = {interval}
	function Interval (start, end) {
	  if (start >= end) {
	    // console.error('Wrong order of interval', start, end)
	    this.empty = true
	    this.start = null
	    this.end = null
	    return this
	  }
	  this.start = start
	  this.end = end
	  return this
	}

	Interval.empty = function () {
	  return new Interval(1, -1)
	}
	Interval.prototype.intersect = function (interval) {
	  if (this.empty || interval.empty) return Interval.empty()
	  return new Interval(Math.max(interval.start, this.start), Math.min(interval.end, this.end))
	}

	Interval.prototype.coalesce = function (interval) {
	  if (this.empty) return interval
	  if (interval.empty) return this
	  if (interval.start > this.end || this.start > interval.end) {
	    // We probably need a multi interval in this case
	    throw new Error('Cannot coallesce')
	  }
	  return new Interval(Math.min(interval.start, this.start), Math.max(interval.end, this.end))
	}
	Interval.prototype.clone = function () {
	  if (this.empty) return Interval.empty()
	  return new Interval(this.start, this.end)
	}
	Interval.prototype.measure = function () {
	  if (this.empty) return 0
	  return Math.pow(2, -this.start) - Math.pow(2, -this.end)
	}
	function interval(start, end) {
	  return new Interval(start, end)
	}
	interval.empty = Interval.empty

/***/ }
/******/ ]);