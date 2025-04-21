<!-- OLCanvas.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  import 'ol/ol.css';
  import { Map, View } from 'ol';
  import { Vector as VectorLayer } from 'ol/layer';
  import { Vector as VectorSource } from 'ol/source';
  import { Feature } from 'ol';
  import { Geometry, Point } from 'ol/geom';
  import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
  import Modify from 'ol/interaction/Modify';
  import Collection from 'ol/Collection';

  const { points = [], triangles = [], selectedIndex = -1, mapId = 'map', normalize = false,
    pointselect, pointmove } = $props<{
      points?: Array<{ x: number; y: number }>;
      triangles?: number[][] | null;
      selectedIndex?: number;
      mapId?: string;
      normalize?: boolean;
      pointselect?: (index: number | null) => void;
      pointmove?: (detail: { index: number; point: { x: number; y: number } }) => void;
    }>();

  let map: Map;
  let vectorSource: VectorSource = new VectorSource();
  let selectedFeature: Feature<Point> | null = null;
  let selectedFeatures = new Collection<Feature<Point>>();

  const defaultStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: 'rgba(0,0,255,0.8)' }),
      stroke: new Stroke({ color: '#fff', width: 1 }),
    }),
  });

  const selectedStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: 'rgba(255,0,0,0.8)' }),
      stroke: new Stroke({ color: '#fff', width: 1 }),
    }),
  });

  function invertY(y: number) {
    return -y;
  }

  onMount(() => {
    map = new Map({
      target: mapId,
      layers: [new VectorLayer({ source: vectorSource, style: featureStyle })],
      view: new View({ projection: 'EPSG:3857', center: [0, 0], zoom: 2 }),
    });

    const modifyInteraction = new Modify({ features: selectedFeatures });
    map.addInteraction(modifyInteraction);

    map.on('pointerdown' as any, (evt:any) => {
    //  console.log(`Pointer Down ${(evt as any).pixel}`);
    //});

    //map.on('singleclick', (evt) => {
      console.log(`Zoom Level: ${map.getView().getZoom()}`);
      const clickedFeature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature, { hitTolerance: 5 }) as Feature<Geometry>;

      if (clickedFeature) {
        const innerFeatures = clickedFeature.get('features');
        const realFeature: Feature<Point> | undefined = innerFeatures?.[0] || (clickedFeature.getGeometry() instanceof Point ? clickedFeature as Feature<Point> : undefined);

        if (realFeature) {
          selectedFeature = realFeature;
          selectedFeatures.clear();
          selectedFeatures.push(selectedFeature);
          const idx = selectedFeature.get('index');
          pointselect?.(idx);
        }
      } else {
        console.log("release selected feature");
        selectedFeature = null;
        selectedFeatures.clear();
        pointselect?.(null);
      }

      vectorSource.changed();
    });

    modifyInteraction.on('modifystart', (evt) => {
      const feature = evt.features.item(0) as Feature<Point>;
      feature.set('originalCoords', feature.getGeometry()?.getCoordinates().slice());
    });

    modifyInteraction.on('modifyend', (evt) => {
      const feature = evt.features.item(0) as Feature<Point>;
      const geometry = feature.getGeometry();
      const coords = geometry?.getCoordinates();
      const originalCoords = feature.get('originalCoords');

      if (coords && originalCoords) {
        geometry?.setCoordinates(originalCoords);
        const invertedCoords = { x: coords[0], y: invertY(coords[1]) };
        const idx = feature.get('index');

        if (typeof idx === 'number') {
          pointmove?.({ index: idx, point: invertedCoords });
        }
      }
    });

    updatePoints(true);
  });

  $effect(() => updatePoints(normalize));

  $effect(() => {
    (async () => {
      await tick();
      const features = vectorSource.getFeatures();
      const foundFeature = features.find(f => f.get('index') === selectedIndex);
      if (foundFeature && foundFeature.getGeometry() instanceof Point) {
        selectedFeature = foundFeature as Feature<Point>;
        selectedFeatures.clear();
        selectedFeatures.push(selectedFeature);
      } else {
        selectedFeature = null;
        selectedFeatures.clear();
      }
      vectorSource.changed();
    })();
  });

  function featureStyle(feature: Feature<Point>) {
    return selectedFeature && feature.get('index') === selectedIndex ? selectedStyle : defaultStyle;
  }

  function updatePoints(shouldNormalize: boolean) {
    console.log(`OLCanvas updatePoints ${mapId}`);
    vectorSource.clear();
    if (points.length === 0) return;

    const features = points.map((pt, idx) => {
      const feature = new Feature({ geometry: new Point([pt.x, invertY(pt.y)]) });
      feature.set('index', idx);
      return feature;
    });

    vectorSource.addFeatures(features);
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
