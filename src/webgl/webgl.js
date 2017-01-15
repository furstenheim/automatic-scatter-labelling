module.exports = {setUp}

const mainFragment = require('./main-fragment').mainFragment
const utils = require('./utils')
const _ = require('lodash')


/**
 *
 * @param extendedPoints array of objects with label and position
 * @param numberOfRays number of rays per point
 * @returns {Float32Array}
 */
function setUp (extendedPoints, numberOfRays) {
  const gl = createGl()
  // For each extended point and each direction we save four data
  const size = computeTexturesSize(extendedPoints.length * numberOfRays * numberOfRays)

  // Four corners of the square
  var positionBuffer = newBuffer(gl, [ -1, -1, 1, -1, 1, 1, -1, 1 ]);
  var textureBuffer  = newBuffer(gl, [  0,  0, 1,  0, 1, 1,  0, 1 ]);
  var indexBuffer    = newBuffer(gl, [  1,  2, 0,  3, 0, 2 ], Uint16Array, gl.ELEMENT_ARRAY_BUFFER);

  const {vertexShader, transformFragmentShader} = getShaders(gl, size, numberOfRays)

  const pointsData = new Float32Array(size * size * 4)
  for (let i = 0; i < extendedPoints.length; i++) {
    const point = extendedPoints[i]
    for (let j = 0; j < numberOfRays; j++) {
      for (let k = 0; k < numberOfRays; k++) {
        const index = numberOfRays * numberOfRays * i * 4 + j * 4 * numberOfRays + k * 4
        pointsData[index] = point.position.x
        pointsData[index + 1] = point.position.y
        pointsData[index + 2] = point.label.height
        pointsData[index + 3] = point.label.width
      }
    }
  }
  var pointsTexture = createTexture(gl, pointsData, size)

  const radiusData = new Float32Array(size * size * 4)
  utils.computeRays(radiusData, extendedPoints.length, numberOfRays)
  // We will fill with sin and cos later in the setup
  var radiusTexture = createTexture(gl, radiusData, size)

  const rectangleData = new Float32Array(size * size * 4)
  const rectangleTexture = createTexture(gl, rectangleData, size)

  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, transformFragmentShader)
  gl.linkProgram(program)

  const uPointsTexture = gl.getUniformLocation(program, 'u_points_texture')
  const uRadiusTexture = gl.getUniformLocation(program, 'u_radius_texture')
  const uLabelTexture = gl.getUniformLocation(program, 'u_label_texture')
  const uRectangleTexture = gl.getUniformLocation(program, 'u_rectangle_texture')
  const uRectanglePoint = gl.getUniformLocation(program, 'u_rect_point')
  const aPosition = gl.getAttribLocation(program, 'position')
  const aTexture = gl.getAttribLocation(program, 'texture')

  gl.useProgram(program)
  gl.viewport(0, 0, size, size)
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.createFramebuffer())

  var nTexture = createTexture(gl, new Float32Array(size * size * 4), size)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, nTexture, 0)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, pointsTexture)
  gl.uniform1i(uPointsTexture, 0)

  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, radiusTexture)
  gl.uniform1i(uRadiusTexture, 1)

  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, rectangleTexture)
  gl.uniform1i(uRectangleTexture, 2)

  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer)

  gl.enableVertexAttribArray(aTexture)
  gl.vertexAttribPointer(aTexture, 2, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  gl.enableVertexAttribArray(aPosition)
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

  const intersectionData = new Float32Array(size * size * 4)
  var labelData = new Float32Array(4)
  var rectanglePoint = new Float32Array(4)

  gl.bindTexture(gl.TEXTURE_2D, rectangleTexture)
  return {
    radiusData,
    intersectionData,
    computeIntersection,
    rectangleData
  }
  // TODO change program


  // Rectangle, then pi
  function computeIntersection (rectangleData, pix, piy, intersectionData) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, rectangleData)
    //gl.uniform4fv(uLabelTexture, labelData)
    rectanglePoint[0] = pix
    rectanglePoint[1] = piy
    gl.uniform4fv(uRectanglePoint,  rectanglePoint)
    redraw(gl)
    gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, intersectionData)
    return {intersectionData, rectangleData}
  }
}

function createTexture (gl, data, size) {
  var texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, data)
  gl.bindTexture(gl.TEXTURE_2D, null)
  return texture
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
  `
  // Compute sin and cos for radius shader
  var transformFragmentShaderCode = mainFragment(size, numberOfRays)
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  const transformFragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(vertexShader, vertexShaderCode)
  gl.shaderSource(transformFragmentShader, transformFragmentShaderCode)

  gl.compileShader(vertexShader)
  gl.compileShader(transformFragmentShader)
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(vertexShader))
  if (!gl.getShaderParameter(transformFragmentShader, gl.COMPILE_STATUS)) console.error(transformFragmentShaderCode, gl.getShaderInfoLog(transformFragmentShader))

  return {
    vertexShader,
    transformFragmentShader,
  }
}
function newBuffer(gl, data, f, e) {
  var buf = gl.createBuffer()

  gl.bindBuffer((e || gl.ARRAY_BUFFER), buf)
  gl.bufferData((e || gl.ARRAY_BUFFER), new (f || Float32Array)(data), gl.STATIC_DRAW)

  return buf
}
function computeTexturesSize (number) {
  // Taken from turbojs. Best size for textures is power of two, this is the closest size so that size * size * 4 is bigger than data size
  return 2 * Math.pow(2, Math.ceil(Math.log(number) / 1.386) - 1)
}

function redraw (gl) {
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
}
function initGLFromCanvas (canvas) {
  let gl = null
  let attr = {alpha: false, antialias: false}
  gl = canvas.getContext('webgl', attr)
  if (!gl) throw new Error('Could not start webgl')
  if (!gl.getExtension('OES_texture_float')) throw new Error('Cannot output floats')
  return gl
}

function createGl () {
  // TODO probably remove at the end
  return initGLFromCanvas(document.createElement('canvas'))
}

function initVertexBuffer (gl) {
  let vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  // Cover four cornes so that initial value is constant all over the canvas
  const vertices = [
    1, 1, 0,
    -1, 1, 0,
    1, -1, 0,
    -1, -1, 0
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  return vertexBuffer
}