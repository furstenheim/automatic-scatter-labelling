(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("_"));
	else if(typeof define === 'function' && define.amd)
		define("automaticScatterLabelling", ["_"], factory);
	else if(typeof exports === 'object')
		exports["automaticScatterLabelling"] = factory(require("_"));
	else
		root["automaticScatterLabelling"] = factory(root["_"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_13__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 14);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const mainAlgorithmLoader = __webpack_require__(1);
module.exports = mainAlgorithmLoader.mainAlgorithm;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { mainAlgorithm };
var MainAlgorithmWorker = __webpack_require__(12);
const webgl = __webpack_require__(11);
const algorithm = new MainAlgorithmWorker();
const webGLFunctions = {}; // Here we store the reference to the functions
const promiseResolutions = {};
function mainAlgorithm(extendedPoints, params = {}) {
  return new Promise(function (resolve, reject) {
    extendedPoints = extendedPoints.map(p => {
      return {
        id: p.id,
        position: {
          x: p.position.x,
          y: -p.position.y // The algorithm expects y to grow upwards
        },
        label: p.label
      };
    });
    const NUMBER_OF_RAYS = _.isNumber(params.NUMBER_OF_RAYS) ? params.NUMBER_OF_RAYS : 3;
    const isWebgl = params.isWebgl;
    let intersectionData, computeIntersection, rectangleData;
    const processUUID = parseInt(Math.random() * 1000000).toString(); // no need for anything fancy
    if (isWebgl) {
      ({ intersectionData, computeIntersection, rectangleData } = webgl.setUp(extendedPoints, NUMBER_OF_RAYS));
      algorithm.postMessage({
        type: 'start',
        extendedPoints,
        params,
        intersectionData,
        rectangleData,
        processUUID
      }, [intersectionData.buffer, rectangleData.buffer]);
      webGLFunctions[processUUID] = computeIntersection;
    } else {
      algorithm.postMessage({
        type: 'start',
        extendedPoints,
        params,
        processUUID
      });
    }
    promiseResolutions[processUUID] = function (event) {
      const result = event.data.result.map(p => {
        return {
          id: p.id,
          rectangle: {
            left: p.rectangle.left,
            right: p.rectangle.right,
            top: -p.rectangle.top,
            bottom: -p.rectangle.bottom
          }
        };
      });
      return resolve(result);
    };
  });
}
algorithm.onmessage = function (event) {
  const data = event.data;
  switch (data.type) {
    case 'end':
      endEvent(event);
      break;
    case 'computeIntersection':
      computeInGPU(event);
      break;
    default:
      console.error('src/main-algorithm-loader.js:69:20:\'This event case should not happen\',data.type', 'This event case should not happen', data.type);
  }
};
function computeInGPU(event) {
  const data = event.data;
  const processUUID = data.processUUID;
  const computeIntersection = webGLFunctions[processUUID];
  const { intersectionData, rectangleData } = computeIntersection(data.rectangleData, data.pix, data.piy, data.intersectionData);
  algorithm.postMessage({
    intersectionData,
    rectangleData,
    uuid: data.uuid,
    type: 'computeIntersection'
  }, [intersectionData.buffer, rectangleData.buffer]);
}

function endEvent(event) {
  const { processUUID } = event.data;
  const callback = promiseResolutions[processUUID];
  callback(event);
  delete promiseResolutions[processUUID];
  delete webGLFunctions[processUUID];
}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = { labelRectangleIntersectionFragment };

function labelRectangleIntersectionFragment() {
  return `
  // min max of the interval
  // rectangle has top, left, bottom, right
  // label height width
  // ray x y
  // returns -1,-1 if empty
  vec2 label_rectangle_intersection (vec4 rectangle, vec2 label, vec2 ray, vec2 point) {
    float my_min = 0.;
    float my_max = infinity;
    float rectangle_height = (rectangle.r - rectangle.b);
    float rectangle_width = (rectangle.a - rectangle.g);
    if (ray.y != 0.) {
      float firstIntersection = (rectangle_height / 2. + label.x / 2. + (rectangle.r + rectangle.b) / 2. - point.y) / ray.y;
      float secondIntersection = (- rectangle_height / 2. - label.x / 2. + (rectangle.r + rectangle.b) / 2. - point.y) / ray.y;
      // Multiplying by a negative sign reverses an inequality
      if (ray.y > 0.) {
        my_max = min(my_max, firstIntersection);
        my_min = max(my_min, secondIntersection);
      } else {
        my_min = max(my_min, firstIntersection);
        my_max = min(my_max, secondIntersection);
      }
    } else {
      // vector is vertical and they will never intersect
      if (point.y - (rectangle.r + rectangle.b) / 2. > rectangle_height / 2. + label.x / 2.) {
        return vec2(-1., -1.);
      }
      if (point.y - (rectangle.r + rectangle.b) / 2. < - rectangle_height / 2. - label.x / 2.) {
        return vec2(-1., -1.);
      }
    }
    if (ray.x != 0.) {
      float thirdIntersection = (rectangle_width / 2. + label.y / 2. + (rectangle.a + rectangle.g) / 2. - point.x) / ray.x;
      float fourthIntersection = (- rectangle_width / 2. - label.y / 2. + (rectangle.a + rectangle.g) / 2. - point.x) / ray.x;
      if (ray.x > 0.) {
        my_max = min(my_max, thirdIntersection);
        my_min = max(my_min, fourthIntersection);
      } else {
        my_min = max(my_min, thirdIntersection);
        my_max = min(my_max, fourthIntersection);
      }
    } else {
      if (point.x - (rectangle.a + rectangle.g) / 2. > rectangle_width / 2. + label.y / 2.) {
        return vec2(-1., -1.);
      }
      if (point.x - (rectangle.a + rectangle.g) / 2. < -rectangle_width / 2. - label.y / 2.) {
        return vec2(-1., -1.);
      }
    }
    if (my_min >= my_max) {
      return vec2(-1., -1.);
    }
    return vec2(my_min, my_max);
    }
  `;
}

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = { labelSegmentIntersectionFragment };

function labelSegmentIntersectionFragment() {
  return `
    vec2 label_segment_intersection (vec2 segment_point, vec2 segment, vec2 label, vec2 ray, vec2 point) {
          // Translate so that ray starts at origin
          vec2 pk = segment_point - point;
          float my_min = infinity;
          float my_max = 0.;
          for (float i = -1.; i < 1.5; i += 2.) {
          // label.y is width
          float x = i * label.y / 2.;
          for (float j = -1.; j < 1.5; j += 2.) {
            float y = j * label.x / 2.;
            bool intersects;
            intersects = segment_segment_intersects(vec2(x, y), ray, pk, segment);
            if (intersects) {
              vec2 intersection = segment_segment_intersection(vec2(x, y), ray, pk, segment);
              if (intersection.y >= 0. && intersection.y <= 1.) {
                my_max = max(my_max, intersection.x);
                my_min = min(my_min, intersection.x);
              }
            }
            // Given a point, we take the side coming from it in counter clockwise
            vec2 side;
            if (x * y < 0.) {
              side = vec2(0., -2. * y);
            } else {
              side = vec2(-2. * x, 0.);
            }
            if (segment_segment_intersects(vec2(x, y), side, pk, ray)) {
              vec2 intersection = segment_segment_intersection(vec2(x, y), side, pk, ray);
              if (intersection.x >= 0. && intersection.x <= 1.) {
                my_max = max(my_max, -intersection.y);
                my_min = min(my_min, -intersection.y);
              }

            }
            vec2 translated_point = pk + segment;
            if (segment_segment_intersects(vec2(x, y), side, translated_point, ray)) {
              vec2 intersection = segment_segment_intersection(vec2(x, y), side, translated_point, ray);
              if (intersection.x >=0. && intersection.x <= 1.) {
                my_max = max(my_max, -intersection.y);
                my_min = min(my_min, -intersection.y);
              }
            }
          }
        }
        if (my_max == 0.) {
          return vec2(-1., -1.);
        }
        my_min = max(my_min, 0.);
        return vec2(my_min, my_max);
    }
  `;
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { mainFragment };

const mainIntersectionFragment = __webpack_require__(5);
const segmentSegmentIntersectsFragment = __webpack_require__(9);
const segmentSegmentIntersectionFragment = __webpack_require__(8);
const labelRectangleIntersectionFragment = __webpack_require__(2);
const labelSegmentIntersectionFragment = __webpack_require__(3);
const rayRectangleIntersectionFragment = __webpack_require__(6);
const raySegmentIntersectionFragment = __webpack_require__(7);
function mainFragment(size, numberOfRays) {
  return `
  precision mediump float;
  // we are in clamped mode so we are ok
  float infinity = 1./0.0000001;
  uniform sampler2D u_points_texture;
  uniform sampler2D u_radius_texture;
  uniform sampler2D u_rectangle_texture;
  uniform vec4 u_label_texture;
  uniform vec4 u_rect_point;
  varying vec2 pos;
  float get_index (void) {
    return (pos.x * ${ size * 2 }. -1.)/2. + ${ size }.0 * (pos.y * ${ size * 2 }. - 1.)/2.;
  }
  vec2 get_rectangle_index (void) {
    return vec2((mod(get_index(), ${ numberOfRays }.0) + 0.5) / (${ size }.), 1./ ${ 2 * size }.);
  }
  vec4 read_point (void) {
    return texture2D(u_points_texture, pos);
  }
  vec2 read_radius (void) {
    return texture2D(u_radius_texture, pos).rg;
  }
  vec4 read_rectangle (void) {
    return texture2D(u_rectangle_texture,  get_rectangle_index());
  }
  vec4 read_rectangle_point (void) {
    return u_rect_point;
  }
  void commit (vec4 val) {
    gl_FragColor = val;
  }
  ${ segmentSegmentIntersectsFragment.segmentSegmentIntersectsFragment() }
  ${ segmentSegmentIntersectionFragment.segmentSegmentIntersectionFragment() }
  ${ labelRectangleIntersectionFragment.labelRectangleIntersectionFragment() }
  ${ labelSegmentIntersectionFragment.labelSegmentIntersectionFragment() }
  ${ rayRectangleIntersectionFragment.rayRectangleIntersectionFragment() }
  ${ raySegmentIntersectionFragment.raySegmentIntersectionFragment() }
  ${ mainIntersectionFragment.mainIntersectionFragment(size, numberOfRays) }
  `;
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = { mainIntersectionFragment };

function mainIntersectionFragment(size, numberOfRays) {
  return `void main (void) {
    vec4 point = read_point();
    vec2 radius = read_radius();
    vec4 rect = read_rectangle();
    vec4 rect_point = read_rectangle_point();
    vec2 segment = (rect.ar + rect.gb) / 2. - rect_point.rg;
    vec2 label_interval = label_rectangle_intersection(rect, point.ba, radius, point.rg);
    vec2 segment_interval = label_segment_intersection(rect_point.xy, segment, point.ba, radius, point.rg);
    vec2 ray_interval = ray_rectangle_intersection(rect, radius, point.rg);
    vec2 ray_segment_interval = ray_segment_intersection(rect_point.xy, segment, point.rg, radius);

    vec2 label_intersection;
    vec2 segment_intersection;
    // if ray intervals are not empty then normal intervals are not empty. Hence we only need to consider rays emptiness
    if (ray_interval.x < 0.) {
      label_intersection = label_interval;
    } else {
      label_intersection = vec2(min(label_interval.x, ray_interval.x), max(label_interval.y, ray_interval.y));
    }
    if (ray_segment_interval.x < 0.) {
      segment_intersection = segment_interval;
    } else {
      segment_intersection = vec2(min(segment_interval.x, ray_segment_interval.x), max(segment_interval.y, ray_segment_interval.y));
    }

    commit(vec4(label_intersection, segment_intersection));
  }`;
}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = { rayRectangleIntersectionFragment };
function rayRectangleIntersectionFragment() {
  return `
  vec2 ray_rectangle_intersection (vec4 rectangle, vec2 ray, vec2 ray_point) {
    vec2 fake_label = vec2(0., 0.);
    vec2 intersection = label_rectangle_intersection(rectangle, fake_label, ray, ray_point);
    // empty
    if (intersection.x < 0.) {
      return intersection;
    }
    return vec2(intersection.x, infinity);
  }
  `;
}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = { raySegmentIntersectionFragment };
function raySegmentIntersectionFragment() {
  return `vec2 ray_segment_intersection(vec2 segment_point, vec2 segment, vec2 ray_point, vec2 ray) {
    if (!segment_segment_intersects(ray_point, ray, segment_point, segment)) {
      return vec2(-1., -1.);
    }
    vec2 intersection = segment_segment_intersection(ray_point, ray, segment_point, segment);
    if (intersection.x <=0. || intersection.y < 0. || intersection.y > 1.) {
      return vec2(-1., -1.);
    }
    return vec2(intersection.x, infinity);
  }
  `;
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = { segmentSegmentIntersectionFragment };

function segmentSegmentIntersectionFragment() {
  return `
  vec2 segment_segment_intersection (vec2 ray_point, vec2 ray, vec2 segment_point, vec2 segment) {
    // This assumes that rays already intersect
      float det = - (ray.x* segment.y - segment.x * ray.y);
      float t = (-(segment_point.x - ray_point.x) * segment.y + (segment_point.y - ray_point.y) * segment.x) / det;
      float s = (-(segment_point.x - ray_point.x) * ray.y + (segment_point.y - ray_point.y) * ray.x) / det;
      return vec2(t, s);
  }
  `;
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = { segmentSegmentIntersectsFragment };

function segmentSegmentIntersectsFragment() {
  return `
  bool segment_segment_intersects (vec2 ray_point, vec2 ray, vec2 segment_point, vec2 segment) {
   // TODO handle parallel concurrent lines
    return (ray.x * segment.y - ray.y * segment.x) != 0.;
  }
  `;
}

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = { computeRays };
function computeRays(radiusData, numberOfPoints, numberOfRays) {
  for (let i = 0; i < numberOfPoints; i++) {
    for (let j = 0; j < numberOfRays; j++) {
      for (let k = 0; k < numberOfRays; k++) {
        const index = numberOfRays * numberOfRays * i * 4 + numberOfRays * j * 4 + k * 4;
        radiusData[index] = Math.sin(2 * Math.PI * j / numberOfRays);
        radiusData[index + 1] = Math.cos(2 * Math.PI * j / numberOfRays);
      }
    }
  }
}

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { setUp };

const mainFragment = __webpack_require__(4).mainFragment;
const utils = __webpack_require__(10);
const _ = __webpack_require__(13);

/**
 *
 * @param extendedPoints array of objects with label and position
 * @param numberOfRays number of rays per point
 * @returns {Float32Array}
 */
function setUp(extendedPoints, numberOfRays) {
  const gl = createGl();
  // For each extended point and each direction we save four data
  const size = computeTexturesSize(extendedPoints.length * numberOfRays * numberOfRays);

  // Four corners of the square
  var positionBuffer = newBuffer(gl, [-1, -1, 1, -1, 1, 1, -1, 1]);
  var textureBuffer = newBuffer(gl, [0, 0, 1, 0, 1, 1, 0, 1]);
  var indexBuffer = newBuffer(gl, [1, 2, 0, 3, 0, 2], Uint16Array, gl.ELEMENT_ARRAY_BUFFER);

  const { vertexShader, transformFragmentShader } = getShaders(gl, size, numberOfRays);

  const pointsData = new Float32Array(size * size * 4);
  for (let i = 0; i < extendedPoints.length; i++) {
    const point = extendedPoints[i];
    for (let j = 0; j < numberOfRays; j++) {
      for (let k = 0; k < numberOfRays; k++) {
        const index = numberOfRays * numberOfRays * i * 4 + j * 4 * numberOfRays + k * 4;
        pointsData[index] = point.position.x;
        pointsData[index + 1] = point.position.y;
        pointsData[index + 2] = point.label.height;
        pointsData[index + 3] = point.label.width;
      }
    }
  }
  var pointsTexture = createTexture(gl, pointsData, size);

  const radiusData = new Float32Array(size * size * 4);
  utils.computeRays(radiusData, extendedPoints.length, numberOfRays);
  // We will fill with sin and cos later in the setup
  var radiusTexture = createTexture(gl, radiusData, size);

  const rectangleData = new Float32Array(size * size * 4);
  const rectangleTexture = createTexture(gl, rectangleData, size);

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, transformFragmentShader);
  gl.linkProgram(program);

  const uPointsTexture = gl.getUniformLocation(program, 'u_points_texture');
  const uRadiusTexture = gl.getUniformLocation(program, 'u_radius_texture');
  const uLabelTexture = gl.getUniformLocation(program, 'u_label_texture');
  const uRectangleTexture = gl.getUniformLocation(program, 'u_rectangle_texture');
  const uRectanglePoint = gl.getUniformLocation(program, 'u_rect_point');
  const aPosition = gl.getAttribLocation(program, 'position');
  const aTexture = gl.getAttribLocation(program, 'texture');

  gl.useProgram(program);
  gl.viewport(0, 0, size, size);
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.createFramebuffer());

  var nTexture = createTexture(gl, new Float32Array(size * size * 4), size);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, nTexture, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, pointsTexture);
  gl.uniform1i(uPointsTexture, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, radiusTexture);
  gl.uniform1i(uRadiusTexture, 1);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, rectangleTexture);
  gl.uniform1i(uRectangleTexture, 2);

  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);

  gl.enableVertexAttribArray(aTexture);
  gl.vertexAttribPointer(aTexture, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const intersectionData = new Float32Array(size * size * 4);
  var labelData = new Float32Array(4);
  var rectanglePoint = new Float32Array(4);

  gl.bindTexture(gl.TEXTURE_2D, rectangleTexture);
  return {
    radiusData,
    intersectionData,
    computeIntersection,
    rectangleData
  };
  // TODO change program


  // Rectangle, then pi
  function computeIntersection(rectangleData, pix, piy, intersectionData) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, rectangleData);
    //gl.uniform4fv(uLabelTexture, labelData)
    rectanglePoint[0] = pix;
    rectanglePoint[1] = piy;
    gl.uniform4fv(uRectanglePoint, rectanglePoint);
    redraw(gl);
    gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, intersectionData);
    return { intersectionData, rectangleData };
  }
}

function createTexture(gl, data, size) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, data);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

function getShaders(gl, size, numberOfRays) {

  var vertexShaderCode = `
  attribute vec2 position;
  varying vec2 pos;
  attribute vec2 texture;

  void main (void) {
    pos = texture;
    gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;
  // Compute sin and cos for radius shader
  var transformFragmentShaderCode = mainFragment(size, numberOfRays);
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const transformFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.shaderSource(transformFragmentShader, transformFragmentShaderCode);

  gl.compileShader(vertexShader);
  gl.compileShader(transformFragmentShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) console.error('src/webgl/webgl.js:151:77:gl.getShaderInfoLog(vertexShader)', gl.getShaderInfoLog(vertexShader));
  if (!gl.getShaderParameter(transformFragmentShader, gl.COMPILE_STATUS)) console.error('src/webgl/webgl.js:152:88:transformFragmentShaderCode,gl.getShaderInfoLog(transformFragmentShader)', transformFragmentShaderCode, gl.getShaderInfoLog(transformFragmentShader));

  return {
    vertexShader,
    transformFragmentShader
  };
}
function newBuffer(gl, data, f, e) {
  var buf = gl.createBuffer();

  gl.bindBuffer(e || gl.ARRAY_BUFFER, buf);
  gl.bufferData(e || gl.ARRAY_BUFFER, new (f || Float32Array)(data), gl.STATIC_DRAW);

  return buf;
}
function computeTexturesSize(number) {
  // Taken from turbojs. Best size for textures is power of two, this is the closest size so that size * size * 4 is bigger than data size
  return 2 * Math.pow(2, Math.ceil(Math.log(number) / 1.386) - 1);
}

function redraw(gl) {
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}
function initGLFromCanvas(canvas) {
  let gl = null;
  let attr = { alpha: false, antialias: false };
  gl = canvas.getContext('webgl', attr);
  if (!gl) throw new Error('Could not start webgl');
  if (!gl.getExtension('OES_texture_float')) throw new Error('Cannot output floats');
  return gl;
}

function createGl() {
  // TODO probably remove at the end
  return initGLFromCanvas(document.createElement('canvas'));
}

function initVertexBuffer(gl) {
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Cover four cornes so that initial value is constant all over the canvas
  const vertices = [1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return vertexBuffer;
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
	return new Worker(__webpack_require__.p + "automatic-label-worker.js");
};

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_13__;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
});