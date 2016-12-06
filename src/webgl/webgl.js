module.exports = {calculateGpuResult, setUp}

const setUpFragment = require('./set-up-fragment')
const mainFragment = require('./main-fragment').mainFragment
// Necessary to start webgl
// https://github.com/turbo/js/blob/master/turbo.js && https://github.com/sethsamuel/sethsamuel.github.io/blob/master/talks/2016-08-25-jsconficeland/js/matrix.js
function calculateGpuResult () {
  const gl = createGl()
  const width = 500
  const height = 500
  const size = 500
  // Four corners of the square
  var positionBuffer = newBuffer(gl, [ -1, -1, 1, -1, 1, 1, -1, 1 ]);
  var textureBuffer  = newBuffer(gl, [  0,  0, 1,  0, 1, 1,  0, 1 ]);
  var indexBuffer    = newBuffer(gl, [  1,  2, 0,  3, 0, 2 ], Uint16Array, gl.ELEMENT_ARRAY_BUFFER);

  var vertexShaderCode = `
  attribute vec2 position;
  varying vec2 pos;
  attribute vec2 texture;

  void main (void) {
    pos = texture;
    gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `
  var fragmentShaderCode = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform sampler2D u_texture2;
  uniform sampler2D u_label_texture;
  varying vec2 pos;
  vec4 read (void) {
    return texture2D(u_texture, pos);
  }
  vec4 read2 (void) {
    return texture2D(u_texture2, pos);
  }
  vec4 get_label (void) {
    return texture2D(u_label_texture, vec2(float(0) / ${size}.0, 0.));
  }
  void commit (vec4 val) {
    gl_FragColor = val;
  }
  void main (void) {
    vec4 ipt = read();
    vec4 ipt2 = read2();
    vec4 label = get_label();
    commit(vec4(ipt.rg / 0.000001, label.r * ipt.b, label.g));
  }
  `

  var vertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertexShader, vertexShaderCode)
  gl.compileShader(vertexShader)


  var data = new Float32Array(size * size * 4)
  for (let i = 0; i < data.length; i++) data[i] = Math.random()
  var texture = createTexture(gl, data, size)

  var data3 = new Float32Array(size * size * 4)
  for (let i = 0; i < data3.length; i++) data3[i] = Math.random()
  var texture3 = createTexture(gl, data3, size)

  var label = new Float32Array(size * size * 4)
  for (let i = 0; i < 16; i++) label[i] = Math.random()
  var labelTexture = createTexture(gl, label, size)

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragmentShader, fragmentShaderCode)
  gl.compileShader(fragmentShader)

  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  var uTexture = gl.getUniformLocation(program, 'u_texture')
  var uTexture3 = gl.getUniformLocation(program, 'u_texture2')
  var uLabelTexture = gl.getUniformLocation(program, 'u_label_texture')
  var aPosition = gl.getAttribLocation(program, 'position')
  var aTexture = gl.getAttribLocation(program, 'texture')

  gl.useProgram(program)
  gl.viewport(0, 0, size, size)
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.createFramebuffer())

  var nTexture = createTexture(gl, new Float32Array(size * size * 4), size)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, nTexture, 0)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.uniform1i(uTexture, 0)

  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, texture3)
  gl.uniform1i(uTexture3, 1)

  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, labelTexture)
  gl.uniform1i(uLabelTexture, 2)

  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer)

  gl.enableVertexAttribArray(aTexture)
  gl.vertexAttribPointer(aTexture, 2, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  gl.enableVertexAttribArray(aPosition)
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  var data2 = new Float32Array(size * size * 4)
  gl.readPixels(0, 0, 100, 100, gl.RGBA, gl.FLOAT, data2)
}
/**
 *
 * @param extendedPoints array of objects with label and position
 * @param numberOfRays number of rays per point
 * @returns {Float32Array}
 */
function setUp (extendedPoints, numberOfRays) {
  const gl = createGl()
  // For each extended point and each direction we save four data
  const size = computeTexturesSize(extendedPoints.length * numberOfRays)

  // Four corners of the square
  var positionBuffer = newBuffer(gl, [ -1, -1, 1, -1, 1, 1, -1, 1 ]);
  var textureBuffer  = newBuffer(gl, [  0,  0, 1,  0, 1, 1,  0, 1 ]);
  var indexBuffer    = newBuffer(gl, [  1,  2, 0,  3, 0, 2 ], Uint16Array, gl.ELEMENT_ARRAY_BUFFER);

  const {vertexShader, setUpFragmentShader, transformFragmentShader} = getShaders(gl, size, numberOfRays)

  const pointsData = new Float32Array(size * size * 4)
  for (let i = 0; i < extendedPoints.length; i++) {
    const point = extendedPoints[i]
    for (let j = 0; j < numberOfRays; j++) {
      const index = numberOfRays * i * 4 + j * 4
      pointsData[index] = point.position.x
      pointsData[index + 1] = point.position.y
      pointsData[index + 2] = point.label.width
      pointsData[index + 3] = point.label.height
    }
  }
  var pointsTexture = createTexture(gl, pointsData, size)

  const radiusData = new Float32Array(size * size * 4)
  // We will fill with sin and cos later in the setup
  var radiusTexture = createTexture(gl, radiusData, size)

  var labelData = new Float32Array(size * size * 4)
  var labelTexture = createTexture(gl, labelData, size)

  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, setUpFragmentShader)
  gl.linkProgram(program)

  var uPointsTexture = gl.getUniformLocation(program, 'u_points_texture')
  var uRadiusTexture = gl.getUniformLocation(program, 'u_radius_texture')
  var uLabelTexture = gl.getUniformLocation(program, 'u_label_texture')
  var aPosition = gl.getAttribLocation(program, 'position')
  var aTexture = gl.getAttribLocation(program, 'texture')

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
  gl.bindTexture(gl.TEXTURE_2D, labelTexture)
  gl.uniform1i(uLabelTexture, 2)

  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer)

  gl.enableVertexAttribArray(aTexture)
  gl.vertexAttribPointer(aTexture, 2, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  gl.enableVertexAttribArray(aPosition)
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  redraw(gl)
  gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, radiusData)

  const intersectionData = new Float32Array(size * size * 4)

  return {
    radiusData,
    intersectionData,
    labelData,
    computeLabel
  }
  // TODO change program

  function computeLabel () {
    redraw(gl)
    gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, intersectionData)
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
  var setUpFragmentShaderCode = setUpFragment.setUpFragment(size, numberOfRays)
  var transformFragmentShaderCode = mainFragment(size, numberOfRays)
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  const setUpFragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  const transformFragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(vertexShader, vertexShaderCode)
  gl.shaderSource(setUpFragmentShader, setUpFragmentShaderCode)
  gl.shaderSource(transformFragmentShader, transformFragmentShaderCode)

  gl.compileShader(vertexShader)
  gl.compileShader(setUpFragmentShader)
  gl.compileShader(transformFragmentShader)
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(vertexShader))
  if (!gl.getShaderParameter(setUpFragmentShader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(setUpFragmentShader))
  if (!gl.getShaderParameter(transformFragmentShader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(transformFragmentShader))

  return {
    vertexShader,
    setUpFragmentShader,
    transformFragmentShader
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