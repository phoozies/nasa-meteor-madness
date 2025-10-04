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
    let craterEntity: Entity | undefined;
    let explosionEntity: Entity | undefined;
    let impactTriggered = false;
    let tickListener: any;

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

      // remove any previous meteor/crater/explosion left behind (e.g., React StrictMode double-mount)
      try {
        const toRemove: Entity[] = [];
        viewer.entities.values.forEach((e: any) => {
          if (e.name === 'Meteor' || e.name === 'Crater' || e.name === 'Explosion') toRemove.push(e);
        });
        toRemove.forEach((e) => viewer.entities.remove(e));
      } catch (e) {
        // ignore
      }

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

      // monitor clock to detect impact
      const impactTimeRef = { time: undefined as any };
      tickListener = (clock: any) => {
        if (!position || impactTriggered) return;
        const now = viewer.clock.currentTime;
        const cart = position.getValue(now);
        if (!cart) return;
        const carto = Cesium.Cartographic.fromCartesian(cart);
        const height = carto.height;

        // trigger impact when near ground (<= 5 meters)
        if (height <= 5) {
          impactTriggered = true;
          impactTimeRef.time = now.clone ? now.clone() : now;
          triggerImpact(cart, carto, impactTimeRef.time);
        }
      };

  viewer.clock.onTick.addEventListener(tickListener);

      // impact handler
      const triggerImpact = (cartesianPos: any, carto: any, impactTime: any) => {
        try {
          // remove/hide meteor
          if (meteorEntity) meteorEntity.show = false;

          const lon = Cesium.Math.toDegrees(carto.longitude);
          const lat = Cesium.Math.toDegrees(carto.latitude);
          const groundPos = Cesium.Cartesian3.fromDegrees(lon, lat, 0);

          // crater size based on asteroid size (meters)
          const craterRadius = Math.max(params.size * 0.5, 50);

          // static crater (dark ellipse)
          craterEntity = viewer.entities.add({
            name: 'Crater',
            position: groundPos,
            ellipse: {
              semiMajorAxis: craterRadius,
              semiMinorAxis: craterRadius,
              height: 0,
              material: Cesium.Color.BLACK.withAlpha(0.7)
            }
          });

          // animated explosion: expanding ellipse with fading color
          explosionEntity = viewer.entities.add({
            name: 'Explosion',
            position: groundPos,
            ellipse: {
              semiMajorAxis: new Cesium.CallbackProperty((time: any, result: any) => {
                const dt = Cesium.JulianDate.secondsDifference(time, impactTime);
                if (dt < 0) return 0;
                return Math.min(craterRadius * 4, dt * 1000); // expand quickly
              }, false),
              semiMinorAxis: new Cesium.CallbackProperty((time: any, result: any) => {
                const dt = Cesium.JulianDate.secondsDifference(time, impactTime);
                if (dt < 0) return 0;
                return Math.min(craterRadius * 4, dt * 1000);
              }, false),
              height: 0,
              material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty((time: any) => {
                const dt = Cesium.JulianDate.secondsDifference(time, impactTime);
                const alpha = Math.max(1 - dt / 2, 0);
                return Cesium.Color.ORANGE.withAlpha(alpha);
              }, false))
            }
          });

          // focus camera on impact
          viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(lon, lat, craterRadius * 6), duration: 1.5 });

          // remove explosion after a few seconds
          setTimeout(() => {
            if (explosionEntity) viewer.entities.remove(explosionEntity);
          }, 3000);
        } catch (e) {
          // ignore
        }
      };
      viewer.clock.startTime = startTime.clone();
      viewer.clock.stopTime = endTime.clone();
      viewer.clock.currentTime = startTime.clone();
      viewer.clock.multiplier = 1;
      viewer.clock.shouldAnimate = true;

      viewer.flyTo(meteorEntity);
    };

    runMeteor();

    return () => {
      try {
        if (tickListener) viewer.clock.onTick.removeEventListener(tickListener);
      } catch (e) {}
      try {
        if (meteorEntity) viewer.entities.remove(meteorEntity);
        if (craterEntity) viewer.entities.remove(craterEntity);
        if (explosionEntity) viewer.entities.remove(explosionEntity);
      } catch (e) {}
    };
  }, [viewer, params]);

  return null;
}
