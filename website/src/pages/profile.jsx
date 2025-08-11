import { useState } from "react";
import { FaCalendarAlt, FaPlus, FaPencilAlt, FaShoppingBag } from "react-icons/fa";

// change later with API stuff
const sampleEvents = [
  { id: 1, date: "2025-08-12", title: "SF Art Mart", time: "9:00 AM - 5:00 PM" },
  { id: 2, date: "2025-08-15", title: "Berkeley Crafts Fair", time: "11:00 AM - 6:00 PM" }
];

const sampleSavedEvents = [
  { id: 1, title: "Urban Air Market", date: "2025-07-29", location: "San Pablo, CA", rating: 5, img: "https://placehold.co/400x300" },
  { id: 2, title: "Artisan Festival", date: "2025-08-05", location: "Oakland, CA", rating: 4, img: "https://placehold.co/400x300" }
];

function Profile() {
  const [followers, setFollowers] = useState(0);
  const [following] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [savedEventIndex, setSavedEventIndex] = useState(0);

  // Toggle follow/unfollow
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowers((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  // swipe navigation for saved events 
  const handleNextSavedEvent = () => {
    setSavedEventIndex((prev) => (prev + 1) % sampleSavedEvents.length);
  };
  const handlePrevSavedEvent = () => {
    setSavedEventIndex((prev) => (prev - 1 + sampleSavedEvents.length) % sampleSavedEvents.length);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">


      {/* ---------- PROFILE HEADER --------------- */}
      <div className="bg-base-100 p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-6">
          <img
            src="https://placehold.co/150x150"
            alt="Profile"
            className="rounded-full w-36 h-36 object-cover"
          />

          {/* -------------- PROFILE INFO -------------- */}
          <div>
            <h1 className="text-3xl font-bold">New User</h1>
            <p className="text-lg text-base-content/70">Artist</p>
            <div className="mt-3 flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={handleFollow}>
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button className="btn btn-outline btn-sm">•••</button>
            </div>
          </div>
        </div>

        {/* ----------------NAVIGATION TABS -------------- */}
        <div className="flex gap-8 mt-6 text-lg font-semibold">
          <p>Followers <span className="font-bold">{followers}</span></p>
          <p>Following <span className="font-bold">{following}</span></p>
        </div>

        {/* ----------------BIO -------------- */}
        <div className="mt-4 space-y-1 text-base">
          <p>No bio yet...</p>
        </div>

        {/* --------------- Navigation Tabs -------------- */}
        <div className="flex gap-6 mt-6 text-2xl">
          <FaCalendarAlt
            className={`cursor-pointer ${activeTab === "calendar" ? "text-primary" : ""}`}
            onClick={() => setActiveTab("calendar")}
          />
          <FaPlus
            className={`cursor-pointer ${activeTab === "add" ? "text-primary" : ""}`}
            onClick={() => setActiveTab("add")}
          />
          <FaPencilAlt
            className={`cursor-pointer ${activeTab === "reviews" ? "text-primary" : ""}`}
            onClick={() => setActiveTab("reviews")}
          />
          <FaShoppingBag
            className={`cursor-pointer ${activeTab === "shop" ? "text-primary" : ""}`}
            onClick={() => setActiveTab("shop")}
          />
        </div>
      </div>

      {/* ====== Tab Content ====== */}
      <div className="bg-base-100 p-6 rounded-xl shadow-lg">
        {activeTab === "calendar" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
            {sampleEvents.length > 0 ? (
              sampleEvents.map((event) => (
                <div key={event.id} className="p-4 mb-2 border rounded-lg">
                  <p className="font-bold">{event.title}</p>
                  <p>{event.date} • {event.time}</p>
                </div>
              ))
            ) : (
              <p>No upcoming events</p>
            )}
          </div>
        )}
        {activeTab === "add" && <p>[Post creation form will go here]</p>}
        {activeTab === "reviews" && <p>[User reviews will go here]</p>}
        {activeTab === "shop" && <p>[Shop items will go here]</p>}
      </div>

      {/* ====== Saved Events Swipe ====== */}
      <div>
        <h2 className="text-xl font-bold mb-4">Saved Events</h2>
        {sampleSavedEvents.length > 0 ? (
          <div className="flex items-center gap-4">
            <button className="btn btn-outline btn-sm" onClick={handlePrevSavedEvent}>◀</button>
            <div className="card card-side bg-base-100 shadow-lg w-full max-w-3xl">
              <figure className="w-48 h-48">
                <img
                  src={sampleSavedEvents[savedEventIndex].img}
                  alt={sampleSavedEvents[savedEventIndex].title}
                  className="object-cover w-full h-full"
                />
              </figure>
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <span className="badge badge-lg">{sampleSavedEvents[savedEventIndex].date}</span>
                  <span className="text-yellow-500">
                    {"★".repeat(sampleSavedEvents[savedEventIndex].rating)}
                  </span>
                </div>
                <h3 className="card-title">{sampleSavedEvents[savedEventIndex].title}</h3>
                <p className="text-sm text-base-content/70">📍 {sampleSavedEvents[savedEventIndex].location}</p>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleNextSavedEvent}>▶</button>
          </div>
        ) : (
          <p>No saved events</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
