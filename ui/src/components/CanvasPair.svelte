<script lang="ts">
  import type { PointPair } from '../types';

  const { pointPairs, triangles, isTriangulationShown } = $props<{
    pointPairs: PointPair[];
    triangles: number[][];
    isTriangulationShown: boolean;
  }>();

  let canvasA: HTMLCanvasElement;
  let canvasB: HTMLCanvasElement;

  let selectedIndex = $state<number | null>(null);
  let dragging = false;
  let dragPlane: 'a' | 'b' | null = null;

  type NormalizedPoint = { x: number; y: number };

  function normalizePoints(points: NormalizedPoint[], marginRatio = 0.05) {
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

  function drawCanvas(canvas: HTMLCanvasElement, points: NormalizedPoint[], normalizedPoints: NormalizedPoint[]) {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 三角網表示
    if (isTriangulationShown) {
      ctx.strokeStyle = 'black';
      triangles.forEach(([i1, i2, i3]) => {
        ctx.beginPath();
        ctx.moveTo(normalizedPoints[i1].x * canvas.width, normalizedPoints[i1].y * canvas.height);
        ctx.lineTo(normalizedPoints[i2].x * canvas.width, normalizedPoints[i2].y * canvas.height);
        ctx.lineTo(normalizedPoints[i3].x * canvas.width, normalizedPoints[i3].y * canvas.height);
        ctx.closePath();
        ctx.stroke();
      });
    }

    // 点群表示（青色で表示、サイズ調整）
    const POINT_SIZE = 8; // サイズ調整は同じ場所
    normalizedPoints.forEach(({x, y}, idx) => {
      ctx.beginPath();
      ctx.arc(
        x * canvas.width, 
        y * canvas.height, 
        POINT_SIZE / 2, // 円の半径を指定
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = (selectedIndex === idx) ? 'red' : 'blue';
      ctx.fill();
    });
  }

  function updateCanvas() {
    const pointsA = pointPairs.map(p => p.a);
    const pointsB = pointPairs.map(p => p.b);
    const normA = normalizePoints(pointsA);
    const normB = normalizePoints(pointsB);
    drawCanvas(canvasA, pointsA, normA);
    drawCanvas(canvasB, pointsB, normB);
  }

  $effect(updateCanvas);

  function setupCanvas(canvas: HTMLCanvasElement, plane: 'a' | 'b') {
    canvas.onmousedown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / canvas.width;
      const mouseY = (e.clientY - rect.top) / canvas.height;

      const normalizedPoints = normalizePoints(pointPairs.map(p => p[plane]));
      selectedIndex = normalizedPoints.findIndex(p => Math.hypot(p.x - mouseX, p.y - mouseY) < 0.02);
      dragging = !isTriangulationShown && selectedIndex !== -1;
      dragPlane = plane;
      updateCanvas();
    };

    canvas.onmousemove = (e) => {
      if (!dragging || selectedIndex === null || dragPlane !== plane) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / canvas.width;
      const mouseY = (e.clientY - rect.top) / canvas.height;

      // 正規化座標→実座標に変換して移動
      const realPoints = pointPairs.map(p => p[plane]);
      const xs = realPoints.map(p => p.x);
      const ys = realPoints.map(p => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const width = maxX - minX, height = maxY - minY;
      const maxSize = Math.max(width, height);
      const margin = maxSize * 0.05;

      const realX = minX - (maxSize - width)/2 - margin + mouseX * (maxSize + margin*2);
      const realY = minY - (maxSize - height)/2 - margin + mouseY * (maxSize + margin*2);

      pointPairs[selectedIndex][plane] = { x: realX, y: realY };
      updateCanvas();
    };

    canvas.onmouseup = () => {
      dragging = false;
      dragPlane = null;
    };
  }

  $effect(() => {
    setupCanvas(canvasA, 'a');
    setupCanvas(canvasB, 'b');
  });
</script>

<div style="display:flex; gap:1rem;">
  <canvas bind:this={canvasA} width="400" height="400" style="border:1px solid black;"></canvas>
  <canvas bind:this={canvasB} width="400" height="400" style="border:1px solid black;"></canvas>
</div>
