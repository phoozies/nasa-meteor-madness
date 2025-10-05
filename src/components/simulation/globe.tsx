"use client";

import { useEffect, useRef, useState } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";
import type { Viewer, Cesium3DTileset } from "cesium";

declare global {
  interface Window {
    CESIUM_BASE_URL?: string;
  }
}

export default function Globe({
  onViewerReady,
  onClick,
}: {
  onViewerReady?: (viewer: Viewer) => void;
  onClick?: (pos: { lon: number; lat: number; height: number }) => void;
}) {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);

  useEffect(() => {
    let viewer: Viewer;
    let buildingTileset: Cesium3DTileset;
    let destroyed = false;
    let eventHandler: any = null;

    window.CESIUM_BASE_URL = "/Build/Cesium/";

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

      try {
        eventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        eventHandler.setInputAction(
          (click: any) => {
            if (!onClick) return;

            let pickPos: any;
            if (viewer.scene.pickPosition) {
              pickPos = viewer.scene.pickPosition(click.position);
            } else {
              pickPos = viewer.camera.pickEllipsoid(
                click.position,
                viewer.scene.globe.ellipsoid
              );
            }

            if (!pickPos) return;

            const carto = Cesium.Cartographic.fromCartesian(pickPos);
            const lon = Cesium.Math.toDegrees(carto.longitude);
            const lat = Cesium.Math.toDegrees(carto.latitude);

            const height = viewer.scene.globe.getHeight(carto) ?? 0;

            onClick({ lon, lat, height });
          },
          Cesium.ScreenSpaceEventType.LEFT_CLICK
        );
      } catch (e) {}

      setViewer(viewer);
      onViewerReady?.(viewer);
    });

    return () => {
      destroyed = true;
      try { if (eventHandler) eventHandler.destroy(); } catch (e) {}
      if (viewer) viewer.destroy();
      setViewer(null);
    };
  }, []);

  return (
    <div
      ref={cesiumContainerRef}
      style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}
    />
  );
}
