module.exports = {calculateGpuResult}
// Necessary to start webgl
// https://github.com/turbo/js/blob/master/turbo.js && https://github.com/sethsamuel/sethsamuel.github.io/blob/master/talks/2016-08-25-jsconficeland/js/matrix.js
function calculateGpuResult () {
  const gl = createGl()
  const width = 500
  const height = 500
  var triangle = [
    -0.5,0.5, 0.0,
    -0.5,-0.5, 0.0,
    0.5,-0.5, 0.0
    ]
  var indices = [0, 1, 2]
  var triangleBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  var indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

  var vertCode = `
  attribute vec3 coordinates;
  void main (void) {
    gl_Position = vec4(coordinates, 1.0);
   }
  `
  var fragCode = `
  void main(void) {
    gl_FragColor = vec4(1, 0.5, 0.0, 1);
    }`
  var vertShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertShader, vertCode)

  gl.compileShader(vertShader)

  var fragShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragShader, fragCode)

  gl.compileShader(fragShader)

  var shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertShader)
  gl.attachShader(shaderProgram, fragShader)
  gl.linkProgram(shaderProgram)
  gl.useProgram(shaderProgram)

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  var coord = gl.getAttribLocation(shaderProgram, 'coordinates')
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(coord)

  gl.clearColor(0.5, 0.5, 0.5, 0.9)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.viewport(0, 0, width, height)

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

  // turbojs
  var data = new Float32Array(500 * 500 * 4)
  for (let i = 0; i < data.length; i++) data[i] = Math.random()
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.createFramebuffer())
  var texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 500, 500, 0, gl.RGBA, gl.FLOAT, data)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  var data2 = new Float32Array(500 * 500 * 4)
  var pixels = new Float32Array(width * height * 4)
  gl.readPixels(0, 0, 100, 100, gl.RGBA, gl.FLOAT, data2)
}
function draw (gl) {
  gl.viewport(0, 0, 0, gl.viewportWidth, gl.viewportHeight)
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
  return initGLFromCanvas(document.getElementById('canvas')/*document.createElement('canvas')*/)
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