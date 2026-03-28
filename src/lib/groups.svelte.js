const STORAGE_KEY = 'rendez-vous-groups';

export const groups = $state({ list: load() });

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups.list));
}

export function saveGroup(name, friends) {
  groups.list = [...groups.list, {
    id: Date.now(),
    name,
    friends: friends.map(f => ({ name: f.name, lat: f.lat, lng: f.lng, displayName: f.displayName })),
  }];
  save();
}

export function deleteGroup(id) {
  groups.list = groups.list.filter(g => g.id !== id);
  save();
}

export function renameGroup(id, newName) {
  groups.list = groups.list.map(g => g.id === id ? { ...g, name: newName } : g);
  save();
}

export function updateGroup(id, friends) {
  groups.list = groups.list.map(g => g.id === id
    ? { ...g, friends: friends.map(f => ({ name: f.name, lat: f.lat, lng: f.lng, displayName: f.displayName })) }
    : g
  );
  save();
}
