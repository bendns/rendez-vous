<script>
  import { friends, loadFriends, searchVenues } from './stores.svelte.js';
  import { groups, saveGroup, deleteGroup, renameGroup, updateGroup } from './groups.svelte.js';
  import { t } from './i18n.svelte.js';

  let saveName = $state('');
  let editingId = $state(null);
  let editingName = $state('');
  let confirmDeleteId = $state(null);
  let showSaved = $state(false);

  function handleSave() {
    const name = saveName.trim();
    if (!name || friends.list.length === 0) return;
    saveGroup(name, friends.list);
    saveName = '';
    showSaved = true;
    setTimeout(() => { showSaved = false; }, 2000);
  }

  function handleLoad(group) {
    loadFriends(group.friends);
    searchVenues();
  }

  function handleUpdate(group) {
    if (friends.list.length === 0) return;
    updateGroup(group.id, friends.list);
    showSaved = true;
    setTimeout(() => { showSaved = false; }, 2000);
  }

  function startRename(group) {
    editingId = group.id;
    editingName = group.name;
  }

  function confirmRename() {
    if (editingName.trim()) {
      renameGroup(editingId, editingName.trim());
    }
    editingId = null;
    editingName = '';
  }

  function handleRenameKeydown(e) {
    if (e.key === 'Enter') confirmRename();
    if (e.key === 'Escape') { editingId = null; editingName = ''; }
  }

  function handleDelete(id) {
    if (confirmDeleteId === id) {
      deleteGroup(id);
      confirmDeleteId = null;
    } else {
      confirmDeleteId = id;
      setTimeout(() => { confirmDeleteId = null; }, 3000);
    }
  }
</script>

<div class="flex flex-col gap-3">
  <!-- Save current group -->
  {#if friends.list.length >= 2}
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={saveName}
        onkeydown={(e) => { if (e.key === 'Enter') handleSave(); }}
        placeholder={t('groups.namePlaceholder')}
        class="flex-1 bg-white rounded-xl border border-gray-100 px-3 py-2 text-sm text-dark placeholder:text-light outline-none focus:border-coral/30 focus:shadow-sm transition-all"
      />
      <button
        onclick={handleSave}
        disabled={!saveName.trim()}
        class="px-4 py-2 rounded-xl bg-coral text-white text-sm font-semibold border-none cursor-pointer hover:bg-coral/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t('groups.save')}
      </button>
    </div>
    {#if showSaved}
      <p class="text-xs text-mint font-semibold animate-fade-in">{t('groups.saved')}</p>
    {/if}
  {/if}

  <!-- Saved groups list -->
  {#if groups.list.length > 0}
    <div class="flex flex-col gap-2">
      {#each groups.list as group (group.id)}
        <div class="bg-white rounded-xl p-3 shadow-sm border border-gray-50 animate-fade-in">
          <div class="flex items-center justify-between gap-2">
            {#if editingId === group.id}
              <input
                type="text"
                bind:value={editingName}
                onkeydown={handleRenameKeydown}
                onblur={confirmRename}
                class="flex-1 bg-warm-gray rounded-lg px-2 py-1 text-sm text-dark outline-none border-none"
              />
            {:else}
              <button
                onclick={() => handleLoad(group)}
                class="flex-1 text-left bg-transparent border-none cursor-pointer p-0"
              >
                <p class="text-sm font-semibold text-dark">{group.name}</p>
                <p class="text-[11px] text-medium">{group.friends.length} {t('groups.addresses')} · {group.friends.map(f => f.name).join(', ')}</p>
              </button>
            {/if}
          </div>

          <div class="flex flex-wrap items-center gap-1 mt-2">
            <button
              onclick={() => handleLoad(group)}
              class="text-[11px] px-2.5 py-1 rounded-lg bg-warm-gray text-dark font-semibold border-none cursor-pointer hover:bg-gray-200 transition-colors"
              title={t('groups.loadTitle')}
            >
              {t('groups.load')}
            </button>
            {#if friends.list.length >= 2}
              <button
                onclick={() => handleUpdate(group)}
                class="text-[11px] px-2.5 py-1 rounded-lg bg-warm-gray text-dark font-semibold border-none cursor-pointer hover:bg-gray-200 transition-colors"
                title={t('groups.updateTitle')}
              >
                {t('groups.update')}
              </button>
            {/if}
            <button
              onclick={() => startRename(group)}
              class="text-[11px] px-2.5 py-1 rounded-lg bg-warm-gray text-dark font-semibold border-none cursor-pointer hover:bg-gray-200 transition-colors"
              title={t('groups.rename')}
            >
              {t('groups.rename')}
            </button>
            <button
              onclick={() => handleDelete(group.id)}
              class="text-[11px] px-2.5 py-1 rounded-lg font-semibold border-none cursor-pointer transition-colors {confirmDeleteId === group.id ? 'bg-red-500 text-white' : 'bg-warm-gray text-dark hover:bg-red-100 hover:text-red-600'}"
              title={confirmDeleteId === group.id ? t('groups.confirmTitle') : t('groups.delete')}
            >
              {confirmDeleteId === group.id ? t('groups.confirm') : t('groups.delete')}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
</style>
