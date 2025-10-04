"use client";

import { useEffect } from "react";
import type { Viewer, Cartesian3, SampledPositionProperty, Entity } from "cesium";

interface MeteorParams {
  size: number;        // meters
  velocity: number;    // km/s
  angle: number;       // degrees
  composition: string; // 'rocky' | 'metallic' | 'icy'
}

interface MeteorSimulationProps {
  viewer: Viewer | null;
  params: MeteorParams;
}

export default function MeteorSimulation({ viewer, params }: MeteorSimulationProps) {
  useEffect(() => {
    if (!viewer) return;

    let meteorEntity: Entity | undefined;
    let position: SampledPositionProperty | undefined;

    const runMeteor = async () => {
      const Cesium = await import("cesium");

      const { size } = params;

      // Starting position (space entry point)
      const startPos = Cesium.Cartesian3.fromDegrees(-150, 60, 150000); // 150km up
      const endPos = Cesium.Cartesian3.fromDegrees(-120, 45, 0); // target on Earth

      const startTime = Cesium.JulianDate.now();
      const endTime = Cesium.JulianDate.addSeconds(
        startTime,
        8,
        new Cesium.JulianDate()
      );

      position = new Cesium.SampledPositionProperty();
      position.addSample(startTime, startPos);
      position.addSample(endTime, endPos);

      meteorEntity = viewer.entities.add({
        name: "Meteor",
        position,
        point: {
          pixelSize: Math.max(size / 20, 5), // visual representation
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1,
        },
        path: {
          leadTime: 0,
          trailTime: 10,
          width: 2,
          material: Cesium.Color.ORANGE.withAlpha(0.6),
        },
      });

      viewer.clock.startTime = startTime.clone();
      viewer.clock.stopTime = endTime.clone();
      viewer.clock.currentTime = startTime.clone();
      viewer.clock.multiplier = 1;
      viewer.clock.shouldAnimate = true;

      viewer.flyTo(meteorEntity);
    };

    runMeteor();

    return () => {
      if (meteorEntity) viewer.entities.remove(meteorEntity);
    };
  }, [viewer, params]);

  return null;
}
