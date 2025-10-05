/**
 * Asteroid Impact Physics Calculations
 * Based on professional team member's equations and scaling relationships
 */

export interface AsteroidProperties {
  diameter: number; // meters
  velocity: number; // km/s
  density?: number; // kg/m³ (default: 3000 for rocky asteroids)
  angle?: number; // impact angle in degrees (default: 45)
  composition?: 'rocky' | 'metallic' | 'icy';
}

export interface ImpactResults {
  energy: number; // Joules
  energyMegatonsTNT: number; // Megatons TNT equivalent
  craterDiameter: number; // kilometers (final crater diameter)
  craterDiameterTransient: number; // kilometers (transient crater diameter)
  craterDepth: number; // kilometers
  craterRimHeight: number; // kilometers
  meltVolume: number; // cubic meters
  meltThickness: number; // meters
  ejectaThickness: number; // meters at crater rim
  seismicMagnitude: number; // Richter scale
  thermalRadius: number; // kilometers (3rd degree burns)
  overpressureRadius: number; // kilometers (building damage)
  mass: number; // kg
  momentum: number; // kg⋅m/s
  angularMomentum: number; // kg⋅m²/s
}

// Constants from team member's equations
const ME = 5.83e24;        // kg, mass of Earth
const RE = 6.371e6;        // m, radius of Earth
const gE = 9.81;           // m/s^2, surface gravity
const VE = 1.083e12;       // km^3, volume of Earth
const vE = 29.78e3;        // m/s, orbital velocity of Earth
const εm = 5.2e6;          // J/kg, specific energy of melt for granite
const MT = 4.184e15;       // J per megaton TNT equivalent

export class ImpactPhysics {
  /**
   * Get default density based on asteroid composition
   */
  private static getDefaultDensity(composition: string): number {
    switch (composition) {
      case 'metallic': return 7800; // kg/m³ (iron-nickel)
      case 'icy': return 1000; // kg/m³ (water ice)
      case 'rocky':
      default: return 2600; // kg/m³ (silicate rock, calibrated to match empirical data)
    }
  }
  
  /**
   * Get default target density (solid ground vs water)
   */
  private static getTargetDensity(isWater: boolean = false): number {
    return isWater ? 1000 : 2500; // kg/m³
  }
  
  /**
   * Calculate asteroid mass: mi = (4/3) * π * (L/2)³ * ρ_i
   */
  static calculateMass(diameter: number, density: number): number {
    const radius = diameter / 2;
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    return volume * density;
  }
  
  /**
   * Calculate kinetic energy: KE = 0.5 * mi * vi²
   */
  static calculateKineticEnergy(mass: number, velocityMs: number): number {
    return 0.5 * mass * Math.pow(velocityMs, 2);
  }
  
  /**
   * Convert energy to TNT equivalent
   */
  static energyToTNT(energyJoules: number): number {
    return energyJoules / MT;
  }
  
  /**
   * Calculate transient crater diameter for solid ground
   * Dtc_solid = 1.161 * ((ρ_i / ρ_t)^(1/3)) * (L^0.78) * ((vi^0.44) / (gE^0.22)) * ((sin(φ))^(1/3))
   */
  static calculateTransientCraterDiameter(
    impactorDiameter: number, // meters
    impactorDensity: number,  // kg/m³
    velocity: number,          // m/s
    angle: number,            // degrees
    targetDensity: number = 2500,
    isWater: boolean = false
  ): number {
    const angleRad = (angle * Math.PI) / 180;
    const sinAngle = Math.sin(angleRad);
    
    const coefficient = isWater ? 1.365 : 1.161;
    
    const Dtc = coefficient * 
      Math.pow(impactorDensity / targetDensity, 1/3) * 
      Math.pow(impactorDiameter, 0.78) * 
      Math.pow(velocity, 0.44) / Math.pow(gE, 0.22) * 
      Math.pow(sinAngle, 1/3);
    
    return Dtc; // meters
  }
  
  /**
   * Calculate final crater diameter (simple crater)
   * Dfr = 1.25 * Dtc_solid
   */
  static calculateFinalCraterDiameter(transientDiameter: number): number {
    return 1.25 * transientDiameter; // meters
  }
  
  /**
   * Calculate crater depth and rim height
   * dtc = 0.20 * Dtc (calibrated to match empirical data)
   * hfr = 0.07 * Dfr
   * dfr = dtc + hfr
   */
  static calculateCraterDepthAndRim(transientDiameter: number, finalDiameter: number) {
    const dtc = 0.20 * transientDiameter;
    const hfr = 0.07 * finalDiameter;
    const dfr = dtc + hfr;
    
    return {
      transientDepth: dtc,
      rimHeight: hfr,
      finalDepth: dfr
    };
  }
  
  /**
   * Calculate volume of melt produced
   * If vi > 12 km/s: Vm = Vi * (vi² / (2 * εm))
   */
  static calculateMeltVolume(
    impactorDiameter: number, // meters
    velocity: number          // m/s
  ): number {
    const Vi = (4/3) * Math.PI * Math.pow(impactorDiameter / 2, 3); // m³
    
    if (velocity > 12000) {
      return Vi * (Math.pow(velocity, 2) / (2 * εm));
    }
    
    return 0; // No significant melt below 12 km/s
  }
  
  /**
   * Calculate melt thickness at crater floor
   * Tm = Vm / (π * (Dfr/2)²)
   */
  static calculateMeltThickness(meltVolume: number, finalDiameter: number): number {
    if (meltVolume === 0) return 0;
    return meltVolume / (Math.PI * Math.pow(finalDiameter / 2, 2));
  }
  
  /**
   * Calculate seismic magnitude
   * Based on empirical relationships from impact events
   * Using formula: M = log10(E_MT) + 4.0 where E_MT is energy in Megatons
   */
  static calculateSeismicMagnitude(energy: number): number {
    const energyMT = this.energyToTNT(energy);
    // More accurate for large impacts: M ≈ log10(MT) + 4.0
    // This gives realistic values: 1 MT ≈ 4.0, 10 MT ≈ 5.0, 100 MT ≈ 6.0, 1000 MT ≈ 7.0
    const magnitude = Math.log10(energyMT) + 4.0;
    return Math.max(0, magnitude); // Magnitude can't be negative
  }
  
  /**
   * Calculate thermal radiation effects
   * Proper scaling: R ∝ Y^0.41 for thermal effects
   */
  static calculateThermalRadius(energy: number): number {
    const energyMT = this.energyToTNT(energy);
    // Reference: 1 MT gives ~10 km thermal radius for 3rd degree burns
    return 10 * Math.pow(energyMT, 0.41); // km
  }
  
  /**
   * Calculate overpressure effects
   * Proper scaling: R ∝ Y^(1/3) for blast effects
   */
  static calculateOverpressureRadius(energy: number): number {
    const energyMT = this.energyToTNT(energy);
    // Reference: 1 MT gives ~11 km for 1 psi overpressure
    return 11 * Math.cbrt(energyMT); // km
  }
  
  /**
   * Calculate ejecta thickness at crater rim
   */
  static calculateEjectaThickness(craterDiameter: number): number {
    // Empirical relationship based on observations
    return craterDiameter * 0.033; // meters
  }
  
  /**
   * Calculate linear momentum: Mi = mi * vi
   */
  static calculateLinearMomentum(mass: number, velocity: number): number {
    return mass * velocity;
  }
  
  /**
   * Calculate angular momentum: Γ_i = mi * vi * RE * cos(φ)
   */
  static calculateAngularMomentum(mass: number, velocity: number, angle: number): number {
    const angleRad = (angle * Math.PI) / 180;
    return mass * velocity * RE * Math.cos(angleRad);
  }
  
  /**
   * Main impact calculation function using team member's equations
   */
  static calculateImpact(asteroid: AsteroidProperties): ImpactResults {
    const {
      diameter,
      velocity,
      density = this.getDefaultDensity(asteroid.composition || 'rocky'),
      angle = 45
    } = asteroid;
    
    // Convert velocity from km/s to m/s
    const velocityMs = velocity * 1000;
    
    // Calculate basic properties
    const mass = this.calculateMass(diameter, density);
    const energy = this.calculateKineticEnergy(mass, velocityMs);
    const energyMT = this.energyToTNT(energy);
    
    // Calculate momentum
    const linearMomentum = this.calculateLinearMomentum(mass, velocityMs);
    const angularMomentum = this.calculateAngularMomentum(mass, velocityMs, angle);
    
    // Calculate crater dimensions using team member's equations
    const targetDensity = this.getTargetDensity(false); // solid ground
    const transientCraterDiameter = this.calculateTransientCraterDiameter(
      diameter,
      density,
      velocityMs,
      angle,
      targetDensity,
      false
    );
    
    const finalCraterDiameter = this.calculateFinalCraterDiameter(transientCraterDiameter);
    
    const depths = this.calculateCraterDepthAndRim(
      transientCraterDiameter,
      finalCraterDiameter
    );
    
    // Calculate melt volume and thickness
    const meltVolume = this.calculateMeltVolume(diameter, velocityMs);
    const meltThickness = this.calculateMeltThickness(meltVolume, finalCraterDiameter);
    
    // Calculate ejecta
    const ejectaThickness = this.calculateEjectaThickness(finalCraterDiameter);
    
    // Calculate effects
    const seismicMagnitude = this.calculateSeismicMagnitude(energy);
    const thermalRadius = this.calculateThermalRadius(energy);
    const overpressureRadius = this.calculateOverpressureRadius(energy);
    
    return {
      energy,
      energyMegatonsTNT: energyMT,
      craterDiameter: finalCraterDiameter / 1000, // convert to km
      craterDiameterTransient: transientCraterDiameter / 1000, // convert to km
      craterDepth: depths.finalDepth / 1000, // convert to km
      craterRimHeight: depths.rimHeight / 1000, // convert to km
      meltVolume,
      meltThickness,
      ejectaThickness,
      seismicMagnitude,
      thermalRadius,
      overpressureRadius,
      mass,
      momentum: linearMomentum,
      angularMomentum
    };
  }
}

/**
 * Orbital mechanics calculations for asteroid trajectories
 */
export class OrbitalMechanics {
  /**
   * Calculate orbital velocity at given distance from Earth
   */
  static calculateOrbitalVelocity(distance: number): number {
    const G = 6.67430e-11; // Gravitational constant
    const M_earth = 5.972e24; // Mass of Earth in kg
    const r = distance * 1000; // Convert km to meters
    
    return Math.sqrt(G * M_earth / r) / 1000; // Convert back to km/s
  }
  
  /**
   * Calculate escape velocity from Earth
   */
  static calculateEscapeVelocity(): number {
    const G = 6.67430e-11; // Gravitational constant
    const M_earth = 5.972e24; // Mass of Earth in kg
    const R_earth = 6.371e6; // Radius of Earth in meters
    
    return Math.sqrt(2 * G * M_earth / R_earth) / 1000; // km/s
  }
  
  /**
   * Calculate impact velocity given orbital parameters
   */
  static calculateImpactVelocity(
    orbitalVelocity: number,
    escapeVelocity: number
  ): number {
    // For hyperbolic trajectories
    return Math.sqrt(Math.pow(orbitalVelocity, 2) + Math.pow(escapeVelocity, 2));
  }
}