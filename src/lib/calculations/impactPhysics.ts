/**
 * Asteroid Impact Physics Calculations
 * Based on scientific literature and established scaling relationships
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
  craterDiameter: number; // kilometers
  craterDepth: number; // kilometers
  ejectaThickness: number; // meters at crater rim
  seismicMagnitude: number; // Richter scale
  thermalRadius: number; // kilometers (3rd degree burns)
  overpressureRadius: number; // kilometers (building damage)
  mass: number; // kg
  momentum: number; // kg⋅m/s
}

export class ImpactPhysics {
  /**
   * Get default density based on asteroid composition
   */
  private static getDefaultDensity(composition: string): number {
    switch (composition) {
      case 'metallic': return 7800; // kg/m³ (iron-nickel)
      case 'icy': return 1000; // kg/m³ (water ice)
      case 'rocky':
      default: return 3000; // kg/m³ (silicate rock)
    }
  }
  
  /**
   * Calculate asteroid mass
   */
  static calculateMass(diameter: number, density: number): number {
    const radius = diameter / 2;
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    return volume * density;
  }
  
  /**
   * Calculate kinetic energy of impact
   */
  static calculateKineticEnergy(mass: number, velocity: number): number {
    const velocityMs = velocity * 1000; // Convert km/s to m/s
    return 0.5 * mass * Math.pow(velocityMs, 2);
  }
  
  /**
   * Convert energy to TNT equivalent
   */
  static energyToTNT(energyJoules: number): number {
    const TNT_JOULES = 4.184e15; // Joules per megaton TNT
    return energyJoules / TNT_JOULES;
  }
  
  /**
   * Calculate crater diameter using scaling relationships
   * Based on Melosh (1989) and Collins et al. (2005)
   */
  static calculateCraterDiameter(
    energy: number, 
    density: number, 
    gravity = 9.81,
    targetDensity = 2500
  ): number {
    // Scaling relationship for terrestrial impacts
    // D = K * (E/ρg)^(1/3.4)
    // Where K is a scaling constant (~1.8 for competent rock)
    
    const K = 1.8; // Scaling constant
    const scalingFactor = energy / (targetDensity * gravity);
    const diameter = K * Math.pow(scalingFactor, 1/3.4);
    
    // Convert to kilometers
    return diameter / 1000;
  }
  
  /**
   * Calculate crater depth (typically ~0.1 to 0.2 times diameter)
   */
  static calculateCraterDepth(diameter: number): number {
    return diameter * 0.15; // 15% of diameter
  }
  
  /**
   * Calculate seismic magnitude
   * Based on empirical relationships from Schultz & Gault (1975)
   */
  static calculateSeismicMagnitude(energy: number): number {
    // Empirical relationship: M = (2/3) * log10(E) - 2.9
    // Where E is in Joules
    const magnitude = (2/3) * Math.log10(energy) - 2.9;
    return Math.max(0, magnitude); // Magnitude can't be negative
  }
  
  /**
   * Calculate thermal radiation effects
   */
  static calculateThermalRadius(energy: number): number {
    // Radius for 3rd degree burns (1 cal/cm²)
    // Based on Glasstone & Dolan (1977)
    const energyMT = this.energyToTNT(energy);
    return 0.4 * Math.pow(energyMT, 0.4); // km
  }
  
  /**
   * Calculate overpressure effects
   */
  static calculateOverpressureRadius(energy: number): number {
    // Radius for significant building damage (1 psi overpressure)
    const energyMT = this.energyToTNT(energy);
    return 2.2 * Math.pow(energyMT, 0.33); // km
  }
  
  /**
   * Calculate ejecta thickness at crater rim
   */
  static calculateEjectaThickness(craterDiameter: number): number {
    // Empirical relationship based on observations
    return craterDiameter * 1000 * 0.033; // meters
  }
  
  /**
   * Main impact calculation function
   */
  static calculateImpact(asteroid: AsteroidProperties): ImpactResults {
    const {
      diameter,
      velocity,
      density = this.getDefaultDensity(asteroid.composition || 'rocky'),
      angle = 45
    } = asteroid;
    
    // Calculate basic properties
    const mass = this.calculateMass(diameter, density);
    const energy = this.calculateKineticEnergy(mass, velocity);
    const momentum = mass * velocity * 1000; // kg⋅m/s
    
    // Account for impact angle (reduces effective energy)
    const angleRadians = (angle * Math.PI) / 180;
    const effectiveEnergy = energy * Math.pow(Math.sin(angleRadians), 2);
    
    // Calculate crater dimensions
    const craterDiameter = this.calculateCraterDiameter(effectiveEnergy, density);
    const craterDepth = this.calculateCraterDepth(craterDiameter);
    const ejectaThickness = this.calculateEjectaThickness(craterDiameter);
    
    // Calculate effects
    const seismicMagnitude = this.calculateSeismicMagnitude(effectiveEnergy);
    const thermalRadius = this.calculateThermalRadius(effectiveEnergy);
    const overpressureRadius = this.calculateOverpressureRadius(effectiveEnergy);
    
    return {
      energy: effectiveEnergy,
      energyMegatonsTNT: this.energyToTNT(effectiveEnergy),
      craterDiameter,
      craterDepth,
      ejectaThickness,
      seismicMagnitude,
      thermalRadius,
      overpressureRadius,
      mass,
      momentum
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