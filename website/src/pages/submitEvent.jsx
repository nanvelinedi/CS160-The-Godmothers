// src/pages/SubmitEvent.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 
  "pk.eyJ1Ijoic2FicmluYWt1YW5nIiwiYSI6ImNtZTdmaXQzNzAwdmQyb3EyY2h2OXhoM2wifQ.L4NKFJWUBNJkJvLP9Zc9xw";

// Geocoding component for address search
function AddressSearch({ onLocationSelect, value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    try {
      const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
      url.searchParams.set("access_token", mapboxgl.accessToken);
      url.searchParams.set("autocomplete", "true");
      url.searchParams.set("limit", "5");
      url.searchParams.set("types", "place,postcode,address");
      
      const response = await fetch(url);
      const data = await response.json();
      
      const results = data.features.map(feature => ({
        id: feature.id,
        text: feature.place_name,
        center: feature.center, // [lng, lat]
      }));
      
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    onChange(value);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => searchAddress(value), 300);
  };

  const selectSuggestion = (suggestion) => {
    onChange(suggestion.text);
    onLocationSelect(suggestion.center);
    setIsOpen(false);
    setSuggestions([]);
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
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-base-200 border-b border-base-200 last:border-b-0"
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SubmitEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    date: "",
    tags: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    lat: null,
    lng: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // Load Cally calendar component
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/cally';
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Handle calendar date selection
  useEffect(() => {
    const handleDateChange = (e) => {
      const selectedDate = e.target.value;
      if (selectedDate) {
        setFormData(prev => ({
          ...prev,
          date: selectedDate
        }));
        setShowCalendar(false);
      }
    };

    const calendar = calendarRef.current;
    if (calendar) {
      calendar.addEventListener('change', handleDateChange);
      return () => calendar.removeEventListener('change', handleDateChange);
    }
  }, [showCalendar]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (address) => {
    setFormData(prev => ({
      ...prev,
      address
    }));
  };

  const handleLocationSelect = ([lng, lat]) => {
    setFormData(prev => ({
      ...prev,
      lat,
      lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.address || !formData.date || !formData.contactEmail) {
        alert("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      if (!formData.lat || !formData.lng) {
        alert("Please select a valid address from the suggestions");
        setIsSubmitting(false);
        return;
      }

      // Process tags
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      // Create event object
      const eventData = {
        id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique pending ID
        name: formData.name,
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
        date: formData.date,
        tags: tagsArray,
        description: formData.description,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        website: formData.website,
        status: "pending",
        submittedAt: new Date().toISOString()
      };

      // Get existing pending events from localStorage
      const existingPending = JSON.parse(localStorage.getItem("pendingEvents") || "[]");
      existingPending.push(eventData);
      localStorage.setItem("pendingEvents", JSON.stringify(existingPending));

      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: "",
        address: "",
        date: "",
        tags: "",
        description: "",
        contactEmail: "",
        contactPhone: "",
        website: "",
        lat: null,
        lng: null
      });

    } catch (error) {
      console.error("Error submitting event:", error);
      alert("There was an error submitting your event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSearch = () => {
  navigate(-1); // Goes back to the previous page in history
};

  const handleSubmitAnother = () => {
    setSubmitSuccess(false);
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="card-title justify-center text-2xl mb-2">Event Submitted!</h2>
            <p className="text-base-content/70 mb-6">
              Thank you for submitting your event. It will be reviewed by our team and published once approved.
            </p>
            <div className="card-actions justify-center flex-col gap-2">
              <button 
                className="btn btn-primary btn-wide"
                onClick={handleBackToSearch}
              >
                Back to Search
              </button>
              <button 
                className="btn btn-outline"
                onClick={handleSubmitAnother}
              >
                Submit Another Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            className="btn btn-circle btn-outline"
            onClick={handleBackToSearch}
            aria-label="Go back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold">Submit an Event</h1>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Event Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="e.g., Downtown Art Market"
                  required
                />
              </div>

              {/* Address */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Address *</span>
                </label>
                <AddressSearch
                  value={formData.address}
                  onChange={handleAddressChange}
                  onLocationSelect={handleLocationSelect}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Start typing and select from suggestions to ensure accurate location
                  </span>
                </label>
              </div>

              {/* Date with Cally Calendar */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Event Date *</span>
                </label>
                
                {/* Date input display */}
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered w-full cursor-pointer"
                    placeholder="Select a date"
                    value={formData.date ? new Date(formData.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : ''}
                    onClick={() => setShowCalendar(!showCalendar)}
                    readOnly
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Cally Calendar */}
                {showCalendar && (
                  <div className="mt-2 relative z-10">
                    <calendar-date 
                      ref={calendarRef}
                      className="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                    >
                      <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                      </svg>
                      <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                      </svg>
                      <calendar-month></calendar-month>
                    </calendar-date>
                    
                    {/* Backdrop to close calendar */}
                    <div 
                      className="fixed inset-0 -z-10" 
                      onClick={() => setShowCalendar(false)}
                    ></div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Tags</span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="e.g., handmade, paintings, ceramics"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Separate multiple tags with commas
                  </span>
                </label>
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full h-24 resize-none"
                  placeholder="Tell us more about your event... What can visitors expect? What types of vendors or activities will be there?"
                />
              </div>

              {/* Website */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Website (Optional)</span>
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="https://your-event-website.com"
                />
              </div>

              {/* Contact Information */}
              <div className="divider">Contact Information</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email *</span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Phone (Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-control mt-8 flex justify-center">
                <button
                  type="submit"
                  className={`btn btn-primary btn-lg ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Event for Review'}
                </button>
              </div>
              
              <p className="text-sm text-base-content/60 text-center">
                * Required fields. Your event will be reviewed before being published.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}