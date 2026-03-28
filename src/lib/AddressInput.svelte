<script>
  import { addFriend, friends, searchVenues, MAX_ADDRESSES } from './stores.svelte.js';

  let query = $state('');
  let friendName = $state('');
  let suggestions = $state([]);
  let loading = $state(false);
  let debounceTimer = null;
  let showSuggestions = $state(false);
  let nameInput;

  function debounceSearch(value) {
    clearTimeout(debounceTimer);
    if (value.length < 3) {
      suggestions = [];
      return;
    }
    loading = true;
    debounceTimer = setTimeout(() => fetchSuggestions(value), 350);
  }

  async function fetchSuggestions(q) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr,en' } }
      );
      suggestions = await res.json();
      showSuggestions = suggestions.length > 0;
    } catch {
      suggestions = [];
    } finally {
      loading = false;
    }
  }

  function selectSuggestion(s) {
    if (friends.list.length >= MAX_ADDRESSES) return;
    const name = friendName.trim() || `Ami ${friends.list.length + 1}`;
    addFriend(name, parseFloat(s.lat), parseFloat(s.lon), s.display_name);
    query = '';
    friendName = '';
    suggestions = [];
    showSuggestions = false;
    searchVenues();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      showSuggestions = false;
    }
  }

  function handleBlur() {
    setTimeout(() => { showSuggestions = false; }, 200);
  }
</script>

<div class="relative flex flex-col gap-2">
  <div class="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 transition-all duration-200 focus-within:shadow-md focus-within:border-coral/30">
    <span class="text-xl">👤</span>
    <input
      type="text"
      bind:this={nameInput}
      bind:value={friendName}
      placeholder="Name (optional)"
      disabled={friends.list.length >= MAX_ADDRESSES}
      class="flex-1 bg-transparent outline-none text-dark placeholder:text-light text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
  <div class="relative">
  <div class="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 transition-all duration-200 focus-within:shadow-md focus-within:border-coral/30">
    <span class="text-xl">📍</span>
    <input
      type="text"
      bind:value={query}
      oninput={() => debounceSearch(query)}
      onkeydown={handleKeydown}
      onblur={handleBlur}
      onfocus={() => { if (suggestions.length > 0) showSuggestions = true; }}
      placeholder={friends.list.length >= MAX_ADDRESSES ? `Max ${MAX_ADDRESSES} addresses reached` : "Address..."}
      disabled={friends.list.length >= MAX_ADDRESSES}
      class="flex-1 bg-transparent outline-none text-dark placeholder:text-light text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
    />
    {#if loading}
      <div class="w-5 h-5 border-2 border-coral/30 border-t-coral rounded-full animate-spin"></div>
    {/if}
  </div>

  {#if showSuggestions && suggestions.length > 0}
    <ul class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-slide-down">
      {#each suggestions as s}
        <li>
          <button
            type="button"
            onclick={() => selectSuggestion(s)}
            class="w-full text-left px-4 py-3 hover:bg-peach/40 transition-colors duration-150 cursor-pointer flex items-start gap-3 border-b border-gray-50 last:border-0"
          >
            <span class="text-coral mt-0.5">●</span>
            <span class="text-sm text-dark leading-snug">{s.display_name}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
  </div>
</div>

<style>
  @keyframes slide-down {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-down {
    animation: slide-down 0.2s ease-out;
  }
</style>
