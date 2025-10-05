import { NextRequest, NextResponse } from 'next/server';
import { nasaApi } from '@/lib/services/nasaApi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Default to last 3 days if no dates provided
    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);
    
    const defaultStartDate = startDate || threeDaysAgo.toISOString().split('T')[0];
    const defaultEndDate = endDate || now.toISOString().split('T')[0];
    
    const neoData = await nasaApi.getNeoFeed(defaultStartDate, defaultEndDate);
    
    // Flatten the data and add useful computed properties
    const asteroids = [];
    for (const [date, neos] of Object.entries(neoData.near_earth_objects)) {
      for (const neo of neos) {
        // Get the closest approach data
        const closestApproach = neo.close_approach_data[0];
        if (!closestApproach) continue;
        
        // Calculate average diameter in meters
        const avgDiameter = (
          neo.estimated_diameter.kilometers.estimated_diameter_min +
          neo.estimated_diameter.kilometers.estimated_diameter_max
        ) / 2 * 1000; // Convert to meters
        
        // Extract velocity in km/s
        const velocity = parseFloat(closestApproach.relative_velocity.kilometers_per_second);
        
        asteroids.push({
          id: neo.id,
          name: neo.name,
          date: date,
          size: Math.round(avgDiameter),
          velocity: Math.round(velocity * 10) / 10, // Round to 1 decimal
          isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
          absoluteMagnitude: neo.absolute_magnitude_h,
          missDistance: {
            kilometers: parseInt(closestApproach.miss_distance.kilometers),
            lunar: parseFloat(closestApproach.miss_distance.lunar)
          },
          closeApproachDate: closestApproach.close_approach_date,
          orbitingBody: closestApproach.orbiting_body
        });
      }
    }
    
    // Sort by size (largest first) and limit to reasonable number
    asteroids.sort((a, b) => b.size - a.size);
    
    return NextResponse.json({
      success: true,
      count: asteroids.length,
      asteroids: asteroids.slice(0, 50), // Limit to 50 asteroids
      dateRange: {
        start: defaultStartDate,
        end: defaultEndDate
      }
    });
    
  } catch (error) {
    console.error('Error fetching NEO data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch NEO data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}