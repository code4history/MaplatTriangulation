/** tri = Uint32Array[3n] を想定 */

export function hasEdge(tris: Uint32Array, u: number, v: number): boolean {
  for (let i = 0; i < tris.length; i += 3) {
    const a = tris[i], b = tris[i + 1], c = tris[i + 2];
    if (
      (a === u && b === v) || (a === v && b === u) ||
      (b === u && c === v) || (b === v && c === u) ||
      (c === u && a === v) || (c === v && a === u)
    ) return true;
  }
  return false;
}

/**
 * (u,v) が 2 つの三角形で共有されている内部辺の場合、
 * 対角線を反転して (opp1, opp2) に置き換える
 */
export function flipEdge(tris: Uint32Array, u: number, v: number): boolean {
  let off1 = -1, off2 = -1;
  for (let i = 0; i < tris.length; i += 3) {
    const a = tris[i], b = tris[i + 1], c = tris[i + 2];
    if ([a, b, c].includes(u) && [a, b, c].includes(v)) {
      if (off1 < 0) off1 = i; else { off2 = i; break; }
    }
  }
  if (off1 < 0 || off2 < 0) return false;

  const opp1 = Array.from(tris.slice(off1, off1 + 3)).find(x => x !== u && x !== v)!;
  const opp2 = Array.from(tris.slice(off2, off2 + 3)).find(x => x !== u && x !== v)!;

  tris[off1]     = opp1; tris[off1 + 1] = u;   tris[off1 + 2] = opp2;
  tris[off2]     = opp1; tris[off2 + 1] = opp2; tris[off2 + 2] = v;
  return true;
}

export function locateEdge(tris: Uint32Array, u: number, v: number): number[] {
  const adj: Map<number, number[]> = new Map();
  for (let i=0;i<tris.length;i+=3){
    const a=tris[i],b=tris[i+1],c=tris[i+2];
    [[a,b],[b,c],[c,a]].forEach(([p,q])=>{
      (adj.get(p)??adj.set(p,[]).get(p)!).push(q);
      (adj.get(q)??adj.set(q,[]).get(q)!).push(p);
    });
  }
  const queue=[u];
  const prev: Map<number,number>=new Map();
  prev.set(u,-1);
  while(queue.length){
    const cur=queue.shift()!;
    if(cur===v) break;
    for(const nxt of adj.get(cur)??[]){
      if(!prev.has(nxt)) { prev.set(nxt,cur); queue.push(nxt);} }
  }
  if(!prev.has(v)) throw new Error(`Cannot route required edge ${u}-${v}`);
  const path:number[]=[]; let cur=v;
  while(cur!==-1){ path.push(cur); cur=prev.get(cur)!; }
  return path.reverse();
}