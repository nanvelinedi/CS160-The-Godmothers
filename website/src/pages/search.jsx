// src/pages/search.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import marketsData from "../data/markets.json";

// ───────────────────────────────── Map config
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "<PUT_YOUR_TOKEN_HERE>";
const DEFAULT_CENTER = [-87.6298, 41.8781]; // [lng, lat] Chicago
const DEFAULT_ZOOM = 10;

// ───────────────────────────────── Utils
function haversineKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371, toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function Search() {
  // Map + geocoder refs
  const mapRef = useRef(null);
  const mapEl = useRef(null);

  // We mount the Mapbox Geocoder INSIDE this container (which lives in a DaisyUI pill)
  const geocoderContainer = useRef(null);
  const geocoderRef = useRef(null); // ensure only one instance

  useEffect(() => {
  if (!geocoderContainer.current || geocoderRef.current) return;

  geocoderContainer.current.innerHTML = "";
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    marker: false,
    placeholder: "Search",
    collapsed: false,
    flyTo: false,
    types: "place,postcode,address",
    limit: 6,
  });

  geocoder.addTo(geocoderContainer.current);
  geocoderRef.current = geocoder;

  // Move map when a result is picked
  geocoder.on("result", (e) => {
    const [lng, lat] = e.result.center;
    setCenter([lng, lat]);
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 12 });
  });

  // Pressing Enter runs a query (even if no suggestion is selected)
  const input = geocoderContainer.current.querySelector("input.mapboxgl-ctrl-geocoder--input");
  const onKey = (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      const q = input?.value?.trim();
      if (q) geocoder.query(q);
    }
  };
  input?.addEventListener("keydown", onKey);

  return () => {
    input?.removeEventListener("keydown", onKey);
    geocoderRef.current?.clear();
    geocoderRef.current = null;
    if (geocoderContainer.current) geocoderContainer.current.innerHTML = "";
  };
}, []);


  // State
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(
    () => marketsData.filter(m => haversineKm(center, [m.lng, m.lat]) <= radiusKm),
    [center, radiusKm]
  );
  const selected = filtered.find(m => m.id === selectedId);

  // ───────────────────────────────── Init Map
  useEffect(() => {
    if (!mapEl.current) return;

    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: DEFAULT_ZOOM,
    });
    mapRef.current = map;

    // Keep state in sync when user pans
    map.on("moveend", () => {
      const c = map.getCenter();
      setCenter([c.lng, c.lat]);
    });

    return () => map.remove();
  }, []);

  // ───────────────────────────────── Init Geocoder (single instance, no double-render)
  useEffect(() => {
    if (!geocoderContainer.current || geocoderRef.current) return;

    // Clean any leftover DOM (helps during Vite HMR)
    geocoderContainer.current.innerHTML = "";

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Search",
      collapsed: false,
      flyTo: false,
      types: "place,postcode,address",
      limit: 6,
    });

    geocoder.addTo(geocoderContainer.current);
    geocoderRef.current = geocoder;

    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;
      setCenter([lng, lat]);
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 12 });
    });

    return () => {
      geocoderRef.current?.clear();
      geocoderRef.current = null;
      if (geocoderContainer.current) geocoderContainer.current.innerHTML = "";
    };
  }, []);

  // ───────────────────────────────── Markers for filtered results
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing
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

  // ───────────────────────────────── Actions
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

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* ───── Toolbar: DaisyUI pill search + radius + button */}
      <div className="bg-base-100 rounded-box shadow p-3 lg:p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div className="relative flex-1 min-w-0">
          <div className="amf-geocoder input input-bordered rounded-full bg-base-100 flex items-center w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
              </svg>
            </span>
            <div ref={geocoderContainer} className="w-full" />
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-sm"
              aria-label="Clear search"
              onClick={() => {
                const input = geocoderContainer.current?.querySelector("input.mapboxgl-ctrl-geocoder--input");
                if (input) { input.value = ""; input.focus(); }
              }}
            >
              <svg className="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
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


      {/* ───── Map */}
      <div className="bg-base-100 rounded-box shadow overflow-hidden">
        <div ref={mapEl} className="w-full h-72 md:h-96" />
      </div>

      {/* ───── Results header / empty state */}
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-70">{filtered.length} market(s) within {radiusKm} km</p>
        {filtered.length === 0 && (
          <div className="text-sm">
            Sorry, no events nearby.{" "}
            <a className="link link-primary" href="/submit">Click here to submit an event!</a>
          </div>
        )}
      </div>

      {/* ───── Results list */}
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
