import Delaunator from 'delaunator';
import { enforceRequiredEdges } from './constraint/required';
import { removeForbiddenEdges } from './constraint/forbidden';
import { validateConstraints, checkFinalConstraints } from './constraint/validate';
import { Point } from './types';

export interface ConstraintOpts {
  requiredEdges?: [number, number][];
  forbiddenEdges?: [number, number][];
}
export interface Triangulation { triangles: Uint32Array; points: Point[]; }

export function triangulate(points: Point[], opts: ConstraintOpts = {}): Triangulation {
  validateConstraints(points, opts.requiredEdges??[], opts.forbiddenEdges??[]);
  const delaunay = Delaunator.from(points);
  let triangles = new Uint32Array(delaunay.triangles);
  if(opts.requiredEdges?.length) triangles = enforceRequiredEdges(triangles, opts.requiredEdges);
  if(opts.forbiddenEdges?.length) triangles = removeForbiddenEdges(triangles, opts.forbiddenEdges, opts.requiredEdges??[]);
  checkFinalConstraints(triangles, opts.requiredEdges??[], opts.forbiddenEdges??[]);
  return { triangles, points };
}