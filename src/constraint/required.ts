import { hasEdge, flipEdge, locateEdge } from '../core/edgeOps';

/**
 * 必須エッジ群を挿入し Constrained Delaunay を概ね維持する
 */
export function enforceRequiredEdges(tris: Uint32Array, required: [number, number][]): Uint32Array {
  const out = new Uint32Array(tris);
  for (const [u, v] of required) {
    if (hasEdge(out, u, v)) continue;
    // BFS で u-v を結ぶ多角形鎖を探し順にフリップ
    const chain = locateEdge(out, u, v);
    for (let i = 0; i < chain.length - 1; i++) {
      flipEdge(out, chain[i], chain[i + 1]);
    }
  }
  return out;
}