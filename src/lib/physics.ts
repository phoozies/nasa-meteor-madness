export type Material = 'stony' | 'iron' | 'cometary';

export function impactEnergy(diameter_m: number, density: number, speed_ms: number){
  const r = diameter_m/2;
  const mass = (4/3)*Math.PI*Math.pow(r,3)*density;
  const E = 0.5*mass*speed_ms*speed_ms;
  const MtTNT = E/4.184e15;
  return { mass, E, MtTNT };
}

export function craterDiameterMeters(E: number, g = 9.81, materialK = 1.8){
  return materialK * Math.pow(E, 0.25) * Math.pow(g, -0.17);
}

export function overpressureRadiiMeters(MtTNT: number){
  const c = Math.pow(MtTNT, 1/3);
  return { p1: 1500*c*1000, p3: 900*c*1000, p5: 650*c*1000, p10: 400*c*1000 };
}

export function thermalRadiusMeters(MtTNT: number){
  const c = Math.pow(MtTNT, 1/3);
  return 1200*c*1000;
}

export function deflectionOffsetMeters(dv_ms: number, lead_days: number){
  const T = lead_days * 24*3600;
  return dv_ms * T;
}
