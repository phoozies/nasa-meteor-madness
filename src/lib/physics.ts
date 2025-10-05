// src/lib/physics.ts
// Using team member's accurate equations

// Constants
const MT = 4.184e15;  // J per megaton TNT equivalent
const gE = 9.81;      // m/s^2, surface gravity

export function impactEnergy(diameter_m: number, density: number, speed_ms: number){
  const r = diameter_m / 2;
  const mass = (4/3) * Math.PI * Math.pow(r, 3) * density;
  const E = 0.5 * mass * speed_ms * speed_ms;  // joules
  const MtTNT = E / MT;                         // megatons of TNT
  return { mass, E, MtTNT };
}

export function craterDiameterMeters(
  diameter_m: number,
  density: number,
  speed_ms: number,
  angle_deg: number,
  targetDensity = 2500
){
  // Using team member's transient crater equation:
  // Dtc = 1.161 * ((ρ_i / ρ_t)^(1/3)) * (L^0.78) * ((vi^0.44) / (gE^0.22)) * ((sin(φ))^(1/3))
  const angleRad = (angle_deg * Math.PI) / 180;
  const sinAngle = Math.sin(angleRad);
  
  const Dtc = 1.161 * 
    Math.pow(density / targetDensity, 1/3) * 
    Math.pow(diameter_m, 0.78) * 
    Math.pow(speed_ms, 0.44) / Math.pow(gE, 0.22) * 
    Math.pow(sinAngle, 1/3);
  
  // Final crater diameter: Dfr = 1.25 * Dtc
  return 1.25 * Dtc;
}

export function overpressureRadiiMeters(MtTNT: number){
  // Scaling based on asteroid impact empirical data (neal.fun calibration)
  // Using cube-root scaling: R ∝ Y^(1/3) where Y is yield in MT
  // Reference: 65 MT gives approximately:
  // - 1 psi at 25 km (trees knocked down)
  // - 3 psi at 23 km (homes collapse)
  // - 5 psi at 18 km (buildings collapse)  
  // - 10 psi at 8.5 km (complete leveling)
  // - 20 psi at 7.7 km (lung damage)
  const cubeRoot = Math.cbrt(MtTNT);
  
  return {
    p1: 6220 * cubeRoot,     // 1 psi - light damage, trees down
    p3: 5720 * cubeRoot,     // 3 psi - homes collapse
    p5: 4480 * cubeRoot,     // 5 psi - buildings collapse
    p10: 2110 * cubeRoot,    // 10 psi - complete destruction
    p20: 1910 * cubeRoot,    // 20 psi - lung damage
  };
}

export function thermalRadiusMeters(MtTNT: number){
  // Thermal radiation radius for ignition/burns
  // Reference: 65 MT gives approximately 16 km for trees catching fire
  // Scales with Y^0.41 (slightly less than cube root)
  return 2888 * Math.pow(MtTNT, 0.41);
}

export function deflectionOffsetMeters(dv_ms: number, lead_days: number){
  const T = lead_days * 24 * 3600;
  return dv_ms * T; // linear proxy for education
}
