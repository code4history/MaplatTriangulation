<script lang="ts">
  import type { Point } from '../types';

  const props = $props<{
    points: Point[];
    triangles: number[][] | null;
    selectedIndex: number | null;
    onPointSelect: (index: number | null) => void;
    onPointMove: (detail: { index: number; point: Point }) => void;
  }>();

  let canvas: HTMLCanvasElement;
  const POINT_SIZE = 12;

  let dragging = false;
  let dragIdx: number | null = null;

  function normalizePoints(points: Point[], marginRatio = 0.05) {
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

  let normPoints: { x: number; y: number }[] = [];

  function updateCanvas() {
    normPoints = normalizePoints(props.points);
    draw();
    console.log('Canvas updated:', normPoints);
  }

  function draw() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (props.triangles) {
      ctx.strokeStyle = 'black';
      props.triangles.forEach(([i1, i2, i3]) => {
        ctx.beginPath();
        ctx.moveTo(normPoints[i1].x * canvas.width, normPoints[i1].y * canvas.height);
        ctx.lineTo(normPoints[i2].x * canvas.width, normPoints[i2].y * canvas.height);
        ctx.lineTo(normPoints[i3].x * canvas.width, normPoints[i3].y * canvas.height);
        ctx.closePath();
        ctx.stroke();
      });
    }

    normPoints.forEach(({ x, y }, idx) => {
      ctx.fillStyle = idx === props.selectedIndex ? 'red' : 'blue';
      ctx.beginPath();
      ctx.arc(x * canvas.width, y * canvas.height, POINT_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  $effect(updateCanvas);

  function getMousePosition(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / canvas.width;
    const mouseY = (e.clientY - rect.top) / canvas.height;
    return { mouseX, mouseY };
  }

  function handleMouseDown(e: MouseEvent) {
    const { mouseX, mouseY } = getMousePosition(e);
    dragIdx = normPoints.findIndex(p => Math.hypot(p.x - mouseX, p.y - mouseY) < 0.02);
    console.log('MouseDown fired. DragIdx:', dragIdx);

    if (dragIdx !== -1) {
      props.onPointSelect(dragIdx);
      console.log('Point selected:', dragIdx);
      if (!props.triangles) {
        dragging = true; // 三角網表示中は移動を許可しない
        console.log('Dragging enabled.');
      } else {
        dragging = false;
        console.log('Dragging disabled due to triangles shown.');
      }
      draw();
    } else {
      props.onPointSelect(null);
      console.log('Selection cleared');
      draw();
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragging || dragIdx === null) return;
    console.log('MouseMove fired.');

    const { mouseX, mouseY } = getMousePosition(e);

    const xs = props.points.map(p => p.x);
    const ys = props.points.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const width = maxX - minX, height = maxY - minY;
    const maxSize = Math.max(width, height);
    const margin = maxSize * 0.05;

    const realX = minX - (maxSize - width)/2 - margin + mouseX * (maxSize + margin*2);
    const realY = minY - (maxSize - height)/2 - margin + mouseY * (maxSize + margin*2);

    props.onPointMove({ index: dragIdx, point: { x: realX, y: realY } });
    console.log('Point moved:', dragIdx, realX, realY);
  }

  function handleMouseUp() {
    dragging = false;
    dragIdx = null;
    console.log('MouseUp fired. Dragging ended.');
  }
</script>

<canvas bind:this={canvas} width="400" height="400"
  style="border:1px solid black;"
  onmousedown={handleMouseDown}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}>
</canvas>
