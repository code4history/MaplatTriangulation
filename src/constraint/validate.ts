import { Point } from '../types';
import { segmentsIntersect } from '../core/geometry';
import { computeConvexHull, isHullEdge } from '../core/convexHull';
import { hasEdge } from '../core/edgeOps';

export type Edge = [number, number];

export function validateConstraints(
  points: Point[],
  required: Edge[],
  forbidden: Edge[]
) {
  // 同一エッジが双方指定
  for (const r of required) {
    for (const f of forbidden) {
      if ((r[0] === f[0] && r[1] === f[1]) || (r[0] === f[1] && r[1] === f[0]))
        throw new Error(`Edge ${r[0]}-${r[1]} is both required and forbidden`);
    }
  }
  // 必須同士交差
  for (let i = 0; i < required.length; i++) {
    for (let j = i + 1; j < required.length; j++) {
      const [a1,b1] = required[i];
      const [a2,b2] = required[j];
      if (segmentsIntersect(points[a1], points[b1], points[a2], points[b2]))
        throw new Error(`Required edges ${a1}-${b1} & ${a2}-${b2} intersect`);
    }
  }
  // 凸包上禁止
  const hull = computeConvexHull(points);
  for (const [u,v] of forbidden) {
    if (isHullEdge(hull,u,v))
      throw new Error(`Forbidden edge ${u}-${v} lies on convex hull`);
  }
}

export function checkFinalConstraints(
  tris: Uint32Array,
  required: Edge[],
  forbidden: Edge[]
) {
  for (const [u,v] of required) {
    if (!hasEdge(tris,u,v))
      throw new Error(`Required edge ${u}-${v} missing after processing`);
  }
  for (const [u,v] of forbidden) {
    if (hasEdge(tris,u,v))
      throw new Error(`Forbidden edge ${u}-${v} still present`);
  }
}