<script>
  import AddressInput from './lib/AddressInput.svelte';
  import FriendList from './lib/FriendList.svelte';
  import ModeToggle from './lib/ModeToggle.svelte';
  import VenueList from './lib/VenueList.svelte';
  import MapView from './lib/MapView.svelte';
  import GroupManager from './lib/GroupManager.svelte';
  import { friends, venues, mode, ranking, unit, apiKey, setApiKey, tooFarApart, MAX_DISTANCE, MAX_ADDRESSES, searchVenues, rerankVenues, formatMaxDistance } from './lib/stores.svelte.js';

  let selectedVenue = $state(null);
  let sidebarOpen = $state(true);
  let showSettings = $state(false);
  let keyInput = $state(apiKey.value);

  function handleSelectVenue(venue) {
    selectedVenue = venue;
  }
</script>

<div class="h-screen flex flex-col overflow-hidden bg-warm-white">
  <!-- Header -->
  <header class="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10">
    <div class="flex items-center gap-3">
      <span class="text-3xl">📍</span>
      <div>
        <h1 class="text-xl font-display font-bold italic text-dark leading-tight">Rendez-vous</h1>
        <p class="text-xs text-medium">Find the perfect meeting spot</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="flex bg-warm-gray rounded-lg p-0.5 gap-0.5">
        <button
          onclick={() => unit.value = 'km'}
          class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer border-none {unit.value === 'km' ? 'bg-white shadow-sm text-coral' : 'bg-transparent text-medium hover:text-dark'}"
        >km</button>
        <button
          onclick={() => unit.value = 'mi'}
          class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer border-none {unit.value === 'mi' ? 'bg-white shadow-sm text-coral' : 'bg-transparent text-medium hover:text-dark'}"
        >mi</button>
      </div>
      <button
        onclick={() => showSettings = !showSettings}
        class="px-2.5 py-1 rounded-lg text-sm cursor-pointer border-none transition-colors {showSettings ? 'bg-coral/10 text-coral' : 'bg-warm-gray text-medium hover:text-dark'}"
        title="Settings"
      >
        {apiKey.value ? '🔑' : '⚙️'}
      </button>
      <button
        onclick={() => sidebarOpen = !sidebarOpen}
        class="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-warm-gray text-dark text-sm font-semibold cursor-pointer border-none"
      >
        {sidebarOpen ? '🗺️ Map' : '📋 List'}
      </button>
    </div>
  </header>

  <!-- Settings bar -->
  {#if showSettings}
    <div class="px-6 py-3 bg-warm-gray/50 border-b border-gray-100 flex items-center gap-3 animate-fade-in">
      <label class="text-xs font-semibold text-dark whitespace-nowrap" for="ors-key">ORS API Key</label>
      <input
        id="ors-key"
        type="password"
        bind:value={keyInput}
        onchange={() => setApiKey(keyInput.trim())}
        placeholder="Paste your OpenRouteService key..."
        class="flex-1 bg-white rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-dark placeholder:text-light outline-none focus:border-coral/30 max-w-md"
      />
      {#if apiKey.value}
        <span class="text-xs text-mint font-semibold">Active</span>
      {:else}
        <a href="https://openrouteservice.org/dev/#/signup" target="_blank" rel="noopener" class="text-xs text-coral hover:underline whitespace-nowrap">Get a free key</a>
      {/if}
    </div>
  {/if}

  <!-- Main content -->
  <div class="flex-1 flex overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col bg-warm-white border-r border-gray-100 overflow-hidden transition-transform duration-300 {sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} {sidebarOpen ? 'absolute md:relative inset-0 top-auto z-20 h-[calc(100vh-73px)] md:h-auto' : 'absolute md:relative -left-full md:left-0'}"
    >
      <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        <!-- Search -->
        <div>
          <h2 class="text-sm font-bold text-dark mb-2 flex items-center gap-2">
            <span>👥</span> Who's coming?
          </h2>
          <AddressInput />
        </div>

        <!-- Friend list -->
        <FriendList />

        <!-- Groups -->
        <div>
          <h2 class="text-sm font-bold text-dark mb-2 flex items-center gap-2">
            <span>💾</span> Saved groups
          </h2>
          <GroupManager />
        </div>

        <!-- Too far apart warning -->
        {#if tooFarApart.value}
          <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 animate-fade-in">
            <span class="text-lg">⚠️</span>
            <p class="text-sm text-amber-800">
              Some friends are more than {formatMaxDistance()} apart. Add closer addresses to find a meeting spot.
            </p>
          </div>
        {/if}

        <!-- Mode toggle -->
        {#if friends.list.length >= 2 && !tooFarApart.value}
          <div class="animate-fade-in">
            <h2 class="text-sm font-bold text-dark mb-2 flex items-center gap-2">
              <span>🎯</span> What are you looking for?
            </h2>
            <ModeToggle />
          </div>

          <!-- Ranking toggle -->
          <div class="animate-fade-in">
            <h2 class="text-sm font-bold text-dark mb-2 flex items-center gap-2">
              <span>⚖️</span> Rank by
            </h2>
            <div class="flex bg-warm-gray rounded-xl p-1 gap-1">
              <button
                onclick={() => { ranking.value = 'equidistant'; rerankVenues(); }}
                class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer border-none {ranking.value === 'equidistant' ? 'bg-white shadow-sm text-coral' : 'bg-transparent text-medium hover:text-dark'}"
              >
                <span class="text-lg">📏</span>
                Distance
              </button>
              <button
                onclick={() => { if (!apiKey.value) { showSettings = true; return; } ranking.value = 'walking'; rerankVenues(); }}
                class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 border-none {!apiKey.value ? 'bg-transparent text-light cursor-default' : ranking.value === 'walking' ? 'bg-white shadow-sm text-coral cursor-pointer' : 'bg-transparent text-medium hover:text-dark cursor-pointer'}"
              >
                <span class="text-lg">🚶</span>
                Walk time
                {#if !apiKey.value}
                  <span class="text-[10px] text-light">🔑</span>
                {/if}
              </button>
            </div>
          </div>
        {/if}

        <!-- Results -->
        {#if friends.list.length >= 2 && !tooFarApart.value}
          <div class="animate-fade-in">
            <h2 class="text-sm font-bold text-dark mb-2 flex items-center gap-2">
              <span>{mode.value === 'restaurant' ? '🍽️' : '🍸'}</span>
              Best spots
              {#if venues.list.length > 0}
                <span class="text-xs font-normal text-medium">({venues.list.length} found)</span>
              {/if}
            </h2>
            <VenueList onSelectVenue={handleSelectVenue} selectedVenueId={selectedVenue?.id} />
          </div>
        {/if}

        <!-- Empty state -->
        {#if friends.list.length === 0}
          <div class="flex-1 flex flex-col items-center justify-center text-center py-8 animate-fade-in">
            <div class="text-6xl mb-4 animate-bounce-slow">🤝</div>
            <h3 class="text-lg font-bold text-dark mb-1">Where shall we meet?</h3>
            <p class="text-sm text-medium max-w-[260px]">
              Start by adding your friends' addresses above. We'll find the fairest meeting spot for everyone!
            </p>
          </div>
        {/if}
      </div>
    </aside>

    <!-- Map -->
    <main class="flex-1 relative">
      <MapView bind:selectedVenue />

      <!-- Floating info -->
      {#if friends.list.length >= 2 && venues.list.length > 0}
        <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-gray-100 animate-fade-in">
          <p class="text-xs text-medium">
            <span class="font-bold text-coral">{venues.list.length}</span>
            {mode.value === 'restaurant' ? 'restaurants' : 'bars'} found
            · ranked by {ranking.value === 'walking' ? 'walk time' : 'distance'}
          </p>
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 0.4s ease-out;
  }
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  .animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
  }
</style>
