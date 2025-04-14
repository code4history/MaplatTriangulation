<script lang="ts">
  import 'ol/ol.css';
  import Map from 'ol/Map';
  import View from 'ol/View';
  import { Vector as VectorLayer } from 'ol/layer';
  import { Vector as VectorSource } from 'ol/source';
  import { Feature } from 'ol';
  import { Point as OLPoint } from 'ol/geom';
  import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
  import Projection from 'ol/proj/Projection';
  import { boundingExtent } from 'ol/extent';

  const { points, triangles, selectedIndex, mapId } = $props<{
    points: { x: number; y: number }[];
    triangles: number[][];
    selectedIndex: number | null;
    mapId: string;
  }>();

  let map: Map;
  let vectorLayer: VectorLayer<VectorSource>;

  // 地図初期化
  $effect(() => {
    vectorLayer = new VectorLayer({
      source: new VectorSource(),
      style: (feature) =>
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: feature.get('idx') === selectedIndex ? 'red' : 'blue' }),
            stroke: new Stroke({ color: 'black', width: 1 }),
          }),
        }),
    });

    map = new Map({
      target: mapId,
      layers: [vectorLayer],
      view: new View({
        projection: new Projection({ code: 'cartesian', units: 'pixels' }),
        center: [0, 0],
        zoom: 2,
      }),
      controls: [],
    });
  });

  // フィーチャ更新関数
  const updateFeatures = () => {
    const features = points.map(
      (p, idx) =>
        new Feature({
          geometry: new OLPoint([p.x, -p.y]),
          idx,
        }),
    );

    vectorLayer.getSource().clear();
    vectorLayer.getSource().addFeatures(features);
  };

  // 点群変更時の処理
  $effect(() => {
    points; // pointsの変更を検知するために参照
    updateFeatures();

    if (points.length) {
      const coords = points.map((p) => [p.x, -p.y]);
      const extent = boundingExtent(coords);
      map.getView().fit(extent, { padding: [20, 20, 20, 20], duration: 500 });
    }
  });

  // 選択された点のスタイル更新
  $effect(() => {
    selectedIndex; // 変化を検知するために参照
    if (vectorLayer) vectorLayer.changed();
  });
</script>

<div id={mapId} class="map"></div>

<style>
  .map {
    width: 400px;
    height: 400px;
    border: 1px solid #000;
    box-sizing: border-box;
    display: block;
  }
</style>
