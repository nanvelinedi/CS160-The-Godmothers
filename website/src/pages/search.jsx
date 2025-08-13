// src/pages/search.jsx
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import mapboxgl from "mapbox-gl";
import marketsData from "../data/markets.json";
import { getBookmarks, toggleBookmark as storeToggle, BOOKMARKS_EVENT } from "../lib/bookmarks";
import { getApprovedEvents, EVENTS_CHANGED } from "../lib/eventStorage";


// Map config
mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  "pk.eyJ1Ijoic2FicmluYWt1YW5nIiwiYSI6ImNtZTdmaXQzNzAwdmQyb3EyY2h2OXhoM2wifQ.L4NKFJWUBNJkJvLP9Zc9xw";

const DEFAULT_ORIGIN = [-122.2727, 37.8716]; // [lng, lat] Berkeley
const DEFAULT_ZOOM = 11;

// Utils
function haversineKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function makeCircle([lng, lat], radiusKm, steps = 64) {
  const coords = [];
  const R = 6371, d = radiusKm / R;
  const latR = (lat * Math.PI) / 180, lngR = (lng * Math.PI) / 180;
  for (let i = 0; i <= steps; i++) {
    const b = (i * 2 * Math.PI) / steps;
    const lat2 = Math.asin(Math.sin(latR) * Math.cos(d) + Math.cos(latR) * Math.sin(d) * Math.cos(b));
    const lng2 = lngR + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(latR), Math.cos(d) - Math.sin(latR) * Math.sin(lat2));
    coords.push([(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: {} };
}
function boundsFromPolygon(feature) {
  const b = new mapboxgl.LngLatBounds();
  for (const [lng, lat] of feature.geometry.coordinates[0]) b.extend([lng, lat]);
  return b;
}

/* ========= DaisyUI autocomplete (Mapbox Geocoding) ========= */
function GeoSearch({ onSelect, placeholder = "Search location" }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }

    const qTrim = q.trim();
    if (qTrim.length < 3) { setItems([]); setOpen(false); setActive(-1); return; }

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
          center: f.center,
        }));
        setItems(parsed);
        setOpen(parsed.length > 0);
        setActive(parsed.length ? 0 : -1);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("geocode failed", e);
          setItems([]); setOpen(false); setActive(-1);
        }
      } finally { abortRef.current = null; }
    }, 200);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const choose = (idx) => {
    const item = items[idx];
    if (!item) return;
    onSelect(item);
    const text = item.context || item.name;
    setQ(text);
    inputRef.current && (inputRef.current.value = text);
    setOpen(false); setActive(-1);
  };

  const onKeyDown = (e) => {
    if (!open && e.key === "Enter") { setTimeout(() => choose(0), 50); return; }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(active >= 0 ? active : 0); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <label className="input input-bordered rounded-none bg-base-100 flex items-center gap-2 w-full">
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

      {open && (
        <ul className="absolute left-0 right-0 top-full mt-2 z-50 menu bg-base-100 rounded-box p-2 shadow-xl max-h-80 overflow-auto">
          {items.map((it, i) => (
            <li key={it.id}>
              <a
                className={i === active ? "bg-base-200" : ""}
                onMouseEnter={()=>setActive(i)}
                onMouseDown={(e)=>e.preventDefault()}
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

/* ========= Event Card with Tooltip Popup (measured position + images at top) ========= */
/* ========= Event Card with Tooltip Popup (always-up + portal) ========= */
function EventCard({ event, isSelected, onSelect, onBookmark, isBookmarked }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [modalImg, setModalImg] = useState(null);

  const cardRef = useRef(null);
  const popupRef = useRef(null);

  const images = Array.isArray(event.images) ? event.images : [];
  const bio = event.bio || event.description;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const handleSeeMore = (e) => {
    e.stopPropagation();
    setShowPopup((s) => !s);
  };

  // Position the popup ABOVE the card, centered; clamp to viewport
  useLayoutEffect(() => {
    if (!showPopup || !cardRef.current || !popupRef.current) return;

    const margin = 10;
    const place = () => {
      const cardRect = cardRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();

      // center horizontally over the card
      let left = cardRect.left + cardRect.width / 2 - popupRect.width / 2;
      left = Math.max(margin, Math.min(left, window.innerWidth - popupRect.width - margin));

      // ALWAYS above; if not enough space, hug the top margin
      let top = cardRect.top - popupRect.height - 8;
      top = Math.max(margin, top);

      setPopupPos({ top, left });
    };

    place();
    const onResize = () => place();
    const onScroll = () => place();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [showPopup, images.length]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPopup && !e.target.closest(".event-popup")) setShowPopup(false);
    };
    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPopup]);

  return (
    <>
      {/* Card in horizontal list */}
      <div className="flex-none w-80 h-40">
        <div
          ref={cardRef}
          className={`card bg-base-100 shadow w-full h-full transition hover:shadow-md cursor-pointer ${
            isSelected ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onSelect(event.id)}
        >
          <div className="card-body p-4 flex flex-col justify-between h-full">
            <div className="flex-1 min-h-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="card-title text-base line-clamp-2 flex-1 mr-2">{event.name}</h3>
                <button
                  className={`btn btn-ghost btn-sm btn-circle ${
                    isBookmarked ? "text-warning" : "opacity-60 hover:opacity-100"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmark(event.id);
                  }}
                  title={isBookmarked ? "Remove bookmark" : "Bookmark event"}
                  aria-label={isBookmarked ? "Remove bookmark" : "Bookmark event"}
                >
                  <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <p className="opacity-80 text-sm line-clamp-2">{event.address}</p>
            </div>
            <div className="card-actions flex-shrink-0 mt-2 flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <span className="badge badge-outline text-xs">
                  {event.date ? new Date(event.date).toLocaleDateString() : "TBA"}
                </span>
                {event.tags?.slice(0, 2).map((t) => (
                  <span key={t} className="badge text-xs">
                    {t}
                  </span>
                ))}
              </div>
              <button className="btn btn-ghost btn-xs" onClick={handleSeeMore}>
                See more
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup rendered to body so it never gets clipped */}
      {showPopup &&
        createPortal(
          <div
            ref={popupRef}
            className="event-popup fixed z-[9999] w-80 bg-base-100 rounded-box shadow-2xl border border-base-300 p-4"
            style={{ top: `${popupPos.top}px`, left: `${popupPos.left}px` }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              {/* IMAGES FIRST (DaisyUI carousel; no number buttons) */}
              {images.length > 0 && (
                <div className="carousel carousel-center w-full rounded-box bg-base-200 p-1 space-x-2">
                  {images.map((src, i) => (
                    <div key={i} className="carousel-item justify-center">
                      <img
                        src={src}
                        alt={`Event image ${i + 1}`}
                        className="h-44 max-w-full object-contain rounded-box cursor-zoom-in"
                        onClick={() => setModalImg(src)}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Header + actions */}
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg flex-1 pr-2">{event.name}</h4>
                <div className="flex items-center gap-1">
                  <button
                    className={`btn btn-ghost btn-xs btn-circle ${
                      isBookmarked ? "text-warning" : "opacity-60 hover:opacity-100"
                    }`}
                    onClick={() => onBookmark(event.id)}
                    aria-label={isBookmarked ? "Remove bookmark" : "Bookmark event"}
                    title={isBookmarked ? "Remove bookmark" : "Bookmark event"}
                  >
                    <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setShowPopup(false)} aria-label="Close" title="Close">
                    ✕
                  </button>
                </div>
              </div>

              {/* Tags */}
              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {event.tags.map((tag) => (
                    <span key={tag} className="badge badge-primary badge-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Date / Time / Location / Website */}
              <div className="space-y-2 text-sm">
                {event.date && (
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="font-medium">{formatDate(event.date)}</div>
                      <div className="opacity-70">{event.time ? event.time : formatTime(event.date)}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="opacity-70">{event.address}</div>
                  </div>
                </div>
                {event.website && (
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <div>
                      <div className="font-medium">Website</div>
                      <a href={event.website} target="_blank" rel="noopener noreferrer" className="link link-primary">
                        Visit website
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {bio && (
                <div className="text-sm">
                  <div className="font-medium mb-1">About</div>
                  <p className="opacity-80 leading-relaxed">{bio}</p>
                </div>
              )}

              {/* Zoom modal */}
              {modalImg && (
                <dialog className="modal" open onMouseDown={(e) => e.stopPropagation()}>
                  <div className="modal-box p-2">
                    <button
                      className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                      onClick={() => setModalImg(null)}
                      aria-label="Close image"
                      title="Close image"
                    >
                      ✕
                    </button>
                    <img src={modalImg} alt="Enlarged event" className="w-full h-auto" />
                  </div>
                  <form method="dialog" className="modal-backdrop" onClick={() => setModalImg(null)}>
                    <button>close</button>
                  </form>
                </dialog>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}


/* ====================== Search page ====================== */

export default function Search() {
  const mapRef = useRef(null);
  const mapEl = useRef(null);

  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);   // [lng, lat]
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedId, setSelectedId] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set(getBookmarks()));

  const [approved, setApproved] = useState(() => getApprovedEvents());

  useEffect(() => {
    const onChange = () => setApproved(getApprovedEvents());
    window.addEventListener(EVENTS_CHANGED, onChange);
    return () => window.removeEventListener(EVENTS_CHANGED, onChange);
  }, []);


  const allEvents = useMemo(() => [...marketsData, ...approved], [approved]);

  // Ensure coords are numbers and ids are strings
  const normalizedEvents = useMemo(
    () =>
      allEvents
        .map(e => ({
          ...e,
          id: String(e.id ?? ""),                // for selection styling
          lat: typeof e.lat === "string" ? parseFloat(e.lat) : e.lat,
          lng: typeof e.lng === "string" ? parseFloat(e.lng) : e.lng,
        }))
        .filter(e => Number.isFinite(e.lat) && Number.isFinite(e.lng)),
    [allEvents]
  );

  // Use normalized events for filtering + rendering
  const filtered = useMemo(
    () => normalizedEvents.filter(m => haversineKm(origin, [m.lng, m.lat]) <= radiusKm),
    [normalizedEvents, origin, radiusKm]
  );


  const toggleBookmark = (eventId) => {
    const next = storeToggle(eventId);      // returns array of strings
    setBookmarkedIds(new Set(next));        // keep Set locally for fast lookup
  };

  useEffect(() => {
    const onChange = () => setBookmarkedIds(new Set(getBookmarks()));
    window.addEventListener(BOOKMARKS_EVENT, onChange);
    return () => window.removeEventListener(BOOKMARKS_EVENT, onChange);
  }, []);


  // --- Carousel refs/state ---
  const carouselRef = useRef(null);
  const itemRefs = useRef(new Map());

  const onCarouselKeyDown = (e) => {
    const el = carouselRef.current;
    if (!el) return;
    if (e.key === "ArrowRight") { e.preventDefault(); el.scrollBy({ left: 336, behavior: "smooth" }); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); el.scrollBy({ left: -336, behavior: "smooth" }); }
  };

  const onCarouselWheel = (e) => {
    const el = carouselRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    if (!selectedId) return;
    const el = itemRefs.current.get(selectedId);
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedId]);

  // init map + sources/layers
  useEffect(() => {
    if (!mapEl.current) return;
    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: origin,
      zoom: DEFAULT_ZOOM,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("amf-radius", { type: "geojson", data: makeCircle(origin, radiusKm) });
      map.addLayer({
        id: "amf-radius-fill",
        type: "fill",
        source: "amf-radius",
        paint: { "fill-color": "#22d3ee", "fill-opacity": 0.12 }
      });
      map.addLayer({
        id: "amf-radius-line",
        type: "line",
        source: "amf-radius",
        paint: { "line-color": "#0ea5e9", "line-width": 2 }
      });

      map.addSource("amf-events", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "amf-events-circle",
        type: "circle",
        source: "amf-events",
        paint: {
          "circle-color": [
            "case",
            ["==", ["get", "id"], selectedId || ""],
            "#ec4899",
            "#f472b6"
          ],
          "circle-radius": [
            "case",
            ["==", ["get", "id"], selectedId || ""],
            8,
            6
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-opacity": 0.9,
        },
      });

      map.addSource("amf-origin", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "Point", coordinates: origin }, properties: {} },
      });
      map.addLayer({
        id: "amf-origin-circle",
        type: "circle",
        source: "amf-origin",
        paint: {
          "circle-color": "#0ea5e9",
          "circle-radius": 8,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
        },
      });

      map.on("mouseenter", "amf-events-circle", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "amf-events-circle", () => { map.getCanvas().style.cursor = ""; });
      map.on("click", "amf-events-circle", (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const id = f.properties?.id;
        const [lng, lat] = f.geometry.coordinates;
        setSelectedId(id || null);
        map.flyTo({ center: [lng, lat], zoom: 13, duration: 800 });
      });

      updateEventsOnMap(map, filtered, selectedId);
    });

    return () => map.remove();
  }, []);

  const updateEventsOnMap = (map, events, selectedId) => {
    const eventsSource = map.getSource("amf-events");
    if (eventsSource) {
      const fc = {
        type: "FeatureCollection",
        features: events.map(m => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [m.lng, m.lat] },
          properties: { id: m.id, name: m.name },
        })),
      };
      eventsSource.setData(fc);

      if (map.getLayer("amf-events-circle")) {
        map.setPaintProperty("amf-events-circle", "circle-color", [
          "case",
          ["==", ["get", "id"], selectedId || ""],
          "#ec4899",
          "#f472b6"
        ]);
        map.setPaintProperty("amf-events-circle", "circle-radius", [
          "case",
          ["==", ["get", "id"], selectedId || ""],
          8,
          6
        ]);
      }
    }
  };

  // update radius + origin + events when deps change
 // update radius + origin + events when deps change
useEffect(() => {
  const map = mapRef.current;
  if (!map || !map.isStyleLoaded()) return;

  const radiusSource = map.getSource("amf-radius");
  if (radiusSource) radiusSource.setData(makeCircle(origin, radiusKm));

  const originSource = map.getSource("amf-origin");
  if (originSource) originSource.setData({
    type: "Feature",
    geometry: { type: "Point", coordinates: origin },
    properties: {}
  });

  updateEventsOnMap(map, filtered, selectedId);

  // zoom to new bounds when radius changes
  const bounds = boundsFromPolygon(makeCircle(origin, radiusKm));
  map.fitBounds(bounds, { padding: 80, duration: 600 });

}, [origin, radiusKm, filtered, selectedId]);


  // fit to circle when radius changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Update the radius circle on the map first
    const radiusSource = map.getSource("amf-radius");
    if (radiusSource) {
      radiusSource.setData(makeCircle(origin, radiusKm));
    }

    // Then fit to the updated circle
    const bounds = boundsFromPolygon(makeCircle(origin, radiusKm));
    map.fitBounds(bounds, { padding: 80, duration: 600 });
  }, [origin, radiusKm]);


  function useMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported on this device.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newOrigin = [pos.coords.longitude, pos.coords.latitude];
        setOrigin(newOrigin);
        const map = mapRef.current;
        if (map && map.isStyleLoaded()) {
          map.flyTo({ center: newOrigin, zoom: DEFAULT_ZOOM, duration: 1000 });
        }
      },
      () => alert("Could not get your location.")
    );
  }

  function handlePickPlace(item) {
    const newOrigin = item.center;
    setOrigin(newOrigin);
    const map = mapRef.current;
    if (map && map.isStyleLoaded()) {
      map.flyTo({ center: newOrigin, zoom: DEFAULT_ZOOM, duration: 1000 });
    }
  }

  return (
  <div className="w-full max-w-screen-xl mx-auto px-4 lg:px-6 space-y-4 overflow-x-clip">
    {/* Toolbar */}
    {/* Toolbar — DaisyUI join group */}
<div className="join w-full">
  <div className="join-item flex-1 min-w-0">
    <GeoSearch onSelect={handlePickPlace} placeholder="Search location" />
  </div>

  <select
    className="select select-bordered join-item w-36"
    value={radiusKm}
    onChange={(e) => setRadiusKm(Number(e.target.value))}
    aria-label="Search radius"
  >
    {[5,10,25,50,100].map(k => <option key={k} value={k}>{k} km</option>)}
  </select>

  <button className="btn btn-outline join-item" onClick={useMyLocation}>
    Use my location
  </button>
</div>


    {/* Map */}
    <div className="bg-base-100 rounded-box shadow overflow-hidden">
      <div ref={mapEl} className="w-full h-72 md:h-96" />
    </div>

    {/* Results header / empty */}
    <div className="flex items-center justify-between min-w-0">
      <p className="text-sm opacity-70">
        {filtered.length} market(s) within {radiusKm} km
      </p>
      {filtered.length === 0 && (
        <div className="text-sm">
          Sorry, no events nearby.{" "}
          <Link className="link link-primary" to="/submit-event">
            Click here to submit an event!
          </Link>
        </div>
      )}
    </div>

    {/* Carousel container: keeps overflow inside itself */}
    {/* Results list — EXACT daisyUI carousel */}
    {/* Results list — pure Tailwind horizontal scroller */}
    <div className="max-w-[900px] w-[900px] overflow-x-auto mx-auto rounded-box bg-base-100 shadow p-2">
      <div className="flex gap-4 snap-x snap-mandatory">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="shrink-0 snap-start w-80"
          >
            <EventCard
              event={m}
              isSelected={selectedId === m.id}
              onSelect={(id) => {
                setSelectedId(id);
                mapRef.current?.flyTo({ center: [m.lng, m.lat], zoom: 13, duration: 800 });
              }}
              onBookmark={toggleBookmark}
              isBookmarked={bookmarkedIds.has(String(m.id))}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
