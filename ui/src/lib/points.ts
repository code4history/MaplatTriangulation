export type PointTuple = [number, number];
export interface PointObj { x: number; y: number; }

export function toTuple(p: PointObj): PointTuple {
  return [p.x, p.y];
}
export function toObj(p: PointTuple): PointObj {
  return { x: p[0], y: p[1] };
}