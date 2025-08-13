// src/pages/SubmitEvent.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { addPendingEvent } from "../lib/eventStorage";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ||
  "pk.eyJ1Ijoic2FicmluYWt1YW5nIiwiYSI6ImNtZTdmaXQzNzAwdmQyb3EyY2h2OXhoM2wifQ.L4NKFJWUBNJkJvLP9Zc9xw";

/* ===== AddressSearch ===== */
function AddressSearch({ onLocationSelect, value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const searchAddress = async (query) => {
    if (query.length < 3) { setSuggestions([]); setIsOpen(false); return; }
    try {
      const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
      url.searchParams.set("access_token", mapboxgl.accessToken);
      url.searchParams.set("autocomplete", "true");
      url.searchParams.set("limit", "5");
      url.searchParams.set("types", "place,postcode,address");
      const res = await fetch(url);
      const data = await res.json();
      const results = (data.features || []).map(f => ({ id: f.id, text: f.place_name, center: f.center }));
      setSuggestions(results); setIsOpen(results.length > 0);
    } catch {
      setSuggestions([]); setIsOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    onChange(v);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => searchAddress(v), 300);
  };

  const selectSuggestion = (s) => {
    onChange(s.text);
    onLocationSelect(s.center); // [lng, lat]
    setIsOpen(false); setSuggestions([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="input input-bordered w-full"
        placeholder="Start typing an address..."
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <button key={s.id} type="button" className="w-full text-left px-4 py-2 hover:bg-base-200 border-b last:border-b-0"
              onClick={() => selectSuggestion(s)}>
              {s.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== utils ===== */
const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const shortId = () => (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).slice(0, 6);
async function filesToDataURLs(files) {
  const arr = Array.from(files || []);
  const reads = arr.map(f => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f);
  }));
  return Promise.all(reads);
}

export default function SubmitEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", address: "", date: "", time: "", price: "",
    tags: "", description: "", website: "", contactEmail: "", contactPhone: "",
    lat: null, lng: null
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // load Cally
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module"; script.src = "https://unpkg.com/cally";
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    const onChange = (e) => {
      const value = e.target.value;
      if (value) { setForm(f => ({ ...f, date: value })); setShowCalendar(false); }
    };
    const el = calendarRef.current;
    if (el) { el.addEventListener("change", onChange); return () => el.removeEventListener("change", onChange); }
  }, [showCalendar]);

  const onInput = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const onAddress = (address) => setForm(f => ({ ...f, address }));
  const onLoc = ([lng, lat]) => setForm(f => ({ ...f, lat, lng }));

  const onImages = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    previews.forEach(URL.revokeObjectURL);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (!form.name || !form.address || !form.date || !form.contactEmail) throw new Error("Missing required fields");
      if (!form.lat || !form.lng) throw new Error("Pick an address from suggestions");

      const tags = form.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
      const images = await filesToDataURLs(imageFiles); // [] if none

      const evt = {
        id: `${slug(form.name)}-${shortId()}`,
        name: form.name.trim(),
        address: form.address.trim(),
        lat: Number(form.lat),
        lng: Number(form.lng),
        date: form.date,
        time: form.time.trim(),
        price: form.price.trim(),
        website: form.website.trim(),
        bio: form.description.trim(),
        description: form.description.trim(),
        images,
        tags,
        contact: form.contactEmail || form.contactPhone || "",
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };

      addPendingEvent(evt);
      setOk(true);
      setForm({ name:"", address:"", date:"", time:"", price:"", tags:"", description:"", website:"", contactEmail:"", contactPhone:"", lat:null, lng:null });
      previews.forEach(URL.revokeObjectURL); setPreviews([]); setImageFiles([]);
    } catch (err) {
      alert(err.message || "Submission failed");
    } finally { setBusy(false); }
  };

  if (ok) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="card-title justify-center text-2xl mb-2">Event Submitted!</h2>
            <p className="text-base-content/70 mb-6">We’ll review and publish once approved.</p>
            <div className="card-actions justify-center flex-col gap-2">
              <button className="btn btn-primary btn-wide" onClick={() => navigate("/search", { replace: true })}>Back to Map</button>
              <button className="btn btn-outline" onClick={() => setOk(false)}>Submit Another</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button className="btn btn-circle btn-outline" onClick={() => navigate(-1)} aria-label="Go back">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-3xl font-bold">Submit an Event</h1>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={submit} className="space-y-6">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Event Name *</span></label>
                <input type="text" name="name" value={form.name} onChange={onInput} className="input input-bordered w-full" required />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Address *</span></label>
                <AddressSearch value={form.address} onChange={onAddress} onLocationSelect={onLoc} />
                <label className="label"><span className="label-text-alt text-base-content/60">Select from suggestions for accurate location</span></label>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Event Date *</span></label>
                <div className="relative">
                  <input type="text" className="input input-bordered w-full cursor-pointer"
                    placeholder="Select a date"
                    value={form.date ? new Date(form.date).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : ""}
                    onClick={() => setShowCalendar(!showCalendar)} readOnly required />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {showCalendar && (
                  <div className="mt-2 relative z-10">
                    <calendar-date ref={calendarRef} className="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
                      min={new Date().toISOString().split('T')[0]} value={form.date}>
                      <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
                      <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
                      <calendar-month></calendar-month>
                    </calendar-date>
                    <div className="fixed inset-0 -z-10" onClick={() => setShowCalendar(false)}></div>
                  </div>
                )}
              </div>

              <div className="join w-full">
                <input name="time" className="input input-bordered join-item w-1/2" placeholder="Time (e.g., 10:00–17:00)" value={form.time} onChange={onInput} />
                <input name="price" className="input input-bordered join-item w-1/2" placeholder='Price (e.g., "Free" or "$10")' value={form.price} onChange={onInput} />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Tags (comma-separated)</span></label>
                <input type="text" name="tags" value={form.tags} onChange={onInput} className="input input-bordered w-full" placeholder="art, handmade, outdoor" />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Description (optional)</span></label>
                <textarea name="description" value={form.description} onChange={onInput}
                  className="textarea textarea-bordered w-full h-24 resize-none" placeholder="Short event bio" />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Website (optional)</span></label>
                <input type="url" name="website" value={form.website} onChange={onInput} className="input input-bordered w-full" />
              </div>

              <div className="divider">Contact</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Email *</span></label>
                  <input type="email" name="contactEmail" value={form.contactEmail} onChange={onInput}
                    className="input input-bordered w-full" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Phone (optional)</span></label>
                  <input type="tel" name="contactPhone" value={form.contactPhone} onChange={onInput}
                    className="input input-bordered w-full" />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Images (optional)</span></label>
                <input type="file" accept="image/*" multiple onChange={onImages} className="file-input file-input-bordered w-full" />
                {previews.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previews.map((src, i) => <img key={i} src={src} alt="" className="h-20 w-auto rounded-box object-cover" />)}
                  </div>
                )}
                <span className="label-text-alt text-base-content/60 mt-1">
                  For the demo, images are stored locally as data URLs.
                </span>
              </div>

              <div className="form-control mt-8 flex justify-center">
                <button type="submit" className={`btn btn-primary btn-lg ${busy ? "loading" : ""}`} disabled={busy}>
                  {busy ? "Submitting..." : "Submit Event for Review"}
                </button>
              </div>

              <p className="text-sm text-center opacity-70">* Required fields. Admin will review before publishing.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
