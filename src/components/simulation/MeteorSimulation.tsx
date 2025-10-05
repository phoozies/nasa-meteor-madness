"use client";

import { useEffect, useRef } from "react";
import type { Viewer, Cartesian3, SampledPositionProperty, Entity, JulianDate, Cartographic } from "cesium";
import { ImpactPhysics } from '@/lib/calculations/impactPhysics';

interface MeteorParams {
  size: number;        // meters
  velocity: number;    // km/s
  angle: number;       // degrees
  composition: 'rocky' | 'metallic' | 'icy'; // composition options
}

interface MeteorSimulationProps {
  viewer: Viewer | null;
  params: MeteorParams;
  target?: { lon: number; lat: number; height: number } | null;
  start?: boolean;
  // bearing in degrees: 0 = north, 90 = east, 180 = south, 270 = west
  bearingDeg?: number;
}

export default function MeteorSimulation({ viewer, params, target, start, bearingDeg }: MeteorSimulationProps) {
  const prevStartRef = useRef<boolean>(false);

  useEffect(() => {
    // Only run when start transitions from false -> true
    const shouldStart = !!start && !prevStartRef.current;
    prevStartRef.current = !!start;
    if (!viewer || !target || !shouldStart) return;

    let meteorEntity: Entity | undefined;
    let position: SampledPositionProperty | undefined;
    let explosionEntity: Entity | undefined;
    let impactTriggered = false;
    let tickListener: (() => void) | undefined;
    let impactTime: JulianDate | undefined;

    const runMeteor = async () => {
      const Cesium = await import("cesium");
      const { size } = params;

  // Starting position: compute so the incoming angle matches params.angle
  // We'll place the start point at a fixed entry altitude and offset it horizontally
  // so that the approach angle (from horizontal) equals the input angle. The offset
  // will be placed along the chosen bearing so the meteor can come from any cardinal direction.
  const ENTRY_ALTITUDE = 150000; // meters (150 km)
  // Clamp angle to avoid extreme tan values
  const angleDeg = Math.max(1, Math.min(params.angle ?? 45, 89));
  const angleRad = (angleDeg * Math.PI) / 180;
  // horizontal distance required so that tan(angle) = altitude / horizontalDistance
  const horizontalDistance = ENTRY_ALTITUDE / Math.tan(angleRad); // meters
  // Approx meters per degree latitude (varies slightly with latitude, good enough here)
  const METERS_PER_DEG_LAT = 111320;
  // Bearing: use provided bearingDeg; otherwise pick a random heading [0,360)
  const bearing = (typeof bearingDeg === 'number') ? bearingDeg : Math.random() * 360;
  const bearingRad = (bearing * Math.PI) / 180;
  // Delta degrees for lat/lon along bearing
  const deltaLatDeg = (horizontalDistance * Math.cos(bearingRad)) / METERS_PER_DEG_LAT;
  const metersPerDegLon = Math.max(METERS_PER_DEG_LAT * Math.cos((target.lat * Math.PI) / 180), 1e-6);
  const deltaLonDeg = (horizontalDistance * Math.sin(bearingRad)) / metersPerDegLon;
  const startLat = target.lat + deltaLatDeg;
  const startLon = target.lon + deltaLonDeg;
  const startPos = Cesium.Cartesian3.fromDegrees(startLon, startLat, ENTRY_ALTITUDE);
      const endPos = Cesium.Cartesian3.fromDegrees(target.lon, target.lat, target.height);

      const startTime: JulianDate = Cesium.JulianDate.now();
      // compute flightDuration from distance / velocity (params.velocity is km/s)
      const distanceMeters = Cesium.Cartesian3.distance(startPos, endPos);
      const velocityMps = Math.max( (params.velocity ?? 20) * 1000, 100 ); // floor to 100 m/s to avoid too-fast values
      let flightDuration = distanceMeters / velocityMps; // seconds
      // clamp for UX: not too fast, not too slow
      flightDuration = Math.max(1.5, Math.min(flightDuration, 10)); // Adjust timing for better visibility
      const endTime: JulianDate = Cesium.JulianDate.addSeconds(startTime, flightDuration, new Cesium.JulianDate());

      // Remove previous meteor/crater/explosion
      viewer.entities.values
        .filter((e: Entity) => e.name && ["Meteor", "Crater", "Explosion"].includes(e.name))
        .forEach((e) => viewer.entities.remove(e));

      position = new Cesium.SampledPositionProperty();
      position.addSample(startTime, startPos);
      position.addSample(endTime, endPos);

  meteorEntity = viewer.entities.add({
        name: "Meteor",
        position,
        point: {
          pixelSize: Math.max(size / 10, 10), // Larger, more visible point
          color: Cesium.Color.YELLOW,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 3,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.8), // Better scaling
        },
        path: {
          leadTime: 0,
          trailTime: 20, // Longer trail for better visibility
          width: 12, // Thicker trail
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.4,
            taperPower: 0.7,
            color: Cesium.Color.ORANGE.withAlpha(0.9)
          }),
        },
      });

      // camera follow will be handled in the tick listener for better centering at steep angles

      // Impact handler
      const triggerImpact = (cartesianPos: Cartesian3, carto: Cartographic, currentTime: JulianDate) => {
        try {
          impactTime = currentTime;
          if (meteorEntity) meteorEntity.show = false;

          // Stop any camera lookAt-follow so we can focus on the impact animation
          try {
            if (viewer && !viewer.isDestroyed()) {
              viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
            }
          } catch (e) {
            console.warn('Could not reset camera at impact:', e);
          }

          const lon = Cesium.Math.toDegrees(carto.longitude);
          const lat = Cesium.Math.toDegrees(carto.latitude);
          const groundPos = Cesium.Cartesian3.fromDegrees(lon, lat, target.height);

          // Compute crater radius using physics (ImpactPhysics uses composition -> density)
          let craterRadius = params.size; // meters fallback
          try {
            const impact = ImpactPhysics.calculateImpact({
              diameter: params.size,
              velocity: params.velocity,
              angle: params.angle,
              composition: params.composition as 'rocky' | 'metallic' | 'icy',
            });
            // impact.craterDiameter is returned in kilometers
            const craterDiameterMeters = (impact.craterDiameter || 0) * 1000;
            if (craterDiameterMeters > 0) craterRadius = Math.max(craterDiameterMeters / 2, params.size);
          } catch (e) {
            // If physics calculation fails, keep visual fallback size
            console.warn('Impact physics calculation failed, using fallback size', e);
          }

          // Crater - make it much more visible
          viewer.entities.add({
            name: "Crater",
            position: groundPos,
            ellipse: {
              semiMajorAxis: Math.max(craterRadius * 4, 500), // Larger crater
              semiMinorAxis: Math.max(craterRadius * 4, 500),
              height: target.height + 2, // Above ground for visibility
              extrudedHeight: target.height - 100, // Deeper crater
              // Make crater slightly transparent for better blending with terrain
              material: Cesium.Color.DARKRED.withAlpha(0.3),
              outline: true,
              outlineColor: Cesium.Color.RED.withAlpha(0.8),
              outlineWidth: 3,
            },
          });

          // Explosion - improved animation
          explosionEntity = viewer.entities.add({
            name: "Explosion",
            position: groundPos,
            ellipse: {
              semiMajorAxis: new Cesium.CallbackProperty((time) => {
                if (!time || !impactTime) return 0;
                const dt = Cesium.JulianDate.secondsDifference(time, impactTime);
                if (dt < 0) return 0;
                const maxRadius = Math.max(craterRadius * 12, 3000);
                const growthRate = maxRadius / 3; // Reach full size in 3 seconds
                return Math.min(maxRadius, dt * growthRate);
              }, false),
              semiMinorAxis: new Cesium.CallbackProperty((time) => {
                if (!time || !impactTime) return 0;
                const dt = Cesium.JulianDate.secondsDifference(time, impactTime);
                if (dt < 0) return 0;
                const maxRadius = Math.max(craterRadius * 12, 3000);
                const growthRate = maxRadius / 3;
                return Math.min(maxRadius, dt * growthRate);
              }, false),
              height: target.height + 50, // Higher above ground
              material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty((time) => {
                if (!time || !impactTime) return Cesium.Color.TRANSPARENT;
                const dt = Cesium.JulianDate.secondsDifference(time, impactTime);
                if (dt < 0) return Cesium.Color.TRANSPARENT;
                
                // Color changes over time
                let color = Cesium.Color.WHITE;
                if (dt < 0.5) {
                  color = Cesium.Color.WHITE;
                } else if (dt < 1.5) {
                  color = Cesium.Color.YELLOW;
                } else if (dt < 3) {
                  color = Cesium.Color.ORANGE;
                } else {
                  color = Cesium.Color.RED;
                }
                
                const alpha = Math.max(0.9 - dt / 6, 0); // 6 second fade
                return color.withAlpha(alpha);
              }, false)),
            },
          });

          // Camera focus on impact area with better positioning
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat - .05, Math.max(craterRadius * 20, 20000)),
            duration: 2.0,
            orientation: {
              heading: Cesium.Math.toRadians(0.0),
              pitch: Cesium.Math.toRadians(-75.0), // Slightly angled view
              roll: 0.0
            }
          });

          // Remove explosion after animation completes
          setTimeout(() => {
            if (explosionEntity && viewer.entities.contains(explosionEntity)) {
              viewer.entities.remove(explosionEntity);
            }
          }, 8000); // 8 seconds to see full animation
        } catch (error) {
          console.error('Impact trigger error:', error);
        }
      };

      // Improved impact detection - check both position and time
      tickListener = () => {
        if (!position || impactTriggered) return;

        const now = viewer.clock.currentTime;

        // Check if we're close to the end time
        const timeToEnd = Cesium.JulianDate.secondsDifference(endTime, now);
        if (timeToEnd <= 0.1) {
          impactTriggered = true;
          const finalPos = position.getValue(endTime);
          if (finalPos) {
            const carto = Cesium.Cartographic.fromCartesian(finalPos);
            triggerImpact(finalPos, carto, now);
          }
          return;
        }

        // Also check height-based detection as backup
        const cart = position.getValue(now);
        if (!cart) return;
        const carto = Cesium.Cartographic.fromCartesian(cart);
        const height = carto.height;

        // Camera follow logic: position the camera behind the meteor along its flight vector
        try {
          // compute direction from current position to end position
          const dir = Cesium.Cartesian3.subtract(endPos, cart, new Cesium.Cartesian3());
          Cesium.Cartesian3.normalize(dir, dir);

          const distanceToEnd = Cesium.Cartesian3.distance(cart, endPos);
          // followDistance depends on remaining distance but clamped for UX
          // Increase distance and upward bias so the camera stays more zoomed-out
          const followDistance = Math.max(15000, Math.min(300000, distanceToEnd * 0.75));

          // camera offset = -dir * followDistance (behind the meteor) + larger upward bias
          const behind = Cesium.Cartesian3.multiplyByScalar(dir, -followDistance, new Cesium.Cartesian3());
          const upBias = new Cesium.Cartesian3(0, 0, Math.max(5000, followDistance * 0.25));
          const cameraOffset = Cesium.Cartesian3.add(behind, upBias, new Cesium.Cartesian3());

          // Make the camera look at the meteor from the computed offset
          viewer.camera.lookAt(cart, cameraOffset);
        } catch {
          // Silently ignore camera follow errors
        }

        if (height <= target.height + 100) { // Larger threshold
          impactTriggered = true;
          triggerImpact(cart, carto, now);
        }
      };

      viewer.clock.onTick.addEventListener(tickListener);

      // Clock setup - improved timing
      viewer.clock.startTime = startTime.clone();
      viewer.clock.stopTime = Cesium.JulianDate.addSeconds(endTime, 10, new Cesium.JulianDate()); // Extra time for impact effects
      viewer.clock.currentTime = startTime.clone();
      viewer.clock.multiplier = 1;
      viewer.clock.shouldAnimate = true;
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // Stop at end instead of looping

      // Position camera to see both meteor approach and impact
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(target.lon, target.lat - 3, 500000), // Closer view
        duration: 1.0,
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-60.0), // Better angle for viewing
          roll: 0.0
        }
      });
    };

    runMeteor();

    return () => {
      try { 
        if (tickListener && viewer && !viewer.isDestroyed()) {
          viewer.clock.onTick.removeEventListener(tickListener);
        }
      } catch (e) {
        console.warn('Error removing tick listener:', e);
      }
      
      try {
        // Clear tracked entity first
        try {
          if (viewer && !viewer.isDestroyed()) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            viewer.trackedEntity = undefined;
          }
        } catch (e) {
          console.warn('Could not clear trackedEntity during cleanup:', e);
        }

        if (viewer && !viewer.isDestroyed()) {
          // Remove all simulation entities
          const entitiesToRemove = viewer.entities.values.filter((e: Entity) => 
            e.name && ["Meteor", "Crater", "Explosion"].includes(e.name)
          );
          entitiesToRemove.forEach(entity => {
            try {
              viewer.entities.remove(entity);
            } catch (e) {
              console.warn('Error removing entity:', e);
            }
          });
        }
      } catch (e) {
        console.warn('Error cleaning up entities:', e);
      }
    };
  }, [viewer, params, target, start, bearingDeg]);

  return null;
}