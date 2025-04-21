import { Point } from '../types';
import { segmentsIntersect } from '../core/geometry';

export type Edge = [number, number];

/* helper: unique edge list */
function enumerateEdges(tris: Uint32Array): Edge[] {
  const set = new Set<string>();
  const out: Edge[] = [];
  for (let i = 0; i < tris.length; i += 3) {
    const a = tris[i], b = tris[i + 1], c = tris[i + 2];
    [[a, b], [b, c], [c, a]].forEach(([u, v]) => {
      const k = u < v ? `${u}-${v}` : `${v}-${u}`;
      if (!set.has(k)) { set.add(k); out.push([u, v]); }
    });
  }
  return out;
}

/** 1. edge intersections (returns both edges involved) */
export function detectEdgeIntersections(tris: Uint32Array, pts: Point[]): Edge[] {
  const edges = enumerateEdges(tris);
  const bad: Edge[] = [];
  for (let i = 0; i < edges.length; i++) {
    const [u1, v1] = edges[i];
    const p1 = pts[u1], p2 = pts[v1];
    for (let j = i + 1; j < edges.length; j++) {
      const [u2, v2] = edges[j];
      if (u1 === u2 || u1 === v2 || v1 === u2 || v1 === v2) continue;
      const q1 = pts[u2], q2 = pts[v2];
      if (segmentsIntersect(p1, p2, q1, q2)) {
        bad.push([u1, v1], [u2, v2]);
      }
    }
  }
  return bad;
}

/* area sign */
function orient(p: Point, q: Point, r: Point) {
  return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
}

/** 2. flipped triangles – sign differs between planes */
export function detectFlippedTrianglesSmart(
  tris: Uint32Array,
  ptsA: Point[],
  ptsB: Point[]
): number[] {
  const flipped: number[] = [];
  for (let i = 0, t = 0; i < tris.length; i += 3, t++) {
    const a = tris[i], b = tris[i + 1], c = tris[i + 2];
    const sA = Math.sign(orient(ptsA[a], ptsA[b], ptsA[c]));
    const sB = Math.sign(orient(ptsB[a], ptsB[b], ptsB[c]));
    if (sA !== 0 && sB !== 0 && sA !== sB) flipped.push(t);
  }
  return flipped;
}

/* point on segment */
function onSeg(p: Point, q: Point, r: Point): boolean {
  const eps = 1e-9;
  return Math.abs(orient(p, q, r)) < eps &&
    Math.min(p[0], r[0]) - eps <= q[0] && q[0] <= Math.max(p[0], r[0]) + eps &&
    Math.min(p[1], r[1]) - eps <= q[1] && q[1] <= Math.max(p[1], r[1]) + eps;
}

/** 3. T‑junctions – return [edge, pointIndex] list */
export function detectTJunctions(tris: Uint32Array, pts: Point[]): [Edge, number][] {
  const edges = enumerateEdges(tris);
  const bad: [Edge, number][] = [];
  const n = pts.length;
  for (const [u, v] of edges) {
    const p = pts[u], q = pts[v];
    for (let w = 0; w < n; w++) {
      if (w === u || w === v) continue;
      if (onSeg(p, pts[w], q)) bad.push([[u, v], w]);
    }
  }
  return bad;
}