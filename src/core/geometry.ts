/**
 * 2 本の線分 (a1‑b1, a2‑b2) が交差するか
 */
export function segmentsIntersect(
  a1: [number, number], b1: [number, number],
  a2: [number, number], b2: [number, number]
): boolean {
  const orient = (p: [number, number], q: [number, number], r: [number, number]) =>
    (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);

  const o1 = orient(a1, b1, a2);
  const o2 = orient(a1, b1, b2);
  const o3 = orient(a2, b2, a1);
  const o4 = orient(a2, b2, b1);

  if (o1 === 0 && onSeg(a1, a2, b1)) return true;
  if (o2 === 0 && onSeg(a1, b2, b1)) return true;
  if (o3 === 0 && onSeg(a2, a1, b2)) return true;
  if (o4 === 0 && onSeg(a2, b1, b2)) return true;

  return (o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0);
}

function onSeg(p: [number, number], q: [number, number], r: [number, number]): boolean {
  return (
    Math.min(p[0], r[0]) <= q[0] && q[0] <= Math.max(p[0], r[0]) &&
    Math.min(p[1], r[1]) <= q[1] && q[1] <= Math.max(p[1], r[1])
  );
}
