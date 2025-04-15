<!-- OLCanvas.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import 'ol/ol.css';
  import { Map, View } from 'ol';
  import { Vector as VectorLayer } from 'ol/layer';
  import { Vector as VectorSource } from 'ol/source';
  import { Feature } from 'ol';
  import { Point } from 'ol/geom';
  import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';

  const { points = [], mapId = 'map', normalize = false } = $props<{ points?: Array<{ x: number; y: number }>, mapId?: string, normalize?: boolean }>();

  let map: Map;
  let vectorSource: VectorSource = new VectorSource();

  const style = new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: 'rgba(255,0,0,0.8)' }),
      stroke: new Stroke({ color: '#fff', width: 1 }),
    }),
  });

  // 座標系反転用の関数
  function invertY(y: number) {
    return -y;
  }

  // 地図初期化
  onMount(() => {
    map = new Map({
      target: mapId,
      layers: [
        new VectorLayer({
          source: vectorSource,
          style,
        }),
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 2,
      }),
    });

    // 初回の点群表示と範囲正規化
    updatePoints(true);
  });

  // 点群データの更新
  $effect(() => {
    updatePoints(normalize);
  });

  function updatePoints(shouldNormalize: boolean) {
    vectorSource.clear();

    if (points.length === 0) return;

    const features = points.map((pt) => {
      return new Feature({
        geometry: new Point([pt.x, invertY(pt.y)]),
      });
    });

    vectorSource.addFeatures(features);

    // 指定時のみ表示範囲を点群に合わせて正規化
    if (shouldNormalize) {
      const extent = vectorSource.getExtent();
      map.getView().fit(extent, { padding: [20, 20, 20, 20], duration: 500 });
    }
  }
</script>

<div id={mapId} class="map"></div>

<style>
  .map {
    width: 400px;
    height: 400px;
    border: 1px solid #000;
    box-sizing: border-box;
  }
</style>
