<script lang="ts">
  import { onMount } from 'svelte';
  import 'ol/ol.css';
  import Map from 'ol/Map';
  import View from 'ol/View';
  import { Vector as VectorLayer } from 'ol/layer';
  import { Vector as VectorSource } from 'ol/source';
  import { Feature } from 'ol';
  import { Point as OLPoint } from 'ol/geom';
  import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
  import Projection from 'ol/proj/Projection';

  const { mapId } = $props<{ mapId: string }>();

  let mapContainer: HTMLDivElement;

  onMount(() => {
    const extent = [-1000, -1000, 1000, 1000];

    const projection = new Projection({
      code: 'cartesian',
      units: 'pixels',
      extent,
    });

    const features = [
      new Feature(new OLPoint([0, 0])),
      new Feature(new OLPoint([500, 500])),
      new Feature(new OLPoint([-500, -500])),
    ];

    const vectorLayer = new VectorLayer({
      source: new VectorSource({ features }),
      style: new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: 'blue' }),
          stroke: new Stroke({ color: 'black', width: 1 }),
        }),
      }),
    });

    const map = new Map({
      target: mapContainer,
      layers: [vectorLayer],
      view: new View({
        projection,
        center: [0, 0],
        zoom: 2,
        extent,
      }),
      controls: [],
    });

    setTimeout(() => map.updateSize(), 100);
  });
</script>

<div bind:this={mapContainer} class="map"></div>

<style>
.map {
  width: 400px;
  height: 400px;
  border: 1px solid #000;
  box-sizing: border-box;
}
</style>
