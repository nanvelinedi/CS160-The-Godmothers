import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaPlus, FaPencilAlt, FaShoppingBag } from "react-icons/fa";
import marketsData from "../data/markets.json";
import { getAllPosts, POSTS_EVENT } from "../lib/postStore";
import {
  getBookmarks,
  clearBookmarks,
  BOOKMARKS_EVENT,
  toggleBookmark as storeToggle,
} from "../lib/bookmarks";

/* ---- Demo calendar data (not related to bookmarks) ---- */
const sampleEvents = [
  { id: 1, date: "2025-08-12", title: "SF Art Mart", time: "9:00 AM - 5:00 PM" },
  { id: 2, date: "2025-08-15", title: "Berkeley Crafts Fair", time: "11:00 AM - 6:00 PM" },
];

export default function Profile() {
  const [followers, setFollowers] = useState(0);
  const [following] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedSavedEventId, setSelectedSavedEventId] = useState(null);

  // Edit Profile modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("New User");
  const [bio, setBio] = useState("No bio yet...");
  const [role, setRole] = useState("Artist");
  const [profileImage, setProfileImage] = useState("https://placehold.co/150x150");

  /* ===== Bookmarks: live-sync with localStorage (same helpers as Search) ===== */
  const [bookmarksVersion, setBookmarksVersion] = useState(0);

  // My Posts refresh when posts are saved
  const [postsVersion, setPostsVersion] = useState(0);
  useEffect(() => {
    const onPosts = () => setPostsVersion(v => v + 1);
    window.addEventListener(POSTS_EVENT, onPosts);
    window.addEventListener("focus", onPosts); // refresh when returning from New Post page
    return () => {
      window.removeEventListener(POSTS_EVENT, onPosts);
      window.removeEventListener("focus", onPosts);
    };
  }, []);
  const myPosts = useMemo(() => getAllPosts(), [postsVersion]);

  // Listen for global bookmark changes (Search page, other tabs, etc.)
  useEffect(() => {
    const onChange = () => setBookmarksVersion(v => v + 1);
    window.addEventListener(BOOKMARKS_EVENT, onChange);
    return () => window.removeEventListener(BOOKMARKS_EVENT, onChange);
  }, []);

  // IDs are normalized to strings in the helper; mirror that here
  const bookmarkedIds = useMemo(
    () => new Set((getBookmarks() || []).map(String)),
    [bookmarksVersion]
  );

  // Map IDs → full event objects from markets.json
  const bookmarkedEvents = useMemo(
    () => (marketsData || []).filter(m => bookmarkedIds.has(String(m.id))),
    [bookmarkedIds]
  );

  // Keep selection valid if list changes
  useEffect(() => {
    if (!bookmarkedEvents.length && selectedSavedEventId !== null) {
      setSelectedSavedEventId(null);
    } else if (
      selectedSavedEventId !== null &&
      !bookmarkedEvents.some(e => String(e.id) === String(selectedSavedEventId))
    ) {
      setSelectedSavedEventId(null);
    }
  }, [bookmarkedEvents, selectedSavedEventId]);

  const handleFollow = () => {
    setIsFollowing(f => !f);
    setFollowers(prev => (isFollowing ? prev - 1 : prev + 1));
  };

  const handleSaveProfile = () => {
    setIsEditModalOpen(false);
    console.log("Updated profile:", { profileName, bio, role, profileImage });
  };

  const toggleFromProfile = (id) => {
    // Uses same toggle as Search; will emit BOOKMARKS_EVENT
    storeToggle(id);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* ---------- PROFILE HEADER ---------- */}
      <div className="bg-base-100 p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-6">
          <img
            src={profileImage}
            alt="Profile"
            className="rounded-full w-36 h-36 object-cover"
          />

          <div>
            <h1 className="text-3xl font-bold">{profileName}</h1>
            <p className="text-lg text-base-content/70">{role}</p>
            <div className="mt-3 flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={handleFollow}>
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                •••
              </button>
            </div>
          </div>
        </div>

        {/* Followers/Following */}
        <div className="flex gap-8 mt-6 text-lg font-semibold">
          <p>
            Followers <span className="font-bold">{followers}</span>
          </p>
          <p>
            Following <span className="font-bold">{following}</span>
          </p>
        </div>

        {/* Bio */}
        <div className="mt-4 space-y-1 text-base">
          <p>{bio}</p>
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-6 mt-6 text-2xl">
          <FaCalendarAlt
            className={`cursor-pointer ${activeTab === "calendar" ? "text-primary" : ""}`}
            onClick={() => setActiveTab("calendar")}
            title="Calendar"
          />
          <FaPlus
            className={`cursor-pointer ${activeTab === "posts" ? "text-primary" : ""}`}
            onClick={() => setActiveTab("posts")}
            title="Posts"
          />
        </div>
      </div>

      {/* ---------- TAB CONTENT ---------- */}
      <div className="bg-base-100 p-6 rounded-xl shadow-lg">
        {activeTab === "calendar" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
            {sampleEvents.length > 0 ? (
              sampleEvents.map((event) => (
                <div key={event.id} className="p-4 mb-2 border rounded-lg">
                  <p className="font-bold">{event.title}</p>
                  <p>
                    {event.date} • {event.time}
                  </p>
                </div>
              ))
            ) : (
              <p>No upcoming events</p>
            )}
          </div>
        )}
        {activeTab === "posts" && (
          <div>
            <h2 className="text-xl font-bold mb-4">My Posts</h2>
            {myPosts.length === 0 ? (
              <p>No posts yet. Create one from the “New Post” button.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {myPosts.map(p => (
                  <Link
                    key={p.id}
                    to={`/post/${p.id}`}
                    className="block aspect-square overflow-hidden rounded-xl border hover:ring hover:ring-primary/30"
                  >
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt="post cover" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs opacity-60">No Image</div>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------- SAVED (BOOKMARKED) EVENTS ---------- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Saved Events</h2>
          {bookmarkedEvents.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => clearBookmarks()} // BOOKMARKS_EVENT will handle UI refresh
            >
              Clear all
            </button>
          )}
        </div>

        {bookmarkedEvents.length > 0 ? (
          <div className="max-w-[900px] w-[900px] overflow-x-auto mx-auto rounded-box bg-base-100 shadow p-2">
            <div className="flex gap-4 snap-x snap-mandatory">
              {bookmarkedEvents.map((ev) => (
                <div key={ev.id} className="shrink-0 snap-start w-80">
                  <div
                    className={`card bg-base-100 shadow relative transition cursor-pointer ${
                      selectedSavedEventId === ev.id
                        ? "ring-2 ring-primary"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedSavedEventId(ev.id)}
                  >
                    <div className="card-body p-4">
                      {/* Bookmark button - positioned in upper right */}
                      <button
                        type="button"
                        className="absolute top-3 right-3 btn btn-ghost btn-xs btn-circle text-warning z-10"
                        onClick={(e) => {
                          e.stopPropagation(); // don't toggle selection
                          toggleFromProfile(ev.id); // unbookmark → card disappears via event
                        }}
                        aria-label="Remove bookmark"
                        title="Remove bookmark"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>

                      {/* Title */}
                      <div className="pr-8 mb-2">
                        <h3 className="card-title text-base line-clamp-2">{ev.name}</h3>
                      </div>
                      
                      {/* Location */}
                      <p className="opacity-80 text-sm line-clamp-2 mb-2">{ev.address}</p>
                      
                      {/* Date */}
                      <div className="mb-2">
                        <span className="badge badge-outline text-xs">
                          {ev.date ? new Date(ev.date).toLocaleDateString() : "Date TBA"}
                        </span>
                      </div>

                      {ev.tags?.length ? (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {ev.tags.slice(0, 3).map((t) => (
                            <span key={t} className="badge badge-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="alert">
            <span>No saved events yet. Go bookmark some from the Explorer!</span>
          </div>
        )}
      </div>

      {/* ---------- EDIT PROFILE MODAL ---------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

            <label className="block mb-2">Profile Image URL</label>
            <input
              type="text"
              className="input input-bordered w-full mb-4"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
            />

            <label className="block mb-2">Display Name</label>
            <input
              type="text"
              className="input input-bordered w-full mb-4"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />

            <label className="block mb-2">Role</label>
            <select
              className="select select-bordered w-full mb-4"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Artist</option>
              <option>Vendor</option>
              <option>Participant</option>
              <option>Other</option>
            </select>

            <label className="block mb-2">Bio</label>
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                className="btn btn-outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveProfile}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}