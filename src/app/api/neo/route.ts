import { NextRequest, NextResponse } from 'next/server';

const NASA_API_BASE = 'https://api.nasa.gov/neo/rest/v1/feed';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    // Use environment variable or fall back to DEMO_KEY
    const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

    const url = `${NASA_API_BASE}?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NASA API error:', response.status, errorText);
      return NextResponse.json(
        { error: `NASA API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Process and simplify the response
    const neos: Array<{
      id: string;
      name: string;
      diameter_m: number;
      date?: string;
      velocity_kps?: number;
      is_hazardous?: boolean;
    }> = [];

    Object.entries(data.near_earth_objects || {}).forEach(([date, objects]: [string, any]) => {
      (objects as any[]).forEach((obj) => {
        const minDiam = obj.estimated_diameter?.meters?.estimated_diameter_min || 0;
        const maxDiam = obj.estimated_diameter?.meters?.estimated_diameter_max || 0;
        const avgDiameter = (minDiam + maxDiam) / 2;

        const velocity = obj.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second
          ? parseFloat(obj.close_approach_data[0].relative_velocity.kilometers_per_second)
          : undefined;

        neos.push({
          id: obj.id,
          name: (obj.name || 'Unknown').replace(/[()]/g, ''),
          diameter_m: avgDiameter,
          date,
          velocity_kps: velocity,
          is_hazardous: obj.is_potentially_hazardous_asteroid || false,
        });
      });
    });

    // Sort by diameter (largest first)
    neos.sort((a, b) => b.diameter_m - a.diameter_m);

    return NextResponse.json(neos);
  } catch (error) {
    console.error('Error in NEO route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
