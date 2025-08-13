// src/lib/eventStorage.js
export const PENDING_KEY = "pendingEvents:v1";
export const APPROVED_KEY = "approvedEvents:v1";

export function getPendingEvents() {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY)) ?? []; }
  catch { return []; }
}

export function addPendingEvent(evt) {
  const list = getPendingEvents();
  list.push(evt);
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

// Optional now, handy for later when we add Admin:
export function getApprovedEvents() {
  try { return JSON.parse(localStorage.getItem(APPROVED_KEY)) ?? []; }
  catch { return []; }
}
export function addApprovedEvent(evt) {
  const list = getApprovedEvents();
  list.push(evt);
  localStorage.setItem(APPROVED_KEY, JSON.stringify(list));
}
