export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function fairnessScore(distances) {
  if (distances.length < 2) return 0;
  const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
  const variance = distances.reduce((s, d) => s + (d - avg) ** 2, 0) / distances.length;
  return Math.sqrt(variance);
}

export function formatDistanceValue(meters, unitType) {
  if (unitType === 'mi') {
    const feet = meters * 3.28084;
    if (feet < 2640) return `${Math.round(feet)}ft`;
    return `${(meters / 1609.344).toFixed(1)}mi`;
  }
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatMaxDistanceValue(maxDistanceKm, unitType) {
  if (unitType === 'mi') return `${(maxDistanceKm / 1.609344).toFixed(1)}mi`;
  return `${maxDistanceKm}km`;
}

export function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

export function computeCentroid(friends) {
  if (friends.length === 0) return null;
  const n = friends.length;
  return {
    lat: friends.reduce((s, f) => s + f.lat, 0) / n,
    lng: friends.reduce((s, f) => s + f.lng, 0) / n,
  };
}

export function checkTooFarApart(friends, maxDistanceKm) {
  for (let i = 0; i < friends.length; i++) {
    for (let j = i + 1; j < friends.length; j++) {
      const d = haversineDistance(friends[i].lat, friends[i].lng, friends[j].lat, friends[j].lng);
      if (d > maxDistanceKm * 1000) return true;
    }
  }
  return false;
}
