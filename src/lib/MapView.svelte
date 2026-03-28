<script>
  import { onMount } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { friends, venues, centroid, mode, apiKey, fetchRoutes } from './stores.svelte.js';
  import { t } from './i18n.svelte.js';

  let { selectedVenue = $bindable(null), sidebarOpen = true } = $props();

  let mapContainer;
  let map;
  let friendMarkers = [];
  let venueMarkers = [];
  let centroidMarker = null;
  let routeLayers = [];
  let routeVersion = 0;

  const friendColors = ['#FF6B6B', '#A8E6CF', '#84C5F4', '#DCD6F7', '#FFD93D', '#FF8CC8', '#6BCB77', '#C4A1FF'];

  function createFriendIcon(index) {
    const color = friendColors[index % friendColors.length];
    return L.divIcon({
      html: `<div style="
        background: ${color};
        width: 32px; height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: bold; font-size: 13px;
        font-family: 'Inter', sans-serif;
      ">${index + 1}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -20],
      className: '',
    });
  }

  function createVenueIcon(rank) {
    const emoji = mode.value === 'restaurant' ? '🍽️' : '🍸';
    return L.divIcon({
      html: `<div style="
        background: white;
        width: 36px; height: 36px;
        border-radius: 12px;
        border: 2px solid #FF6B6B;
        box-shadow: 0 3px 12px rgba(255,107,107,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 18px;
        position: relative;
      ">${emoji}<span style="
        position: absolute; top: -6px; right: -6px;
        background: #FF6B6B; color: white;
        width: 18px; height: 18px; border-radius: 50%;
        font-size: 10px; font-weight: bold;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Inter', sans-serif;
        border: 2px solid white;
      ">${rank}</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -22],
      className: '',
    });
  }

  const centroidIcon = L.divIcon({
    html: `<div style="
      width: 20px; height: 20px;
      background: #FF6B6B;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(255,107,107,0.3), 0 2px 8px rgba(0,0,0,0.2);
      animation: pulse-ring 2s ease-out infinite;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: '',
  });

  onMount(() => {
    map = L.map(mapContainer, {
      zoomControl: false,
    }).setView([48.8566, 2.3522], 12);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    return () => map.remove();
  });

  $effect(() => {
    sidebarOpen;
    if (!map) return;
    setTimeout(() => map.invalidateSize(), 50);
  });

  $effect(() => {
    if (!map) return;

    friendMarkers.forEach(m => map.removeLayer(m));
    friendMarkers = [];

    friends.list.forEach((f, i) => {
      const marker = L.marker([f.lat, f.lng], { icon: createFriendIcon(i) })
        .addTo(map)
        .bindPopup(`<div class="friend-popup">${f.name}<br/><span style="font-weight:400;font-size:12px;color:#6B7280">${f.displayName.split(',').slice(0, 2).join(',')}</span></div>`);
      friendMarkers.push(marker);
    });

    if (friends.list.length > 0) {
      const group = L.featureGroup(friendMarkers);
      map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 14 });
    }
  });

  $effect(() => {
    if (!map) return;

    if (centroidMarker) map.removeLayer(centroidMarker);
    centroidMarker = null;

    if (centroid.lat !== null && friends.list.length >= 2) {
      centroidMarker = L.marker([centroid.lat, centroid.lng], { icon: centroidIcon })
        .addTo(map)
        .bindPopup(`<div class="friend-popup">${t('map.meetingPoint')}</div>`);
    }
  });

  $effect(() => {
    if (!map) return;

    venueMarkers.forEach(m => map.removeLayer(m));
    venueMarkers = [];

    venues.list.forEach((v, i) => {
      const marker = L.marker([v.lat, v.lon], { icon: createVenueIcon(i + 1) })
        .addTo(map)
        .bindPopup(`
          <div>
            <div class="venue-popup-name">${v.name}</div>
            ${v.cuisine ? `<div class="venue-popup-type">${v.cuisine.replace(/;/g, ', ')}</div>` : ''}
            <div class="venue-popup-distance">~${Math.round(v.avgDistance)}m ${t('map.avg')}</div>
          </div>
        `);
      marker.on('click', () => { selectedVenue = v; });
      venueMarkers.push(marker);
    });
  });

  function clearRoutes() {
    routeLayers.forEach(l => map.removeLayer(l));
    routeLayers = [];
  }

  function drawRoutes(venue) {
    if (!map || !venue) return;
    clearRoutes();
    if (!apiKey.value) return;
    const version = ++routeVersion;

    map.flyTo([venue.lat, venue.lon], 15, { duration: 0.8 });

    fetchRoutes(venue).then(routes => {
      if (routeVersion !== version) return;
      clearRoutes();
      routes.forEach((coords, i) => {
        const latLngs = coords.map(([lng, lat]) => [lat, lng]);
        const color = friendColors[i % friendColors.length];
        const outline = L.polyline(latLngs, {
          color: '#ffffff',
          weight: 7,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
        const line = L.polyline(latLngs, {
          color,
          weight: 4,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
        routeLayers.push(outline, line);
      });

      const allPoints = routes.flatMap(coords => coords.map(([lng, lat]) => [lat, lng]));
      if (allPoints.length > 0) {
        map.fitBounds(L.latLngBounds(allPoints).pad(0.15), { maxZoom: 16 });
      }
    }).catch(err => {
      console.error('Failed to fetch routes:', err);
    });
  }

  $effect(() => {
    if (!map) return;
    if (!selectedVenue) {
      clearRoutes();
      return;
    }
    drawRoutes(selectedVenue);
  });
</script>

<div bind:this={mapContainer} class="w-full h-full rounded-2xl"></div>

<style>
  @keyframes pulse-ring {
    0% { box-shadow: 0 0 0 3px rgba(255,107,107,0.3), 0 2px 8px rgba(0,0,0,0.2); }
    70% { box-shadow: 0 0 0 12px rgba(255,107,107,0), 0 2px 8px rgba(0,0,0,0.2); }
    100% { box-shadow: 0 0 0 3px rgba(255,107,107,0), 0 2px 8px rgba(0,0,0,0.2); }
  }
</style>
