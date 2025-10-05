# Impact Visualization Features

## Overview
Enhanced the asteroid impact simulation to display comprehensive visual effects on the 2D map, showing crater formation, explosion zones, wind speeds, shockwaves, and seismic effects.

## Features Implemented

### 1. **Crater Visualization**
- **Visual Display**: Dark blue circle showing the impact crater
- **Details**: Shows both diameter and depth
- **Calculation**: Based on impact energy and angle
- **Interactive**: Click on crater to see dimensions

### 2. **Fireball/Explosion Zone**
- **Visual Display**: Bright orange-red circle at impact point
- **Description**: Immediate vaporization zone
- **Size**: Approximately 80% of crater diameter
- **Effect**: Complete destruction and vaporization

### 3. **Blast/Wind Zones** (4 zones)
Multiple concentric rings showing different overpressure zones:

#### Extreme Blast Zone (Dark Red)
- **Overpressure**: 10 psi
- **Wind Speed**: ~470 mph
- **Effects**: Complete destruction of all structures
- **Color**: Dark red (#7f1d1d)

#### Severe Blast Zone (Red)
- **Overpressure**: 5 psi
- **Wind Speed**: ~300 mph
- **Effects**: Severe structural damage
- **Color**: Red (#dc2626)

#### Moderate Blast Zone (Orange)
- **Overpressure**: 3 psi
- **Wind Speed**: ~190 mph
- **Effects**: Moderate building damage
- **Color**: Orange (#f97316)

#### Light Blast Zone (Yellow)
- **Overpressure**: 1 psi
- **Wind Speed**: ~100 mph
- **Effects**: Windows shattered, light damage
- **Color**: Yellow (#fbbf24)

### 4. **Thermal Radiation Zone**
- **Visual Display**: Red translucent circle
- **Effect**: Third-degree burns
- **Range**: Calculated based on impact energy
- **Color**: Red (#dc2626)

### 5. **Seismic Effects Zone**
- **Visual Display**: Purple translucent circle
- **Effect**: Earthquake damage
- **Magnitude**: Calculated using Richter scale
- **Range**: Extends beyond blast zones for large impacts
- **Color**: Purple (#8b5cf6)

## Interactive Features

### Map Interactions
1. **Click to Set Impact Point**: Click anywhere on the map to set where the asteroid hits
2. **Hover Labels**: Hover over any zone to see its name
3. **Click for Details**: Click on any zone to see detailed information
4. **Impact Marker**: Red marker shows exact impact coordinates

### Legend
- **Auto-generated**: Shows all active impact zones
- **Color-coded**: Each zone has its distinctive color
- **Descriptions**: Shows effect descriptions
- **Scrollable**: Can handle multiple zones

## Results Dashboard

Five key metrics displayed after simulation:

1. **Impact Energy**: Megatons of TNT equivalent
2. **Crater Size**: Diameter (km) and depth (km)
3. **Seismic Effects**: Earthquake magnitude (Richter scale)
4. **Peak Wind Speed**: Maximum wind speed (mph) at impact zone
5. **Affected Area**: Total area affected (km²)

## Technical Details

### API Enhancements (`/api/simulate/route.ts`)
- Integrated `ImpactPhysics` class for accurate calculations
- Returns detailed zone information with labels and descriptions
- Calculates wind speeds based on overpressure
- Computes seismic magnitude using established formulas

### Map Component (`MapViewLeaflet.tsx`)
- Enhanced GeoJSON rendering with popups and tooltips
- Legend display with color coding
- Interactive zone information
- Proper styling for different effect types

### Simulation Page (`page.tsx`)
- Toggle between 3D globe and 2D map views
- Enhanced results state to track all metrics
- Conditional simulation for 2D mode with detailed calculations
- Responsive layout with 5 metric cards

## Usage

1. **Select Mode**: Choose between 3D Globe or 2D Map view
2. **Set Parameters**: Adjust asteroid size, velocity, angle, and composition
3. **Set Impact Point**: Click on the map to choose impact location (2D mode only)
4. **Run Simulation**: Click "Run Simulation" to see all effects
5. **Explore Results**: 
   - View colored zones on the map
   - Check the legend for zone descriptions
   - Click zones for detailed information
   - Review metrics in the results cards below

## Scientific Basis

All calculations are based on:
- **Impact Physics**: Scaling laws from Melosh (1989) and Collins et al. (2005)
- **Crater Formation**: Energy-based diameter and depth calculations
- **Overpressure**: Cube-root scaling for blast effects
- **Thermal Radiation**: Based on Glasstone & Dolan (1977)
- **Seismic Effects**: Schultz & Gault (1975) empirical relationships
- **Wind Speeds**: Correlated with overpressure zones

## Future Enhancements

Potential additions:
- Animation of shockwave propagation
- Time-based damage progression
- Population impact estimates
- 3D visualization of crater profile
- Comparison with historical impacts
- Debris field visualization
- Tsunami modeling (for ocean impacts)
