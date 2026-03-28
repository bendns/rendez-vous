<script>
  import { friends, removeFriend, searchVenues } from './stores.svelte.js';
  import { t } from './i18n.svelte.js';

  const colors = ['#FF6B6B', '#A8E6CF', '#84C5F4', '#DCD6F7', '#FFD93D', '#FF8CC8', '#6BCB77', '#C4A1FF'];

  function getColor(index) {
    return colors[index % colors.length];
  }

  function handleRemove(id) {
    removeFriend(id);
    searchVenues();
  }

  function getShortAddress(displayName) {
    const parts = displayName.split(',');
    return parts.slice(0, 2).join(',').trim();
  }
</script>

{#if friends.list.length > 0}
  <div class="flex flex-col gap-2">
    {#each friends.list as friend, i (friend.id)}
      <div
        class="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-50 group animate-pop"
        style="animation-delay: {i * 50}ms"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
          style="background-color: {getColor(i)}"
        >
          {friend.name.charAt(friend.name.length - 1)}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-dark">{friend.name}</p>
          <p class="text-xs text-medium truncate">{getShortAddress(friend.displayName)}</p>
        </div>
        <button
          onclick={() => handleRemove(friend.id)}
          class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-light hover:text-coral cursor-pointer bg-transparent border-none text-lg p-1"
          aria-label={t('friends.remove', { name: friend.name })}
        >
          ✕
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  @keyframes pop {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-pop {
    animation: pop 0.25s ease-out both;
  }
</style>
