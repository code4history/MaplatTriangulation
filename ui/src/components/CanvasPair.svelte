<script lang="ts">
  import { onMount } from 'svelte';
  import type { PointPair } from '../types';

  export let points: PointPair[] = [];
  let canvasA: HTMLCanvasElement;
  let canvasB: HTMLCanvasElement;

  let selectedIndex: number | null = null;
  let dragging = false;
  let dragCanvas: 'A' | 'B' | null = null;

  function normalizePoints(points: { x: number, y: number }[], marginRatio = 0.05) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const width = maxX - minX, height = maxY - minY;
    const maxSize = Math.max(width, height);
    const margin = maxSize * marginRatio;

    return points.map(p => ({
      x: ((p.x - minX) + (maxSize - width)/2 + margin) / (maxSize + margin*2),
      y: ((p.y - minY) + (maxSize - height)/2 + margin) / (maxSize + margin*2)
    }));
  }

  function drawPoints(canvas: HTMLCanvasElement, points: { x: number, y: number }[], selectedIdx: number | null) {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach(({ x, y }, idx) => {
      ctx.beginPath();
      ctx.arc(x * canvas.width, y * canvas.height, 5, 0, Math.PI * 2);
      ctx.fillStyle = (selectedIdx === idx) ? 'red' : 'blue';
      ctx.fill();
    });
  }

  let normA, normB;

  $: if (canvasA && canvasB && points.length) {
    normA = normalizePoints(points.map(p => p.a));
    normB = normalizePoints(points.map(p => p.b));
    drawPoints(canvasA, normA, selectedIndex);
    drawPoints(canvasB, normB, selectedIndex);
  }

  function getCanvasRelativePos(event: MouseEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / canvas.width,
      y: (event.clientY - rect.top) / canvas.height
    };
  }

  function findClosestPointIndex(normPoints, pos) {
    let minDist = Infinity, minIdx = -1;
    normPoints.forEach(({ x, y }, idx) => {
      const dist = Math.hypot(x - pos.x, y - pos.y);
      if (dist < minDist && dist < 0.03) { // 一定距離以内のみ許容
        minDist = dist;
        minIdx = idx;
      }
    });
    return minIdx !== -1 ? minIdx : null;
  }

  function handleMouseDown(event, canvasType: 'A' | 'B') {
    const canvas = canvasType === 'A' ? canvasA : canvasB;
    const normPoints = canvasType === 'A' ? normA : normB;
    const pos = getCanvasRelativePos(event, canvas);
    const idx = findClosestPointIndex(normPoints, pos);
    if (idx !== null) {
      selectedIndex = idx;
      dragging = true;
      dragCanvas = canvasType;
    }
  }

  function handleMouseMove(event) {
    if (!dragging || selectedIndex === null || !dragCanvas) return;
    const canvas = dragCanvas === 'A' ? canvasA : canvasB;
    const pos = getCanvasRelativePos(event, canvas);

    const realPoints = dragCanvas === 'A' ? points.map(p => p.a) : points.map(p => p.b);

    const xs = realPoints.map(p => p.x);
    const ys = realPoints.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const width = maxX - minX, height = maxY - minY;
    const maxSize = Math.max(width, height);
    const margin = maxSize * 0.05;

    const realX = minX - (maxSize - width)/2 - margin + pos.x * (maxSize + 2 * margin);
    const realY = minY - (maxSize - height)/2 - margin + pos.y * (maxSize + 2 * margin);

    if (dragCanvas === 'A') {
      points[selectedIndex].a.x = realX;
      points[selectedIndex].a.y = realY;
    } else {
      points[selectedIndex].b.x = realX;
      points[selectedIndex].b.y = realY;
    }
  }


  function handleMouseUp() {
    dragging = false;
    dragCanvas = null;
  }

  function handleCanvasClick(event, canvasType: 'A' | 'B') {
    const canvas = canvasType === 'A' ? canvasA : canvasB;
    const normPoints = canvasType === 'A' ? normA : normB;
    const pos = getCanvasRelativePos(event, canvas);
    const idx = findClosestPointIndex(normPoints, pos);
    if (idx === null) {
      selectedIndex = null; // 何もない場所をクリックしたら選択解除
    }
  }

  onMount(() => {
    window.addEventListener('mouseup', handleMouseUp);
  });
</script>

<div class="canvas-container">
  <canvas bind:this={canvasA} width="500" height="500"
    on:mousedown={(e) => handleMouseDown(e, 'A')}
    on:mousemove={handleMouseMove}
    on:click={(e) => handleCanvasClick(e, 'A')}></canvas>

  <canvas bind:this={canvasB} width="500" height="500"
    on:mousedown={(e) => handleMouseDown(e, 'B')}
    on:mousemove={handleMouseMove}
    on:click={(e) => handleCanvasClick(e, 'B')}></canvas>
</div>

<style>
.canvas-container {
  display: flex;
  gap: 1em;
}
canvas {
  border: 1px solid black;
  cursor: pointer;
}
</style>
