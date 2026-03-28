import { ORS_API_KEY, MAX_DISTANCE, MAX_ADDRESSES } from './config.js';
import {
  haversineDistance,
  fairnessScore,
  formatDistanceValue,
  formatMaxDistanceValue,
  computeCentroid,
  checkTooFarApart,
} from './utils.js';

export { MAX_DISTANCE, MAX_ADDRESSES };
export { formatDuration } from './utils.js';

export const apiKey = $state({ value: ORS_API_KEY || sessionStorage.getItem('ors-api-key') || '' });

export function setApiKey(key) {
  apiKey.value = key;
  if (key) {
    sessionStorage.setItem('ors-api-key', key);
  } else {
    sessionStorage.removeItem('ors-api-key');
  }
}

export const unit = $state({ value: 'km' });

export const friends = $state({ list: [] });
export const venues = $state({ list: [], loading: false });
export const mode = $state({ value: 'restaurant' });
export const ranking = $state({ value: 'equidistant' });
export const centroid = $state({ lat: null, lng: null });
export const tooFarApart = $state({ value: false });
export const mapCenter = $state({ lat: 48.8566, lng: 2.3522, zoom: 12 });

let nextId = 1;

export function addFriend(name, lat, lng, displayName) {
  if (friends.list.length >= MAX_ADDRESSES) return false;
  friends.list = [...friends.list, { id: nextId++, name, lat, lng, displayName }];
  recalcCentroid();
  return true;
}

export function removeFriend(id) {
  friends.list = friends.list.filter((f) => f.id !== id);
  recalcCentroid();
}

export function loadFriends(list) {
  friends.list = list.map((f) => ({ ...f, id: nextId++ }));
  recalcCentroid();
}

function recalcCentroid() {
  if (friends.list.length === 0) {
    centroid.lat = null;
    centroid.lng = null;
    tooFarApart.value = false;
    venues.list = [];
    return;
  }
  const c = computeCentroid(friends.list);
  centroid.lat = c.lat;
  centroid.lng = c.lng;

  tooFarApart.value = checkTooFarApart(friends.list, MAX_DISTANCE);
  if (tooFarApart.value) {
    venues.list = [];
  }
}

export function distanceToFriend(venueLat, venueLng, friendLat, friendLng) {
  return haversineDistance(venueLat, venueLng, friendLat, friendLng);
}

export function formatDistance(meters) {
  return formatDistanceValue(meters, unit.value);
}

export function formatMaxDistance() {
  return formatMaxDistanceValue(MAX_DISTANCE, unit.value);
}

async function fetchWalkingDurations(venueLocs) {
  const locations = [...friends.list.map((f) => [f.lng, f.lat]), ...venueLocs.map((v) => [v.lon, v.lat])];
  const sources = friends.list.map((_, i) => i);
  const destinations = venueLocs.map((_, i) => friends.list.length + i);

  const res = await fetch('https://api.openrouteservice.org/v2/matrix/foot-walking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey.value,
    },
    body: JSON.stringify({ locations, sources, destinations, metrics: ['duration'] }),
  });
  if (!res.ok) {
    throw new Error(`ORS API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  // data.durations[friendIdx][venueIdx] in seconds
  return data.durations;
}

export async function fetchRoutes(venue) {
  const routes = await Promise.all(
    friends.list.map(async (f) => {
      const res = await fetch(
        `https://api.openrouteservice.org/v2/directions/foot-walking?start=${f.lng},${f.lat}&end=${venue.lon},${venue.lat}`,
        { headers: { Authorization: apiKey.value } },
      );
      if (!res.ok) throw new Error(`ORS directions error: ${res.status}`);
      const data = await res.json();
      return data.features[0].geometry.coordinates;
    }),
  );
  return routes;
}

let searchTimer = null;
let cachedElements = [];
let cacheKey = '';

export function searchVenues() {
  clearTimeout(searchTimer);
  if (centroid.lat === null || tooFarApart.value) return;
  venues.loading = true;

  const amenity = mode.value === 'restaurant' ? 'restaurant' : 'bar';
  const lat = Math.round(centroid.lat * 1000) / 1000;
  const lng = Math.round(centroid.lng * 1000) / 1000;
  const newKey = `${amenity}:${lat}:${lng}`;

  if (newKey === cacheKey && cachedElements.length > 0) {
    rankAndDisplay(cachedElements);
    return;
  }

  searchTimer = setTimeout(() => _doSearch(amenity, newKey), 600);
}

export function rerankVenues() {
  if (cachedElements.length > 0) {
    venues.loading = true;
    rankAndDisplay(cachedElements);
  }
}

async function rankAndDisplay(elements) {
  try {
    let results;

    if (ranking.value === 'walking' && friends.list.length >= 2 && elements.length > 0) {
      const durations = await fetchWalkingDurations(elements);
      results = elements
        .map((e, vi) => {
          const walkTimes = friends.list.map((_, fi) => durations[fi][vi]);
          return {
            id: e.id,
            name: e.tags.name,
            lat: e.lat,
            lon: e.lon,
            cuisine: e.tags.cuisine || '',
            openingHours: e.tags.opening_hours || '',
            phone: e.tags.phone || '',
            website: e.tags.website || '',
            fairness: fairnessScore(walkTimes),
            avgWalkTime: walkTimes.reduce((a, b) => a + b, 0) / walkTimes.length,
            walkTimes,
            avgDistance:
              friends.list.reduce((s, f) => s + haversineDistance(e.lat, e.lon, f.lat, f.lng), 0) / friends.list.length,
          };
        })
        .sort((a, b) => a.fairness - b.fairness);
    } else {
      results = elements
        .map((e) => {
          const distances = friends.list.map((f) => haversineDistance(e.lat, e.lon, f.lat, f.lng));
          return {
            id: e.id,
            name: e.tags.name,
            lat: e.lat,
            lon: e.lon,
            cuisine: e.tags.cuisine || '',
            openingHours: e.tags.opening_hours || '',
            phone: e.tags.phone || '',
            website: e.tags.website || '',
            fairness: fairnessScore(distances),
            avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
          };
        })
        .sort((a, b) => a.fairness - b.fairness);
    }

    venues.list = results;
  } catch (err) {
    console.error('Ranking failed:', err);
  } finally {
    venues.loading = false;
  }
}

async function _doSearch(amenity, key) {
  venues.list = [];

  const radius = 2000;
  const query = `
    [out:json][timeout:10];
    nwr["amenity"="${amenity}"](around:${radius},${centroid.lat},${centroid.lng});
    out center 30;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!res.ok) {
      throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    cachedElements = data.elements
      .filter((e) => e.tags && e.tags.name)
      .map((e) => ({
        ...e,
        lat: e.lat ?? e.center?.lat,
        lon: e.lon ?? e.center?.lon,
      }))
      .filter((e) => e.lat != null && e.lon != null);
    cacheKey = key;

    await rankAndDisplay(cachedElements);
  } catch (err) {
    console.error('Overpass query failed:', err);
    venues.list = [];
    venues.loading = false;
  }
}
