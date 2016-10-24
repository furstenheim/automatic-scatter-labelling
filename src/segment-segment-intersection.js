module.exports = {segmentSegmentIntersection}
// A point pi moves with vi, a segment is defined with pj, vj, we find the time t at which the point intersects and returns parameters s on the segment
function segmentSegmentIntersection (pi, vi, pj, vj /*Vector of the segment */) {
  // (vi -vj)(t, s)^T = (pj - pi)
  var det = - (vi.x* vj.y - vj.x * vi.y)
  if (det === 0) { // Parallel lines
    // Test this
    if ((pi.x - pj.x) * vj.y - (pi.j - pj.y) * vj.x !==0) return null // Line does not belong
    // TODO concurrent lines
    throw new Error('Parallel lines not allowed') // This must be handled out of the algorithm
  }
  t = (-(pj.x - pi.x) * vj.y + (pj.y - pi.y) * vj.x) / det
  s = (-(pj.x - pi.x) * vi.y + (pj.y - pi.y) * vi.x) / det
  return {t, s}
}