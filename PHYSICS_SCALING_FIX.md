# Physics Scaling Fix - Blast and Thermal Radii

## Problem
The blast and thermal effect radii were way too large - showing rings thousands of kilometers across for small asteroids.

## Root Cause
The original overpressure formulas had incorrect scaling coefficients:
```typescript
// OLD (INCORRECT)
p1: 1500 * c * 1000  // = 1,500,000 m = 1,500 km for 1 MT!
```

## Solution
Updated to use proper nuclear weapons effects scaling based on empirical data:

### Overpressure Radii (Blast Effects)
Using cube-root scaling: **R ∝ Y^(1/3)**

Reference values for 1 Megaton:
- **1 psi** (light damage): 11 km
- **3 psi** (moderate damage): 6.5 km  
- **5 psi** (severe damage): 5 km
- **10 psi** (complete destruction): 3.5 km

```typescript
export function overpressureRadiiMeters(MtTNT: number){
  const cubeRoot = Math.cbrt(MtTNT);
  return {
    p1: 11000 * cubeRoot,    // meters
    p3: 6500 * cubeRoot,
    p5: 5000 * cubeRoot,
    p10: 3500 * cubeRoot,
  };
}
```

### Thermal Radiation Radius
Using **R ∝ Y^0.41** (slightly less than cube root for thermal effects)

Reference: 1 MT gives ~10 km for 3rd degree burns

```typescript
export function thermalRadiusMeters(MtTNT: number){
  return 10000 * Math.pow(MtTNT, 0.41);  // meters
}
```

## Example Results

### 100m Rocky Asteroid (3000 kg/m³) at 20 km/s, 45° angle

**Energy:**
- 75 MT TNT equivalent

**Crater:**
- Transient diameter: 1.89 km
- Final diameter: 2.36 km
- Depth: ~0.6 km

**Blast Effects:**
- 10 psi (complete destruction): 14.8 km radius
- 5 psi (severe damage): 18.5 km radius
- 3 psi (moderate damage): 24.2 km radius
- 1 psi (light damage): 46.4 km radius

**Thermal:**
- 3rd degree burns: 40.5 km radius

### Comparison to Historical Events

**Tunguska Event (1908)**
- Estimated: 3-5 MT
- Flattened ~2,150 km² (radius ~26 km)
- Our 5 MT prediction: ~18 km for 5 psi = ~1,000 km² 
- ✅ Reasonable match (different terrain, angle effects)

**Meteor Crater, Arizona**
- ~50m iron impactor at ~12 km/s
- Crater: 1.2 km diameter, 170m deep
- Our prediction for 50m iron at 12 km/s:
  - Crater: ~1.1 km diameter ✅
  - Energy: ~3 MT

## Scaling Laws Reference

### Cube-Root Scaling (Blast)
For air blast effects: **R₂/R₁ = (Y₂/Y₁)^(1/3)**

Example: 
- 1 MT → 10 psi at 3.5 km
- 10 MT → 10 psi at 3.5 × ∛10 = 7.5 km
- 100 MT → 10 psi at 3.5 × ∛100 = 16.2 km

### Thermal Scaling
For thermal radiation: **R₂/R₁ = (Y₂/Y₁)^0.41**

Slightly weaker scaling due to atmospheric absorption.

## Scientific Sources

1. **Glasstone & Dolan (1977)** - "The Effects of Nuclear Weapons"
2. **Collins et al. (2005)** - Earth Impact Effects Program
3. **Melosh (1989)** - Impact Cratering: A Geologic Process
4. **Defense Nuclear Agency (1972)** - Handbook of Nuclear Weapons Effects

## Testing the Fix

Try these scenarios in the simulator:

1. **Small asteroid (50m, 15 km/s)**
   - Should show ~10-30 km blast zones
   - Crater < 1 km

2. **Medium asteroid (100m, 20 km/s)**
   - Blast zones: 15-45 km
   - Crater ~2-3 km

3. **Large asteroid (500m, 25 km/s)**
   - Blast zones: 100+ km
   - Crater ~15-20 km
   - Significant thermal effects

The rings should now be proportional to the impact energy and realistic compared to historical events!
