<script>
  import { mode, searchVenues, friends } from './stores.svelte.js';

  function toggle(newMode) {
    mode.value = newMode;
    if (friends.list.length >= 2) {
      searchVenues();
    }
  }
</script>

<div class="flex bg-warm-gray rounded-xl p-1 gap-1">
  <button
    onclick={() => toggle('restaurant')}
    class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer border-none {mode.value === 'restaurant' ? 'bg-white shadow-sm text-coral' : 'bg-transparent text-medium hover:text-dark'}"
  >
    <span class="text-lg">🍽️</span>
    Restaurants
  </button>
  <button
    onclick={() => toggle('bar')}
    class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer border-none {mode.value === 'bar' ? 'bg-white shadow-sm text-coral' : 'bg-transparent text-medium hover:text-dark'}"
  >
    <span class="text-lg">🍸</span>
    Bars
  </button>
</div>
