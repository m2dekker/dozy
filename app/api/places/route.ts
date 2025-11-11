import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { destination, preferences } = await request.json();

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    const googleApiKey = process.env.GOOGLE_API_KEY;

    if (!googleApiKey) {
      // Fallback to generic suggestions if no API key
      console.warn('GOOGLE_API_KEY not configured, using fallback data');
      return NextResponse.json({
        places: generateFallbackPlaces(destination, preferences)
      });
    }

    // Fetch places from Google Places API
    const places = await fetchGooglePlaces(destination, preferences, googleApiKey);

    return NextResponse.json({ places });

  } catch (error: any) {
    console.error('Error fetching places:', error);

    // Fallback to generic suggestions on error
    const { destination, preferences } = await request.json();
    return NextResponse.json({
      places: generateFallbackPlaces(destination, preferences)
    });
  }
}

async function fetchGooglePlaces(
  destination: string,
  preferences: any,
  apiKey: string
) {
  // First, geocode the destination to get coordinates
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`;

  const geocodeResponse = await fetch(geocodeUrl);
  const geocodeData = await geocodeResponse.json();

  if (!geocodeData.results || geocodeData.results.length === 0) {
    throw new Error('Could not find location');
  }

  const location = geocodeData.results[0].geometry.location;

  // Determine what types of places to search for based on preferences
  const types: string[] = [];
  if (preferences.food) types.push('restaurant', 'cafe');
  if (preferences.culture) types.push('museum', 'art_gallery');
  if (preferences.adventure) types.push('park', 'tourist_attraction');
  if (preferences.shopping) types.push('shopping_mall', 'store');
  if (preferences.nightlife) types.push('night_club', 'bar');
  if (preferences.nature) types.push('park', 'natural_feature');
  if (preferences.history) types.push('museum', 'point_of_interest');

  // Default to tourist attractions if no preferences
  if (types.length === 0) {
    types.push('tourist_attraction', 'restaurant');
  }

  // Fetch places for each type (limited to avoid quota issues)
  const allPlaces: any[] = [];

  for (const type of types.slice(0, 3)) { // Limit to 3 types
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&type=${type}&key=${apiKey}`;

    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.results) {
      allPlaces.push(...placesData.results.slice(0, 5)); // 5 per type
    }
  }

  // Format places
  return allPlaces.map(place => ({
    name: place.name,
    address: place.vicinity || place.formatted_address,
    rating: place.rating,
    placeId: place.place_id,
    types: place.types,
    location: place.geometry?.location
  }));
}

function generateFallbackPlaces(destination: string, preferences: any) {
  // Generic fallback suggestions
  const places: any[] = [];

  if (preferences.food) {
    places.push(
      { name: `Local Market in ${destination}`, address: 'City Center', types: ['market', 'food'] },
      { name: `Traditional Restaurant`, address: 'Historic District', types: ['restaurant'] }
    );
  }

  if (preferences.culture) {
    places.push(
      { name: `${destination} Museum`, address: 'Cultural Quarter', types: ['museum'] },
      { name: 'Art Gallery', address: 'Downtown', types: ['art_gallery'] }
    );
  }

  if (preferences.adventure || preferences.nature) {
    places.push(
      { name: 'Central Park', address: destination, types: ['park'] },
      { name: 'Scenic Viewpoint', address: 'Hilltop', types: ['viewpoint'] }
    );
  }

  if (preferences.history) {
    places.push(
      { name: 'Historical Monument', address: 'Old Town', types: ['monument'] },
      { name: 'Heritage Site', address: destination, types: ['heritage'] }
    );
  }

  if (preferences.shopping) {
    places.push(
      { name: 'Shopping District', address: 'Main Street', types: ['shopping'] }
    );
  }

  if (preferences.nightlife) {
    places.push(
      { name: 'Entertainment Quarter', address: 'City Center', types: ['nightlife'] }
    );
  }

  // Add some default attractions
  places.push(
    { name: `${destination} Main Square`, address: 'City Center', types: ['landmark'] },
    { name: 'Waterfront Area', address: 'Harbor', types: ['scenic'] }
  );

  return places.slice(0, 15); // Limit to 15 places
}
