import { triangulate } from '../src/triangulation';
import { describe, it, expect } from 'vitest';

it('throws on crossing required edges',()=>{
  const pts=[[0,0],[2,0],[2,2],[0,2]] as [number,number][];
  expect(()=>triangulate(pts,{requiredEdges:[[0,2],[1,3]]})).toThrow();
});

it('throws on forbidden hull edge',()=>{
  const pts=[[0,0],[1,0],[1,1],[0,1]] as [number,number][];
  expect(()=>triangulate(pts,{forbiddenEdges:[[0,1]]})).toThrow();
});

it('throws on edge both required and forbidden',()=>{
  const pts=[[0,0],[1,0],[1,1]] as [number,number][];
  expect(()=>triangulate(pts,{requiredEdges:[[0,1]],forbiddenEdges:[[1,0]]})).toThrow();
});