module.exports = {mainIntersectionFragment}

function mainIntersectionFragment (size, numberOfRays) {
  return `void main (void) {
    commit(vec4(1., 1., 0., 0.));
  }`
}