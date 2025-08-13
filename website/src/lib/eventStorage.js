// src/lib/eventStorage.js
export const PENDING_KEY = "pendingEvents:v1";
export const APPROVED_KEY = "approvedEvents:v1";
export const EVENTS_CHANGED = "events:changed";

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? []; }
  catch { return []; }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENTS_CHANGED));
}

export function getPendingEvents()   { return read(PENDING_KEY); }
export function getApprovedEvents()  { return read(APPROVED_KEY); }

export function addPendingEvent(evt)  { write(PENDING_KEY,  [...getPendingEvents(), evt]); }
export function addApprovedEvent(evt) { write(APPROVED_KEY, [...getApprovedEvents(), evt]); }

export function removePendingEvent(id) {
  write(PENDING_KEY, getPendingEvents().filter(e => e.id !== id));
}

export function approvePendingById(id) {
  const list = getPendingEvents();
  const idx = list.findIndex(e => e.id === id);
  if (idx === -1) return false;
  const [evt] = list.splice(idx, 1);
  write(PENDING_KEY, list);
  write(APPROVED_KEY, [...getApprovedEvents(), evt]);
  return true;
}

export function rejectPendingById(id) {
  removePendingEvent(id);
}

export function clearAllEvents() {
  localStorage.removeItem(PENDING_KEY);
  localStorage.removeItem(APPROVED_KEY);
  window.dispatchEvent(new CustomEvent(EVENTS_CHANGED));
}
