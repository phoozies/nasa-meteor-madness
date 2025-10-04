import axios from 'axios';

// USGS API configuration
const USGS_EARTHQUAKE_API = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
const USGS_ELEVATION_API = 'https://nationalmap.gov/epqs/pqs.php';

// Types for USGS data
export interface EarthquakeData {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: Array<{
    type: string;
    properties: {
      mag: number;
      place: string;
      time: number;
      updated: number;
      tz: number;
      url: string;
      detail: string;
      felt?: number;
      cdi?: number;
      mmi?: number;
      alert?: string;
      status: string;
      tsunami: number;
      sig: number;
      net: string;
      code: string;
      ids: string;
      sources: string;
      types: string;
      nst?: number;
      dmin?: number;
      rms: number;
      gap?: number;
      magType: string;
      type: string;
      title: string;
    };
    geometry: {
      type: string;
      coordinates: [number, number, number]; // [longitude, latitude, depth]
    };
    id: string;
  }>;
}

export interface ElevationData {
  USGS_Elevation_Point_Query_Service: {
    Elevation_Query: {
      x: number;
      y: number;
      Data_Source: string;
      Elevation: number;
      Units: string;
    };
  };
}

export interface TsunamiRiskZone {
  latitude: number;
  longitude: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  elevation: number;
  coastalDistance: number;
}

export class UsgsApiService {
  private static instance: UsgsApiService;
  
  public static getInstance(): UsgsApiService {
    if (!UsgsApiService.instance) {
      UsgsApiService.instance = new UsgsApiService();
    }
    return UsgsApiService.instance;
  }
  
  /**
   * Get recent earthquake data
   */
  async getEarthquakeData(
    starttime?: string,
    endtime?: string,
    minmagnitude = 4.0,
    limit = 1000
  ): Promise<EarthquakeData> {
    try {
      const params = {
        format: 'geojson',
        starttime,
        endtime,
        minmagnitude,
        limit,
        orderby: 'time'
      };
      
      const response = await axios.get(USGS_EARTHQUAKE_API, {
        params: Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined)
        )
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
      throw new Error('Failed to fetch earthquake data');
    }
  }
  
  /**
   * Get elevation data for a specific location
   */
  async getElevation(latitude: number, longitude: number): Promise<number> {
    try {
      const response = await axios.get(USGS_ELEVATION_API, {
        params: {
          x: longitude,
          y: latitude,
          units: 'Meters',
          output: 'json'
        }
      });
      
      return response.data.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation;
    } catch (error) {
      console.error('Error fetching elevation data:', error);
      return 0; // Default to sea level if unable to fetch
    }
  }
  
  /**
   * Assess tsunami risk for coastal areas
   */
  async assessTsunamiRisk(
    latitude: number, 
    longitude: number
  ): Promise<TsunamiRiskZone> {
    try {
      const elevation = await this.getElevation(latitude, longitude);
      
      // Simple tsunami risk assessment based on elevation and coastal proximity
      // In a real implementation, you'd use more sophisticated coastal databases
      const coastalDistance = this.estimateCoastalDistance(latitude, longitude);
      
      let riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
      
      if (elevation < 5 && coastalDistance < 10) {
        riskLevel = 'Extreme';
      } else if (elevation < 20 && coastalDistance < 50) {
        riskLevel = 'High';
      } else if (elevation < 50 && coastalDistance < 100) {
        riskLevel = 'Medium';
      } else {
        riskLevel = 'Low';
      }
      
      return {
        latitude,
        longitude,
        riskLevel,
        elevation,
        coastalDistance
      };
    } catch (error) {
      console.error('Error assessing tsunami risk:', error);
      return {
        latitude,
        longitude,
        riskLevel: 'Low',
        elevation: 0,
        coastalDistance: 1000
      };
    }
  }
  
  /**
   * Estimate distance to nearest coastline (simplified)
   */
  private estimateCoastalDistance(latitude: number, longitude: number): number {
    // Simplified coastal distance estimation
    // In a real implementation, you'd use a proper coastal database
    
    // Major ocean boundaries (very simplified)
    const coastalBoundaries = [
      { name: 'Pacific', minLng: -180, maxLng: -30, minLat: -90, maxLat: 90 },
      { name: 'Atlantic', minLng: -80, maxLng: 20, minLat: -90, maxLat: 90 },
      { name: 'Indian', minLng: 20, maxLng: 150, minLat: -90, maxLat: 30 }
    ];
    
    // Very rough estimation - would need proper geodetic calculations
    let minDistance = 1000;
    
    coastalBoundaries.forEach(boundary => {
      if (latitude >= boundary.minLat && latitude <= boundary.maxLat &&
          longitude >= boundary.minLng && longitude <= boundary.maxLng) {
        // Rough distance calculation (simplified)
        const distToEdge = Math.min(
          Math.abs(longitude - boundary.minLng),
          Math.abs(longitude - boundary.maxLng),
          Math.abs(latitude - boundary.minLat),
          Math.abs(latitude - boundary.maxLat)
        ) * 111; // Rough km per degree
        
        minDistance = Math.min(minDistance, distToEdge);
      }
    });
    
    return minDistance;
  }
}

// Export singleton instance
export const usgsApi = UsgsApiService.getInstance();