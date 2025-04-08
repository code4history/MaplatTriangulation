import { generateTriangulation, Point, TriangulationResult } from './triangulation';
import { detectTopologyErrors } from './topology';

// キャンバス要素の取得
const canvasA = document.getElementById('canvasA') as HTMLCanvasElement;
const canvasB = document.getElementById('canvasB') as HTMLCanvasElement;
const ctxA = canvasA.getContext('2d')!;
const ctxB = canvasB.getContext('2d')!;

// 3. Canvasのサイズを表示サイズに揃える関数
function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

// 4. サイズ調整して可視化を更新する関数
function resizeCanvasesAndUpdate() {
  resizeCanvas(canvasA);
  resizeCanvas(canvasB);
  updateVisualization();
}

// 5. Canvasを初期化するために明示的に一度実行
resizeCanvasesAndUpdate();

// 6. ウィンドウサイズ変更時にも再実行
window.addEventListener('resize', resizeCanvasesAndUpdate);

// Canvasの内部サイズと表示サイズをログ出力
console.log('CanvasA:', canvasA.width, canvasA.height, canvasA.clientWidth, canvasA.clientHeight);
console.log('CanvasB:', canvasB.width, canvasB.height, canvasB.clientWidth, canvasB.clientHeight);

// コントロール要素
const pointCountInput = document.getElementById('pointCount') as HTMLInputElement;
const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
const showTriangulationCheckbox = document.getElementById('showTriangulation') as HTMLInputElement;
const showErrorsCheckbox = document.getElementById('showErrors') as HTMLInputElement;
const jsonOutput = document.getElementById('jsonOutput') as HTMLTextAreaElement;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const loadBtn = document.getElementById('loadBtn') as HTMLButtonElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;

// アフィン変換パラメータ
const scaleXInput = document.getElementById('scaleX') as HTMLInputElement;
const scaleYInput = document.getElementById('scaleY') as HTMLInputElement;
const shearXInput = document.getElementById('shearX') as HTMLInputElement;
const rotateInput = document.getElementById('rotate') as HTMLInputElement;
const translateXInput = document.getElementById('translateX') as HTMLInputElement;
const translateYInput = document.getElementById('translateY') as HTMLInputElement;
const flipYInput = document.getElementById('flipY') as HTMLInputElement;
const noiseLevelInput = document.getElementById('noiseLevel') as HTMLInputElement;
const noiseLevelValue = document.getElementById('noiseLevelValue') as HTMLSpanElement;
const applyTransformBtn = document.getElementById('applyTransformBtn') as HTMLButtonElement;

// 状態変数
let pointsA: Point[] = [];
let pointsB: Point[] = [];
let triangulationResult: TriangulationResult | null = null;
let topologyErrors: [number, number][] = [];
let selectedPointIndex: number = -1;
let isDragging: boolean = false;

// 座標変換用の変数
let aToCanvasScale = 1;
let bToCanvasScale = 1;
let bMinX = 0;
let bMinY = 0;
let bMaxX = 0;
let bMaxY = 0;

// 描画スタイル
const styles = {
  point: {
    radius: 5,
    fillColor: '#3498db',
    strokeColor: '#2980b9',
    selectedFillColor: '#e74c3c',
    selectedStrokeColor: '#c0392b'
  },
  edge: {
    color: '#2c3e50',
    width: 1
  },
  errorPoint: {
    radius: 7,
    fillColor: '#e74c3c',
    strokeColor: '#c0392b'
  }
};

// 初期化
window.addEventListener('load', () => {
  resizeCanvases();
  generateRandomPoints();
  
  // イベントリスナー設定
  generateBtn.addEventListener('click', generateRandomPoints);
  showTriangulationCheckbox.addEventListener('change', updateVisualization);
  showErrorsCheckbox.addEventListener('change', updateVisualization);
  jsonOutput.addEventListener('input', handleJsonInput);
  copyBtn.addEventListener('click', copyJsonToClipboard);
  saveBtn.addEventListener('click', saveDataToFile);
  loadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', loadDataFromFile);
  applyTransformBtn.addEventListener('click', applyTransformation);
  noiseLevelInput.addEventListener('input', () => {
    noiseLevelValue.textContent = noiseLevelInput.value;
  });
  
  // キャンバスイベント
  canvasA.addEventListener('mousedown', (e) => handleCanvasMouseDown(e, 'A'));
  canvasB.addEventListener('mousedown', (e) => handleCanvasMouseDown(e, 'B'));
  canvasA.addEventListener('mousemove', (e) => handleCanvasMouseMove(e, 'A'));
  canvasB.addEventListener('mousemove', (e) => handleCanvasMouseMove(e, 'B'));
  window.addEventListener('mouseup', handleCanvasMouseUp);
  
  window.addEventListener('resize', resizeCanvases);
});

// キャンバスのリサイズ
function resizeCanvases() {
  const dpr = window.devicePixelRatio || 1;
  
  [canvasA, canvasB].forEach(canvas => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.width * dpr; // 正方形にする
    
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
  });
  
  updateVisualization();
}

// ランダムな点の生成
function generateRandomPoints() {
  const count = parseInt(pointCountInput.value);
  
  // 点群Aの生成（0〜10000の範囲）
  pointsA = [];
  for (let i = 0; i < count; i++) {
    pointsA.push({
      x: Math.random() * 10000,
      y: Math.random() * 10000
    });
  }
  
  applyTransformation();
}

// アフィン変換の適用
function applyTransformation() {
  const scaleX = parseFloat(scaleXInput.value);
  const scaleY = parseFloat(scaleYInput.value);
  const shearX = parseFloat(shearXInput.value);
  const rotate = parseFloat(rotateInput.value) * Math.PI / 180; // 度からラジアンへ変換
  const translateX = parseFloat(translateXInput.value);
  const translateY = parseFloat(translateYInput.value);
  const flipY = flipYInput.checked ? -1 : 1;
  const noiseLevel = parseInt(noiseLevelInput.value);
  
  // 点群Bの生成（アフィン変換 + ノイズ）
  pointsB = pointsA.map(p => {
    // アフィン変換
    let x = p.x * scaleX + p.y * shearX;
    let y = p.y * scaleY * flipY;
    
    // 回転
    const rotatedX = x * Math.cos(rotate) - y * Math.sin(rotate);
    const rotatedY = x * Math.sin(rotate) + y * Math.cos(rotate);
    
    // 平行移動
    x = rotatedX + translateX;
    y = rotatedY + translateY;
    
    // ガウスノイズの追加
    if (noiseLevel > 0) {
      const noise = noiseLevel / 5; // ノイズスケール調整
      x += gaussianNoise(0, noise);
      y += gaussianNoise(0, noise);
    }
    
    return { x, y };
  });
  
  updateVisualization();
  updateJsonOutput();
}

// ガウス分布に従ったランダムな揺らぎを生成
function gaussianNoise(mean = 0, stdDev = 1): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean;
}

// 可視化の更新
function updateVisualization() {
  // キャンバスクリア
  clearCanvases();
  
  // データが無ければスキップ
  if (pointsB.length === 0) {
    console.warn('描画データが無いため可視化をスキップ');
    return;
  }

  // 座標変換用のスケールを計算
  calculateScales();
  
  // 三角網の表示/非表示
  if (showTriangulationCheckbox.checked) {
    triangulationResult = generateTriangulation(pointsA, pointsB);
    topologyErrors = detectTopologyErrors(triangulationResult);
    
    // 三角網の描画
    drawTriangulation(triangulationResult);
    
    // エラーの描画
    if (showErrorsCheckbox.checked && topologyErrors.length > 0) {
      drawTopologyErrors(topologyErrors, triangulationResult);
    }
  }
  
  // 点群の描画
  drawPoints();
}

// キャンバスのクリア
function clearCanvases() {
  ctxA.clearRect(0, 0, canvasA.width, canvasA.height);
  ctxB.clearRect(0, 0, canvasB.width, canvasB.height);
}

// デバッグのための修正版calculateScales（ログ出力付き）
function calculateScales() {
  console.log('calculateScales 開始');

  // 平面Aのスケール
  aToCanvasScale = canvasA.width / 10000;
  console.log(`aToCanvasScale: ${aToCanvasScale}`);

  // pointsBが空の場合は処理をスキップ
  if (pointsB.length === 0) {
    console.warn('pointsBが空なのでスケール計算をスキップします。');
    return;
  }

  // 平面Bの範囲計算
  bMinX = Math.min(...pointsB.map(p => p.x));
  bMinY = Math.min(...pointsB.map(p => p.y));
  bMaxX = Math.max(...pointsB.map(p => p.x));
  bMaxY = Math.max(...pointsB.map(p => p.y));
  console.log(`計算直後のB範囲: bMinX=${bMinX}, bMinY=${bMinY}, bMaxX=${bMaxX}, bMaxY=${bMaxY}`);

  // 余白を追加（5%）
  const bRangeX = bMaxX - bMinX;
  const bRangeY = bMaxY - bMinY;
  bMinX -= bRangeX * 0.05;
  bMinY -= bRangeY * 0.05;
  bMaxX += bRangeX * 0.05;
  bMaxY += bRangeY * 0.05;
  console.log(`余白追加後のB範囲: bMinX=${bMinX}, bMinY=${bMinY}, bMaxX=${bMaxX}, bMaxY=${bMaxY}`);

  // 正方形調整
  const bRange = Math.max(bMaxX - bMinX, bMaxY - bMinY);
  bToCanvasScale = canvasB.width / bRange;
  console.log(`bToCanvasScale: ${bToCanvasScale}, bRange=${bRange}`);

  console.log('calculateScales 完了');
}

// 点群の描画
function drawPoints() {
  for (let i = 0; i < pointsA.length; i++) {
    const isSelected = i === selectedPointIndex;
    
    // 平面Aの点
    drawPoint(
      ctxA, 
      pointsA[i].x * aToCanvasScale, 
      pointsA[i].y * aToCanvasScale, 
      isSelected
    );
    
    // 平面Bの点
    drawPoint(
      ctxB, 
      (pointsB[i].x - bMinX) * bToCanvasScale, 
      (pointsB[i].y - bMinY) * bToCanvasScale, 
      isSelected
    );
  }
}

// 点の描画
function drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number, isSelected: boolean) {
  ctx.beginPath();
  ctx.arc(x, y, styles.point.radius, 0, Math.PI * 2);
  
  if (isSelected) {
    ctx.fillStyle = styles.point.selectedFillColor;
    ctx.strokeStyle = styles.point.selectedStrokeColor;
  } else {
    ctx.fillStyle = styles.point.fillColor;
    ctx.strokeStyle = styles.point.strokeColor;
  }
  
  ctx.fill();
  ctx.stroke();
}

// 三角網の描画
function drawTriangulation(result: TriangulationResult) {
  ctxA.strokeStyle = styles.edge.color;
  ctxA.lineWidth = styles.edge.width;
  ctxB.strokeStyle = styles.edge.color;
  ctxB.lineWidth = styles.edge.width;
  
  // 各三角形の辺を描画
  for (const triangle of result.triangles) {
    for (let i = 0; i < 3; i++) {
      const startIndex = triangle[i];
      const endIndex = triangle[(i + 1) % 3];
      
      // 平面Aの辺
      ctxA.beginPath();
      ctxA.moveTo(
        pointsA[startIndex].x * aToCanvasScale, 
        pointsA[startIndex].y * aToCanvasScale
      );
      ctxA.lineTo(
        pointsA[endIndex].x * aToCanvasScale, 
        pointsA[endIndex].y * aToCanvasScale
      );
      ctxA.stroke();
      
      // 平面Bの辺
      ctxB.beginPath();
      ctxB.moveTo(
        (pointsB[startIndex].x - bMinX) * bToCanvasScale, 
        (pointsB[startIndex].y - bMinY) * bToCanvasScale
      );
      ctxB.lineTo(
        (pointsB[endIndex].x - bMinX) * bToCanvasScale, 
        (pointsB[endIndex].y - bMinY) * bToCanvasScale
      );
      ctxB.stroke();
    }
  }
}

// トポロジーエラーの描画
function drawTopologyErrors(errors: [number, number][], result: TriangulationResult) {
  // 交差点を計算して描画（平面Bのみ）
  for (const [edge1, edge2] of errors) {
    // 辺のインデックスから対応する三角形を取得
    const triangles = result.triangles;
    const edges: [number, number][] = [];
    
    // 各三角形から辺を取得
    for (const tri of triangles) {
      edges.push([tri[0], tri[1]]);
      edges.push([tri[1], tri[2]]);
      edges.push([tri[2], tri[0]]);
    }
    
    const [start1, end1] = edges[edge1];
    const [start2, end2] = edges[edge2];
    
    // 交差点の計算
    const intersection = calculateIntersection(
      pointsB[start1].x, pointsB[start1].y,
      pointsB[end1].x, pointsB[end1].y,
      pointsB[start2].x, pointsB[start2].y,
      pointsB[end2].x, pointsB[end2].y
    );
    
    if (intersection) {
      // 交差点の描画
      ctxB.beginPath();
      ctxB.arc(
        (intersection.x - bMinX) * bToCanvasScale, 
        (intersection.y - bMinY) * bToCanvasScale, 
        styles.errorPoint.radius, 0, Math.PI * 2
      );
      ctxB.fillStyle = styles.errorPoint.fillColor;
      ctxB.strokeStyle = styles.errorPoint.strokeColor;
      ctxB.fill();
      ctxB.stroke();
    }
  }
}

// 2つの線分の交点を計算
function calculateIntersection(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): { x: number, y: number } | null {
  // 線分の方程式の係数を計算
  const a1 = y2 - y1;
  const b1 = x1 - x2;
  const c1 = x2 * y1 - x1 * y2;
  
  const a2 = y4 - y3;
  const b2 = x3 - x4;
  const c2 = x4 * y3 - x3 * y4;
  
  // 行列式
  const det = a1 * b2 - a2 * b1;
  
  if (Math.abs(det) < 1e-10) {
    // 線分が平行または重なっている
    return null;
  }
  
  // 交点の座標を計算
  const x = (b1 * c2 - b2 * c1) / det;
  const y = (a2 * c1 - a1 * c2) / det;
  
  // 交点が両方の線分上にあるか確認
  if (
    isPointOnSegment(x, y, x1, y1, x2, y2) &&
    isPointOnSegment(x, y, x3, y3, x4, y4)
  ) {
    return { x, y };
  }
  
  return null;
}

// 点が線分上にあるかチェック
function isPointOnSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): boolean {
  // 点が線分の端点上にあるか
  if ((px === x1 && py === y1) || (px === x2 && py === y2)) {
    return true;
  }
  
  // 点が線分の範囲内にあるか
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  // 線分の長さが0の場合
  if (dx === 0 && dy === 0) {
    return px === x1 && py === y1;
  }
  
  // 点が線分を含む直線上にあるか
  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  
  return t >= 0 && t <= 1;
}

// キャンバスのマウスダウン処理
function handleCanvasMouseDown(e: MouseEvent, plane: 'A' | 'B') {
  if (showTriangulationCheckbox.checked) {
    // 三角網表示中は点の選択不可
    return;
  }
  
  const canvas = plane === 'A' ? canvasA : canvasB;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  
  // 座標系に変換
  const worldX = plane === 'A' 
    ? x / aToCanvasScale 
    : x / bToCanvasScale + bMinX;
  
  const worldY = plane === 'A' 
    ? y / aToCanvasScale 
    : y / bToCanvasScale + bMinY;
  
  // 点の選択
  selectedPointIndex = findClosestPoint(worldX, worldY, plane);
  
  if (selectedPointIndex >= 0) {
    isDragging = true;
    updateVisualization();
  } else {
    // 点が選択されなかった場合、選択解除
    if (selectedPointIndex !== -1) {
      selectedPointIndex = -1;
      updateVisualization();
    }
  }
}

// キャンバスのマウス移動処理
function handleCanvasMouseMove(e: MouseEvent, plane: 'A' | 'B') {
  if (!isDragging || selectedPointIndex === -1 || showTriangulationCheckbox.checked) {
    return;
  }
  
  const canvas = plane === 'A' ? canvasA : canvasB;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  
  // 座標系に変換
  const worldX = plane === 'A' 
    ? x / aToCanvasScale 
    : x / bToCanvasScale + bMinX;
  
  const worldY = plane === 'A' 
    ? y / aToCanvasScale 
    : y / bToCanvasScale + bMinY;
  
  // 点の位置を更新
  if (plane === 'A') {
    pointsA[selectedPointIndex] = { x: worldX, y: worldY };
  } else {
    pointsB[selectedPointIndex] = { x: worldX, y: worldY };
  }
  
  updateVisualization();
  updateJsonOutput();
}

// キャンバスのマウスアップ処理
function handleCanvasMouseUp() {
  isDragging = false;
}

// 最も近い点を見つける
function findClosestPoint(x: number, y: number, plane: 'A' | 'B'): number {
  const points = plane === 'A' ? pointsA : pointsB;
  const threshold = plane === 'A' ? 500 : 500 / bToCanvasScale * aToCanvasScale; // 選択半径
  
  let closestIndex = -1;
  let minDistance = threshold;
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const distance = Math.sqrt(
      Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  
  return closestIndex;
}

// JSONOutputの更新
function updateJsonOutput() {
  const data = {
    title: "手動生成データ",
    pointsA,
    pointsB
  };
  
  if (showTriangulationCheckbox.checked && triangulationResult) {
    Object.assign(data, {
      triangles: triangulationResult.triangles,
      topologyErrors
    });
  }
  
  jsonOutput.value = JSON.stringify(data, null, 2);
}

// JSONテキストの入力処理
function handleJsonInput() {
  try {
    const data = JSON.parse(jsonOutput.value);
    
    if (data.pointsA && data.pointsB) {
      pointsA = data.pointsA;
      pointsB = data.pointsB;
      updateVisualization();
    }
  } catch (e) {
    // JSON解析エラー
    console.error('Invalid JSON format');
  }
}

// JSONをクリップボードにコピー
function copyJsonToClipboard() {
  jsonOutput.select();
  document.execCommand('copy');
}

// データをファイルに保存
function saveDataToFile() {
  const blob = new Blob([jsonOutput.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'testData.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ファイルからデータを読み込み
function loadDataFromFile(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  
  const file = input.files[0];
  const reader = new FileReader();
  
  reader.onload = function(e) {
    if (e.target?.result) {
      jsonOutput.value = e.target.result as string;
      handleJsonInput();
    }
  };
  
  reader.readAsText(file);
  input.value = ''; // ファイル選択をリセット
}
