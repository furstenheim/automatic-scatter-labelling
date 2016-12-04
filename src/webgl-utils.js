module.exports = {calculateGpuResult}
// Necessary to start webgl
// https://github.com/turbo/js/blob/master/turbo.js && https://github.com/sethsamuel/sethsamuel.github.io/blob/master/talks/2016-08-25-jsconficeland/js/matrix.js
function calculateGpuResult () {
  const gl = createGl()
  const width = 500
  const height = 500
  const size = 500
  // turbojs
  function newBuffer(data, f, e) {
    var buf = gl.createBuffer()

    gl.bindBuffer((e || gl.ARRAY_BUFFER), buf)
    gl.bufferData((e || gl.ARRAY_BUFFER), new (f || Float32Array)(data), gl.STATIC_DRAW)

    return buf
  }
  // Four corners of the square
  var positionBuffer = newBuffer([ -1, -1, 1, -1, 1, 1, -1, 1 ]);
  var textureBuffer  = newBuffer([  0,  0, 1,  0, 1, 1,  0, 1 ]);
  var indexBuffer    = newBuffer([  1,  2, 0,  3, 0, 2 ], Uint16Array, gl.ELEMENT_ARRAY_BUFFER);

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
  varying vec2 pos;
  vec4 read (void) {
    return texture2D(u_texture, pos);
  }
  void commit (vec4 val) {
    gl_FragColor = val;
  }
  void main (void) {
    vec4 ipt = read();
    commit(vec4(ipt.rg, 1., 0.));
  }
  `

  var vertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertexShader, vertexShaderCode)
  gl.compileShader(vertexShader)


  var data = new Float32Array(size * size * 4)
  for (let i = 0; i < data.length; i++) data[i] = Math.random()

  var texture = createTexture(gl, data, size)

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragmentShader, fragmentShaderCode)
  gl.compileShader(fragmentShader)

  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  var uTexture = gl.getUniformLocation(program, 'u_texture')
  var aPosition = gl.getAttribLocation(program, 'position')
  var aTexture = gl.getAttribLocation(program, 'texture')

  gl.useProgram(program)
  gl.viewport(0, 0, size, size)
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.createFramebuffer())

  var nTexture = createTexture(gl, new Float32Array(size * size * 4), size)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, nTexture, 0)

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.activeTexture(gl.TEXTURE0)
  gl.uniform1i(uTexture, 0)
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