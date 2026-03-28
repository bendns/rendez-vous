<script>
  import { venues, friends, ranking, formatDistance, formatDuration, distanceToFriend } from './stores.svelte.js';
  import { t } from './i18n.svelte.js';

  let { onSelectVenue = () => {}, selectedVenueId = null } = $props();

  const friendColors = ['#FF6B6B', '#A8E6CF', '#84C5F4', '#DCD6F7', '#FFD93D', '#FF8CC8', '#6BCB77', '#C4A1FF'];

  function avgDistanceLabel(venue) {
    return formatDistance(venue.avgDistance);
  }

  function maxDistanceSpread(venue) {
    if (friends.list.length < 2) return '';
    const distances = friends.list.map(f => {
      const R = 6371000;
      const toRad = d => d * Math.PI / 180;
      const dLat = toRad(f.lat - venue.lat);
      const dLng = toRad(f.lng - venue.lon);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(venue.lat)) * Math.cos(toRad(f.lat)) * Math.sin(dLng/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    });
    const max = Math.max(...distances);
    const min = Math.min(...distances);
    return formatDistance(max - min);
  }
</script>

<div class="flex flex-col gap-2">
  {#if venues.loading}
    <div class="flex flex-col items-center justify-center py-8 gap-3">
      <div class="w-8 h-8 border-3 border-coral/20 border-t-coral rounded-full animate-spin"></div>
      <p class="text-sm text-medium">{t('venues.searching')}</p>
    </div>
  {:else if venues.list.length > 0}
    {#each venues.list as venue, i (venue.id)}
      <button
        onclick={() => onSelectVenue(venue)}
        class="text-left bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 cursor-pointer group animate-fade-up {selectedVenueId === venue.id ? 'border-coral/40 shadow-md ring-1 ring-coral/20' : 'border-gray-50 hover:shadow-md hover:border-coral/20'}"
        style="animation-delay: {i * 60}ms"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-white bg-coral w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <h3 class="text-sm font-bold text-dark truncate">{venue.name}</h3>
            </div>
            {#if venue.cuisine}
              <p class="text-xs text-medium mt-1 ml-7 capitalize">{venue.cuisine.replace(/;/g, ', ')}</p>
            {/if}
          </div>
          <div class="text-right shrink-0">
            {#if ranking.value === 'walking' && venue.avgWalkTime}
              <p class="text-xs font-semibold text-coral">~{formatDuration(venue.avgWalkTime)}</p>
              <p class="text-[10px] text-light">{t('venues.avgWalk')}</p>
            {:else}
              <p class="text-xs font-semibold text-coral">~{avgDistanceLabel(venue)}</p>
              <p class="text-[10px] text-light">{t('venues.avgDistance')}</p>
            {/if}
          </div>
        </div>

        {#if friends.list.length >= 2}
          <div class="mt-2 ml-7 flex items-center gap-2">
            <div class="flex-1 h-1.5 bg-warm-gray rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-mint to-coral rounded-full transition-all duration-500"
                style="width: {Math.max(5, 100 - (venue.fairness / 10))}%"
              ></div>
            </div>
            <span class="text-[10px] text-light whitespace-nowrap">±{maxDistanceSpread(venue)}</span>
          </div>

          {#if selectedVenueId === venue.id}
            <div class="mt-3 ml-5 sm:ml-7 flex flex-col gap-1.5 animate-fade-in">
              {#each friends.list as friend, fi}
                {@const d = distanceToFriend(venue.lat, venue.lon, friend.lat, friend.lng)}
                {@const walkTime = venue.walkTimes?.[fi]}
                <div class="flex items-center gap-2">
                  <div
                    class="w-4 h-4 rounded-full shrink-0"
                    style="background-color: {friendColors[fi % friendColors.length]}"
                  ></div>
                  <span class="text-xs text-dark flex-1 truncate">{friend.name}</span>
                  <span class="text-xs font-semibold text-medium">
                    {formatDistance(d)}
                    {#if ranking.value === 'walking' && walkTime}
                      · {formatDuration(walkTime)}
                    {/if}
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </button>
    {/each}
  {:else if friends.list.length >= 2}
    <div class="text-center py-8">
      <p class="text-4xl mb-2">🔍</p>
      <p class="text-sm text-medium">{t('venues.noResults')}<br/>{t('venues.noResultsHint')}</p>
    </div>
  {:else}
    <div class="text-center py-8">
      <p class="text-4xl mb-2">👋</p>
      <p class="text-sm text-medium">{t('venues.needMore')}<br/>{t('venues.needMoreHint')}</p>
    </div>
  {/if}
</div>

<style>
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-up {
    animation: fade-up 0.3s ease-out both;
  }
</style>
