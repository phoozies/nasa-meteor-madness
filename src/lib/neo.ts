/**
 * NASA NEO (Near Earth Object) API helpers
 */

export type NeoFeed = {
  near_earth_objects: {
    [date: string]: NeoObject[];
  };
};

export type NeoObject = {
  id: string;
  name: string;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_second: string;
    };
  }>;
  is_potentially_hazardous_asteroid: boolean;
};

export type Neo = {
  id: string;
  name: string;
  diameter_m: number;
  date?: string;
  velocity_kps?: number;
  is_hazardous?: boolean;
};

/**
 * Fetch NEOs from NASA API via our proxy endpoint
 */
export async function fetchNeoFeed(
  startDate: string,
  endDate: string
): Promise<Neo[]> {
  try {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });

    const response = await fetch(`/api/neo?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch NEO data: ${response.status} - ${errorText}`);
    }

    const data: Neo[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching NEO data:', error);
    throw error;
  }
}

/**
 * Process raw NASA API response into simplified Neo objects
 */
export function processNeoFeed(feed: NeoFeed): Neo[] {
  const neos: Neo[] = [];

  Object.entries(feed.near_earth_objects).forEach(([date, objects]) => {
    objects.forEach((obj) => {
      const minDiam = obj.estimated_diameter.meters.estimated_diameter_min;
      const maxDiam = obj.estimated_diameter.meters.estimated_diameter_max;
      const avgDiameter = (minDiam + maxDiam) / 2;

      const velocity = obj.close_approach_data[0]
        ? parseFloat(obj.close_approach_data[0].relative_velocity.kilometers_per_second)
        : undefined;

      neos.push({
        id: obj.id,
        name: obj.name.replace(/[()]/g, ''), // Clean up name
        diameter_m: avgDiameter,
        date,
        velocity_kps: velocity,
        is_hazardous: obj.is_potentially_hazardous_asteroid,
      });
    });
  });

  // Sort by diameter (largest first)
  return neos.sort((a, b) => b.diameter_m - a.diameter_m);
}

/**
 * Format date for NASA API (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get default date range (today and next 7 days)
 */
export function getDefaultDateRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);

  return {
    startDate: formatDateForAPI(today),
    endDate: formatDateForAPI(endDate),
  };
}
