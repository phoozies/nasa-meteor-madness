"use client";

import { useEffect, useRef } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";
import type { Viewer, Cesium3DTileset } from "cesium";

// TypeScript: declare window.CESIUM_BASE_URL
declare global {
  interface Window {
    CESIUM_BASE_URL?: string;
  }
}

export default function Globe() {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: Viewer;
    let buildingTileset: Cesium3DTileset;
    let destroyed = false;

    // Set Cesium base URL
    window.CESIUM_BASE_URL = "/Build/Cesium/";

    // Dynamically import Cesium
    import("cesium").then(async (Cesium) => {
      if (destroyed || !cesiumContainerRef.current) return;

      Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN!;

      viewer = new Cesium.Viewer(cesiumContainerRef.current, {
        terrain: Cesium.Terrain.fromWorldTerrain(),
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        vrButton: false,
      });

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 10000000),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
        },
      });

      buildingTileset = await Cesium.createOsmBuildingsAsync();
      viewer.scene.primitives.add(buildingTileset);
    });

    return () => {
      destroyed = true;
      if (viewer) viewer.destroy();
    };
  }, []);

  return (
    <div
      ref={cesiumContainerRef}
      style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}
    />
  );
}
