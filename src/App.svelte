<script>
  import AddressInput from './lib/AddressInput.svelte';
  import FriendList from './lib/FriendList.svelte';
  import ModeToggle from './lib/ModeToggle.svelte';
  import VenueList from './lib/VenueList.svelte';
  import MapView from './lib/MapView.svelte';
  import GroupManager from './lib/GroupManager.svelte';
  import { friends, venues, mode, ranking, unit, apiKey, setApiKey, tooFarApart, MAX_DISTANCE, MAX_ADDRESSES, searchVenues, rerankVenues, formatMaxDistance } from './lib/stores.svelte.js';
  import { t, locale, locales, localeLabels, setLocale } from './lib/i18n.js';

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
  <header class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10">
    <div class="flex items-center gap-2 sm:gap-3">
      <span class="text-2xl sm:text-3xl">📍</span>
      <div>
        <h1 class="text-lg sm:text-xl font-display font-bold italic text-dark leading-tight">{t('app.title')}</h1>
        <p class="text-xs text-medium hidden sm:block">{t('app.subtitle')}</p>
      </div>
    </div>
    <div class="flex items-center gap-1.5 sm:gap-2">
      <!-- Language selector -->
      <div class="flex bg-warm-gray rounded-lg p-0.5 gap-0.5">
        {#each locales as lang}
          <button
            onclick={() => setLocale(lang)}
            class="px-1.5 sm:px-2 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer border-none {locale.value === lang ? 'bg-white shadow-sm text-coral' : 'bg-transparent text-medium hover:text-dark'}"
          >{localeLabels[lang]}</button>
        {/each}
      </div>
      <!-- Unit selector -->
      <div class="flex bg-warm-gray rounded-lg p-0.5 gap-0.5">
        <button
          onclick={() => unit.value = 'km'}
          class="px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer border-none {unit.value === 'km' ? 'bg-white shadow-sm text-coral' : 'bg-transparent text-medium hover:text-dark'}"
        >km</button>
        <button
          onclick={() => unit.value = 'mi'}
          class="px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer border-none {unit.value === 'mi' ? 'bg-white shadow-sm text-coral' : 'bg-transparent text-medium hover:text-dark'}"
        >mi</button>
      </div>
      <button
        onclick={() => showSettings = !showSettings}
        class="px-2 sm:px-2.5 py-1 rounded-lg text-sm cursor-pointer border-none transition-colors {showSettings ? 'bg-coral/10 text-coral' : 'bg-warm-gray text-medium hover:text-dark'}"
        title={t('settings')}
      >
        {apiKey.value ? '🔑' : '⚙️'}
      </button>
      <button
        onclick={() => sidebarOpen = !sidebarOpen}
        class="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-warm-gray text-dark text-sm font-semibold cursor-pointer border-none"
      >
        {sidebarOpen ? '🗺️' : '📋'}
      </button>
    </div>
  </header>

  <!-- Settings bar -->
  {#if showSettings}
    <div class="px-4 sm:px-6 py-3 bg-warm-gray/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 animate-fade-in">
      <label class="text-xs font-semibold text-dark whitespace-nowrap" for="ors-key">{t('settings.apiKey')}</label>
      <div class="flex items-center gap-2 flex-1">
        <input
          id="ors-key"
          type="password"
          bind:value={keyInput}
          onchange={() => setApiKey(keyInput.trim())}
          placeholder={t('settings.apiKeyPlaceholder')}
          class="flex-1 bg-white rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-dark placeholder:text-light outline-none focus:border-coral/30 min-w-0"
        />
        {#if apiKey.value}
          <span class="text-xs text-mint font-semibold shrink-0">{t('settings.active')}</span>
        {:else}
          <a href="https://openrouteservice.org/dev/#/signup" target="_blank" rel="noopener" class="text-xs text-coral hover:underline whitespace-nowrap shrink-0">{t('settings.getKey')}</a>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Main content -->
  <div class="flex-1 flex overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col bg-warm-white border-r border-gray-100 overflow-hidden transition-transform duration-300 {sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} {sidebarOpen ? 'absolute md:relative inset-0 top-auto z-20 h-[calc(100dvh-65px)] sm:h-[calc(100dvh-73px)] md:h-auto' : 'absolute md:relative -left-full md:left-0'}"
    >
      <div class="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
        <!-- Search -->
        <div>
          <h2 class="text-sm font-bold text-dark mb-2 flex items-center gap-2">
            <span>👥</span> {t('friends.title')}
          </h2>
          <AddressInput />
        </div>

        <!-- Friend list -->
        <FriendList />

        <!-- Groups -->
        <div>
          <h2 class="text-sm font-bold text-dark mb-2 flex items-center gap-2">
            <span>💾</span> {t('groups.title')}
          </h2>
          <GroupManager />
        </div>

        <!-- Too far apart warning -->
        {#if tooFarApart.value}
          <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 animate-fade-in">
            <span class="text-lg">⚠️</span>
            <p class="text-sm text-amber-800">
              {t('warning.tooFar', { distance: formatMaxDistance() })}
            </p>
          </div>
        {/if}

        <!-- Mode toggle -->
        {#if friends.list.length >= 2 && !tooFarApart.value}
          <div class="animate-fade-in">
            <h2 class="text-sm font-bold text-dark mb-2 flex items-center gap-2">
              <span>🎯</span> {t('mode.title')}
            </h2>
            <ModeToggle />
          </div>

          <!-- Ranking toggle -->
          <div class="animate-fade-in">
            <h2 class="text-sm font-bold text-dark mb-2 flex items-center gap-2">
              <span>⚖️</span> {t('ranking.title')}
            </h2>
            <div class="flex bg-warm-gray rounded-xl p-1 gap-1">
              <button
                onclick={() => { ranking.value = 'equidistant'; rerankVenues(); }}
                class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer border-none {ranking.value === 'equidistant' ? 'bg-white shadow-sm text-coral' : 'bg-transparent text-medium hover:text-dark'}"
              >
                <span class="text-lg">📏</span>
                {t('ranking.distance')}
              </button>
              <button
                onclick={() => { if (!apiKey.value) { showSettings = true; return; } ranking.value = 'walking'; rerankVenues(); }}
                class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 border-none {!apiKey.value ? 'bg-transparent text-light cursor-default' : ranking.value === 'walking' ? 'bg-white shadow-sm text-coral cursor-pointer' : 'bg-transparent text-medium hover:text-dark cursor-pointer'}"
              >
                <span class="text-lg">🚶</span>
                {t('ranking.walkTime')}
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
              {t('venues.title')}
              {#if venues.list.length > 0}
                <span class="text-xs font-normal text-medium">({t('venues.found', { count: venues.list.length })})</span>
              {/if}
            </h2>
            <VenueList onSelectVenue={handleSelectVenue} selectedVenueId={selectedVenue?.id} />
          </div>
        {/if}

        <!-- Empty state -->
        {#if friends.list.length === 0}
          <div class="flex-1 flex flex-col items-center justify-center text-center py-8 animate-fade-in">
            <div class="text-6xl mb-4 animate-bounce-slow">🤝</div>
            <h3 class="text-lg font-bold text-dark mb-1">{t('empty.title')}</h3>
            <p class="text-sm text-medium max-w-[260px]">
              {t('empty.description')}
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
        <div class="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-md rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg border border-gray-100 animate-fade-in">
          <p class="text-xs text-medium">
            <span class="font-bold text-coral">{venues.list.length}</span>
            {mode.value === 'restaurant' ? t('info.restaurants') : t('info.bars')} {t('info.found')}
            · {t('info.rankedBy')} {ranking.value === 'walking' ? t('info.walkTime') : t('info.distance')}
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
