import axios from 'axios';

// NASA API configuration
const NASA_API_BASE = 'https://api.nasa.gov';
const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY';

// Types for NASA NEO API responses
export interface NeoData {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_second: string;
      kilometers_per_hour: string;
    };
    miss_distance: {
      astronomical: string;
      lunar: string;
      kilometers: string;
    };
    orbiting_body: string;
  }>;
  orbital_data?: {
    orbit_id: string;
    orbit_determination_date: string;
    first_observation_date: string;
    last_observation_date: string;
    data_arc_in_days: number;
    observations_used: number;
    orbit_uncertainty: string;
    minimum_orbit_intersection: string;
    jupiter_tisserand_invariant: string;
    epoch_osculation: string;
    eccentricity: string;
    semi_major_axis: string;
    inclination: string;
    ascending_node_longitude: string;
    orbital_period: string;
    perihelion_distance: string;
    perihelion_argument: string;
    aphelion_distance: string;
    perihelion_time: string;
    mean_anomaly: string;
    mean_motion: string;
  };
}

export interface NeoFeedResponse {
  links: {
    next?: string;
    prev?: string;
    self: string;
  };
  element_count: number;
  near_earth_objects: {
    [date: string]: NeoData[];
  };
}

export class NasaApiService {
  private static instance: NasaApiService;
  
  public static getInstance(): NasaApiService {
    if (!NasaApiService.instance) {
      NasaApiService.instance = new NasaApiService();
    }
    return NasaApiService.instance;
  }
  
  /**
   * Fetch Near-Earth Objects for a date range
   */
  async getNeoFeed(startDate?: string, endDate?: string): Promise<NeoFeedResponse> {
    try {
      const params = {
        api_key: API_KEY,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      };
      
      const response = await axios.get(`${NASA_API_BASE}/neo/rest/v1/feed`, {
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching NEO feed:', error);
      throw new Error('Failed to fetch Near-Earth Objects data');
    }
  }
  
  /**
   * Get detailed information about a specific NEO
   */
  async getNeoDetails(asteroidId: string): Promise<NeoData> {
    try {
      const response = await axios.get(
        `${NASA_API_BASE}/neo/rest/v1/neo/${asteroidId}`,
        {
          params: { api_key: API_KEY }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching NEO details:', error);
      throw new Error('Failed to fetch asteroid details');
    }
  }
  
  /**
   * Get potentially hazardous asteroids
   */
  async getHazardousAsteroids(page = 0, size = 20): Promise<{
    links: Record<string, unknown>;
    page: Record<string, unknown>;
    near_earth_objects: NeoData[];
  }> {
    try {
      const response = await axios.get(
        `${NASA_API_BASE}/neo/rest/v1/neo/browse`,
        {
          params: {
            api_key: API_KEY,
            page,
            size
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching hazardous asteroids:', error);
      throw new Error('Failed to fetch potentially hazardous asteroids');
    }
  }
  
  /**
   * Search for asteroids by name or designation
   */
  async searchAsteroids(query: string): Promise<NeoData[]> {
    try {
      // Note: This would need to be implemented using the browse endpoint
      // and filtering results, as NASA doesn't provide a direct search API
      const response = await this.getHazardousAsteroids(0, 100);
      
      return response.near_earth_objects.filter(neo => 
        neo.name.toLowerCase().includes(query.toLowerCase()) ||
        neo.id.includes(query)
      );
    } catch (error) {
      console.error('Error searching asteroids:', error);
      throw new Error('Failed to search asteroids');
    }
  }
}

// Export singleton instance
export const nasaApi = NasaApiService.getInstance();