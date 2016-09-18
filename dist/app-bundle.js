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

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = interval
	function Interval (start, end) {
	  if (start > end) {
	    console.error('Wrong order of interval', start, end)
	    return null
	  }
	  this.start = start
	  this.end = end
	  return this
	}

	Interval.prototype.intersect = function (interval) {
	  if (this === null || interval === null) return null
	  return new Interval(Math.max(interval.start, this.start), Math.min(interval.end, this.end))
	}

	function interval(start, end) {
	  return new Interval(start, end)
	}

/***/ }
/******/ ]);