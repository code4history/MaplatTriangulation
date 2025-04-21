import { hasEdge, flipEdge } from '../core/edgeOps';

export function removeForbiddenEdges(tris: Uint32Array, forbidden: [number, number][], required: [number, number][]): Uint32Array {
  const out = new Uint32Array(tris);
  for (const [u, v] of forbidden) {
    if (!hasEdge(out, u, v)) continue; // 既に無い
    // 内部辺であることを確認しフリップして別対角に置き換える
    if (!flipEdge(out, u, v)) {
      throw new Error(`Cannot remove forbidden edge ${u}-${v}`);
    }
    // フリップ後に必須エッジが壊れたら失敗扱い
    for (const [ru, rv] of required) {
      if (!hasEdge(out, ru, rv)) throw new Error(`Required edge ${ru}-${rv} lost during forbidden removal`);
    }
  }
  return out;
}