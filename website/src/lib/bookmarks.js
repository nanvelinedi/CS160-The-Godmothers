const KEY = "amf_bookmarks_v1";
const EV  = "amf:bookmarks-changed";

const read = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
};

const write = (arr) => {
  localStorage.setItem(KEY, JSON.stringify(arr.map(String)));
  // notify all listeners in-app (other pages/components)
  window.dispatchEvent(new Event(EV));
};

export function getBookmarks() {
  return read();
}

export function saveBookmarks(arr) {
  write(arr);
}

export function toggleBookmark(id) {
  const s = new Set(read());
  const key = String(id);
  s.has(key) ? s.delete(key) : s.add(key);
  const next = [...s];
  write(next);
  return next; // array of string IDs
}

export function clearBookmarks() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EV));
}

export const BOOKMARKS_EVENT = EV;
