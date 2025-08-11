// src/pages/search.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import marketsData from "../data/markets.json";

// ── Map config
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "<PUT_YOUR_TOKEN_HERE>";
const DEFAULT_CENTER = [-87.6298, 41.8781]; // [lng, lat] Chicago
const DEFAULT_ZOOM = 10;

// ── Utils
function haversineKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371, toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ── DaisyUI autocomplete powered by Mapbox Geocoding API
function GeoSearch({ onSelect, placeholder = "Search location" }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch suggestions (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }

    const qTrim = q.trim();
    if (qTrim.length < 3) {
      setItems([]); setOpen(false); setActive(-1);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(qTrim)}.json`);
        url.searchParams.set("access_token", mapboxgl.accessToken);
        url.searchParams.set("autocomplete", "true");
        url.searchParams.set("limit", "6");
        url.searchParams.set("types", "place,postcode,address");
        const res = await fetch(url.toString(), { signal: ctrl.signal });
        if (!res.ok) throw new Error("geocoding error");
        const data = await res.json();
        const parsed = (data.features || []).map(f => ({
          id: f.id,
          name: f.text,
          context: f.place_name,
          center: f.center, // [lng, lat]
        }));
        setItems(parsed);
        setOpen(parsed.length > 0);
        setActive(parsed.length ? 0 : -1);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("geocode failed", e);
          setItems([]); setOpen(false); setActive(-1);
        }
      } finally {
        abortRef.current = null;
      }
    }, 200);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Pick a suggestion (order matters!)
  const choose = (idx) => {
    const item = items[idx];
    if (!item) return;

    // 1) Move the map first
    onSelect(item);

    // 2) Fill the input with the selected address
    const text = item.context || item.name;
    setQ(text);
    if (inputRef.current) inputRef.current.value = text;

    // 3) Close/cleanup
    setOpen(false);
    setActive(-1);
    // inputRef.current?.blur(); // optional on mobile
  };

  // Keyboard nav
  const onKeyDown = (e) => {
    if (!open && e.key === "Enter") {
      setTimeout(() => choose(0), 50); // pick first result
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(active >= 0 ? active : 0); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div className="relative" ref={wrapRef}>
      {/* DaisyUI pill input */}
      <label className="input input-bordered rounded-full bg-base-100 flex items-center gap-2 w-full">
        <svg className="h-[1em] opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          className="bg-transparent outline-none w-full h-12"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          onFocus={()=>{ if (items.length) setOpen(true); }}
          onKeyDown={onKeyDown}
        />
        {/* clear button */}
        {q && (
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-sm"
            onClick={()=>{ setQ(""); setItems([]); setOpen(false); inputRef.current?.focus(); }}
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </label>

      {/* Absolute dropdown overlays the map; click -> choose(i) */}
      {open && (
        <ul className="absolute left-0 right-0 top-full mt-2 z-50 menu bg-base-100 rounded-box p-2 shadow-xl max-h-80 overflow-auto">
          {items.map((it, i) => (
            <li key={it.id}>
              <a
                className={i === active ? "bg-base-200" : ""}
                onMouseEnter={()=>setActive(i)}
                onMouseDown={(e)=>e.preventDefault()}  // keep focus so onClick fires
                onClick={()=>choose(i)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{it.name}</span>
                  <span className="text-xs opacity-70">{it.context}</span>
                </div>
              </a>
            </li>
          ))}
          {items.length === 0 && <li className="opacity-60 px-2 py-1">No results</li>}
        </ul>
      )}
    </div>
  );
}

export default function Search() {
  const mapRef = useRef(null);
  const mapEl = useRef(null);

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(
    () => marketsData.filter(m => haversineKm(center, [m.lng, m.lat]) <= radiusKm),
    [center, radiusKm]
  );
  const selected = filtered.find(m => m.id === selectedId);

  // Init map
  useEffect(() => {
    if (!mapEl.current) return;
    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: DEFAULT_ZOOM,
    });
    mapRef.current = map;

    map.on("moveend", () => {
      const c = map.getCenter();
      setCenter([c.lng, c.lat]);
    });

    return () => map.remove();
  }, []);

  // Markers for filtered markets
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map._amfMarkers) map._amfMarkers.forEach(m => m.remove());
    map._amfMarkers = [];

    filtered.forEach(m => {
      const el = document.createElement("div");
      el.className = "rounded-full bg-secondary w-3 h-3 border border-base-100";
      el.style.boxShadow = "0 0 0 4px rgba(0,0,0,0.1)";
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map);
      el.addEventListener("click", () => setSelectedId(m.id));
      map._amfMarkers.push(marker);
    });
  }, [filtered]);

  // Actions
  function useMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported on this device.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setCenter([longitude, latitude]);
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 12 });
      },
      () => alert("Could not get your location.")
    );
  }

  function handlePickPlace(item) {
    const [lng, lat] = item.center;
    setCenter([lng, lat]);
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 12 });
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Toolbar */}
      <div className="bg-base-100 rounded-box shadow p-3 lg:p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center overflow-visible">
        <div className="relative flex-1 min-w-0">
          <GeoSearch onSelect={handlePickPlace} />
        </div>

        <select
          className="select select-bordered w-full lg:w-44 flex-none"
          value={radiusKm}
          onChange={(e)=>setRadiusKm(Number(e.target.value))}
          aria-label="Search radius"
        >
          {[5,10,25,50,100].map(k => <option key={k} value={k}>{k} km</option>)}
        </select>

        <button className="btn btn-outline flex-none" onClick={useMyLocation}>
          Use my location
        </button>
      </div>

      {/* Map */}
      <div className="bg-base-100 rounded-box shadow overflow-hidden">
        <div ref={mapEl} className="w-full h-72 md:h-96" />
      </div>

      {/* Results header / empty state */}
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-70">{filtered.length} market(s) within {radiusKm} km</p>
        {filtered.length === 0 && (
          <div className="text-sm">
            Sorry, no events nearby.{" "}
            <a className="link link-primary" href="/submit">Click here to submit an event!</a>
          </div>
        )}
      </div>

      {/* Results list */}
      <ul className="grid gap-3">
        {filtered.map(m => (
          <li key={m.id}>
            <button
              className={`card bg-base-100 shadow w-full text-left hover:shadow-md transition ${selectedId===m.id?"ring-2 ring-primary":""}`}
              onClick={()=>{
                setSelectedId(m.id);
                mapRef.current?.flyTo({center:[m.lng, m.lat], zoom: 13});
              }}
            >
              <div className="card-body">
                <h3 className="card-title">{m.name}</h3>
                <p className="opacity-80">{m.address}</p>
                <div className="card-actions">
                  <span className="badge badge-outline">{new Date(m.date).toLocaleDateString()}</span>
                  {m.tags?.slice(0,2).map(t=> <span key={t} className="badge">{t}</span>)}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Optional floating details card */}
      {selected && (
        <div className="fixed right-4 bottom-4 z-20 max-w-sm">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{selected.name}</h2>
              <p className="opacity-80">{selected.address}</p>
              <div className="card-actions justify-between">
                <span className="badge badge-primary">{new Date(selected.date).toLocaleDateString()}</span>
                <a className="btn btn-sm btn-secondary" href={`/markets/${selected.id}`}>Open</a>
              </div>
              <button className="btn btn-ghost btn-sm mt-2" onClick={()=>setSelectedId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
