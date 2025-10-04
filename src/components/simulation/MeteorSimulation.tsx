"use client";

import { useEffect } from "react";
import type { Viewer, Cartesian3, SampledPositionProperty, Entity, JulianDate } from "cesium";

interface MeteorParams {
  size: number;        // meters
  velocity: number;    // km/s
  angle: number;       // degrees
  composition: string; // 'rocky' | 'metallic' | 'icy'
}

interface MeteorSimulationProps {
  viewer: Viewer | null;
  params: MeteorParams;
  target?: { lon: number; lat: number; height: number } | null;
}

export default function MeteorSimulation({ viewer, params, target }: MeteorSimulationProps) {
  useEffect(() => {
    if (!viewer || !target) return;

    let meteorEntity: Entity | undefined;
    let position: SampledPositionProperty | undefined;
    let craterEntity: Entity | undefined;
    let explosionEntity: Entity | undefined;
    let impactTriggered = false;
    let tickListener: any;

    const runMeteor = async () => {
      const Cesium = await import("cesium");
      const { size } = params;

      // Starting position: 150 km above target
      const startPos = Cesium.Cartesian3.fromDegrees(target.lon, target.lat, 150000);
      const endPos = Cesium.Cartesian3.fromDegrees(target.lon, target.lat, target.height);

      const startTime: JulianDate = Cesium.JulianDate.now();
      const flightDuration = 8; // seconds
      const endTime: JulianDate = Cesium.JulianDate.addSeconds(startTime, flightDuration, new Cesium.JulianDate());

      // Remove previous meteor/crater/explosion
      viewer.entities.values
        .filter((e: any) => ["Meteor", "Crater", "Explosion"].includes(e.name))
        .forEach((e) => viewer.entities.remove(e));

      position = new Cesium.SampledPositionProperty();
      position.addSample(startTime, startPos);
      position.addSample(endTime, endPos);

      meteorEntity = viewer.entities.add({
        name: "Meteor",
        position,
        point: {
          pixelSize: Math.max(size / 20, 5),
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

      // Impact handler
      const triggerImpact = (cartesianPos: any, carto: any, impactTime: JulianDate) => {
        try {
          if (meteorEntity) meteorEntity.show = false;

          const lon = Cesium.Math.toDegrees(carto.longitude);
          const lat = Cesium.Math.toDegrees(carto.latitude);
          const groundPos = Cesium.Cartesian3.fromDegrees(lon, lat, target.height);
          const craterRadius = Math.max(params.size * 0.5, 50);

          // Crater
          craterEntity = viewer.entities.add({
            name: "Crater",
            position: groundPos,
            ellipse: {
              semiMajorAxis: craterRadius,
              semiMinorAxis: craterRadius,
              height: 0,
              material: Cesium.Color.BLACK.withAlpha(0.7),
            },
          });

          // Explosion
          explosionEntity = viewer.entities.add({
            name: "Explosion",
            position: groundPos,
            ellipse: {
              semiMajorAxis: new Cesium.CallbackProperty((time) => {
                if (!time) return 0;
                const dt = Cesium.JulianDate.secondsDifference(time, impactTime);
                if (dt < 0) return 0;
                return Math.min(craterRadius * 4, dt * 1000);
              }, false),
              semiMinorAxis: new Cesium.CallbackProperty((time) => {
                if (!time) return 0;
                const dt = Cesium.JulianDate.secondsDifference(time, impactTime);
                if (dt < 0) return 0;
                return Math.min(craterRadius * 4, dt * 1000);
              }, false),
              height: 0,
              material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty((time) => {
                if (!time) return Cesium.Color.ORANGE.withAlpha(0);
                const dt = Cesium.JulianDate.secondsDifference(time, impactTime);
                const alpha = Math.max(1 - dt / 2, 0);
                return Cesium.Color.ORANGE.withAlpha(alpha);
              }, false)),
            },
          });

          // Camera focus
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, craterRadius * 6),
            duration: 1.5,
          });

          // Remove explosion after a few seconds
          setTimeout(() => {
            if (explosionEntity) viewer.entities.remove(explosionEntity);
          }, 3000);
        } catch (e) {
          console.error(e);
        }
      };

      // Monitor clock to detect impact
      tickListener = (clock: any) => {
        if (!position || impactTriggered) return;
        const now = viewer.clock.currentTime;
        const cart = position.getValue(now);
        if (!cart) return;
        const carto = Cesium.Cartographic.fromCartesian(cart);
        const height = carto.height;

        if (height <= target.height + 1) { // small threshold
          impactTriggered = true;
          triggerImpact(cart, carto, now);
        }
      };

      viewer.clock.onTick.addEventListener(tickListener);

      // Clock setup
      viewer.clock.startTime = startTime.clone();
      viewer.clock.stopTime = endTime.clone();
      viewer.clock.currentTime = startTime.clone();
      viewer.clock.multiplier = 1;
      viewer.clock.shouldAnimate = true;

      viewer.flyTo(meteorEntity);
    };

    runMeteor();

    return () => {
      try { if (tickListener) viewer.clock.onTick.removeEventListener(tickListener); } catch (e) {}
      try { if (meteorEntity) viewer.entities.remove(meteorEntity); } catch (e) {}
      try { if (craterEntity) viewer.entities.remove(craterEntity); } catch (e) {}
      try { if (explosionEntity) viewer.entities.remove(explosionEntity); } catch (e) {}
    };
  }, [viewer, params, target]);

  return null;
}