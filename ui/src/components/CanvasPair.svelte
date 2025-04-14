<script lang="ts">
  import Canvas from './Canvas.svelte';
  import OLCanvas from './OLCanvas.svelte';
  import PointDataEditor from './PointDataEditor.svelte';
  import ControlForm from './ControlForm.svelte';
  import { generatePoints } from '../utils/pointUtils';
  import { generateTriangulation } from '../../../src/triangulation';

  let pointPairs = $state(generatePoints(500));
  let triangles = $state<number[][] | null>(null);
  let selectedIndex = $state<number | null>(null);
  let isTriangulationShown = $state(false);

  // 点群再生成
  const handleGenerate = (detail: { pointCount: number }) => {
    pointPairs = generatePoints(detail.pointCount);
    triangles = null;
    isTriangulationShown = false;
  };

  // JSONからのデータ更新
  const handleJsonChange = (detail: string) => {
    try {
      const parsed = JSON.parse(detail);

      if (parsed.pointsA && parsed.pointsB) {
        // JSONがpointsAとpointsBを持つ形式の場合
        pointPairs = parsed.pointsA.map((pointA, index) => ({
          a: pointA,
          b: parsed.pointsB[index]
        }));
      } else if (Array.isArray(parsed)) {
        // 単純な配列の場合（従来のpointPairs形式）
        pointPairs = parsed;
      } else {
        throw new Error('Invalid JSON structure');
      }

      triangles = (parsed.triangles && parsed.triangles.length > 0) ? parsed.triangles : null;
      isTriangulationShown = triangles !== null; 

    } catch (e) {
      console.error('JSON parse error:', e);
      alert('JSONの形式が不正です。コンソールを確認してください。');
    }
  };

  // 点選択処理
  const handlePointSelect = (detail: number | null) => {
    selectedIndex = detail;
  };

  // 点移動処理
  const handlePointMove = (detail: { index: number; point: { x: number; y: number } }, plane: 'a' | 'b') => {
    pointPairs[detail.index][plane] = detail.point;
    pointPairs = [...pointPairs];
  };

  // 三角網トグル
  const toggleTriangulation = () => {
    if (!isTriangulationShown) {
      const result = generateTriangulation(
        pointPairs.map(p => p.a),
        pointPairs.map(p => p.b)
      );
      triangles = result.triangles;
      isTriangulationShown = true;
    } else {
      triangles = null;
      isTriangulationShown = false;
    }
  };
</script>

<div style="display: flex; flex-direction: column; gap: 1rem;">
  <ControlForm generate={handleGenerate} initialCount={500} />

  <button onclick={toggleTriangulation}>
    三角網を {isTriangulationShown ? '非表示にする' : '表示する'}
  </button>

  <div style="display: flex; gap: 1rem;">
    <Canvas
      points={pointPairs.map(p => p.a)}
      triangles={triangles}
      selectedIndex={selectedIndex}
      pointselect={handlePointSelect}
      pointmove={(detail) => handlePointMove(detail, 'a')}
    />
    <Canvas
      points={pointPairs.map(p => p.b)}
      triangles={triangles}
      selectedIndex={selectedIndex}
      pointselect={handlePointSelect}
      pointmove={(detail) => handlePointMove(detail, 'b')}
    />
  </div>

  <div style="display: flex; gap: 1rem;">
    <OLCanvas
      points={pointPairs.map(p => p.a)}
      triangles={triangles}
      selectedIndex={selectedIndex}
      mapId="mapA"
    />
    <OLCanvas
      points={pointPairs.map(p => p.b)}
      triangles={triangles}
      selectedIndex={selectedIndex}
      mapId="mapB"
    />
  </div>

  <PointDataEditor
    jsonText={JSON.stringify({
      pointsA: pointPairs.map(p => p.a),
      pointsB: pointPairs.map(p => p.b),
      triangles: triangles || []
    }, null, 2)}
    jsonchange={handleJsonChange}
  />
</div>
