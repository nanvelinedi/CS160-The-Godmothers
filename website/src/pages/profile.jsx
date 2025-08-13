// src/pages/profile.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";
import marketsData from "../data/markets.json";
import { getAllPosts, POSTS_EVENT } from "../lib/postStore";
import {
  getBookmarks,
  clearBookmarks,
  BOOKMARKS_EVENT,
  toggleBookmark as storeToggle,
} from "../lib/bookmarks";
import { ARTISTS } from "./searchpage"; // Import your unified artist/post/mart data
import UserPfp from "../images/User_pfp.png"; // Adjust extension and relative path as needed
import { Images } from "lucide-react"; // Importing Images icon from lucide-react

// Helper: flatten marts from ARTISTS
const flattenMarts = (artists) =>
  artists.flatMap((a) =>
    (a.marts || []).map((m) => ({
      ...m,
      artistId: a.id,
      artistName: a.name,
      artistAvatar: a.avatarIMG,
    }))
  );

export default function Profile() {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(() =>
    parseInt(localStorage.getItem("followingCount") || "0", 10)
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedSavedEventId, setSelectedSavedEventId] = useState(null);

  // Edit Profile modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("John");
  const [bio, setBio] = useState("No bio yet...");
  const [role, setRole] = useState("Artist");
  const [profileImage, setProfileImage] = useState(UserPfp); // Use imported image

  // Bookmarks
  const [bookmarksVersion, setBookmarksVersion] = useState(0);

  // Sync following count from Home.jsx events
  useEffect(() => {
    const updateFollowing = () => {
      setFollowing(parseInt(localStorage.getItem("followingCount") || "0", 10));
    };
    window.addEventListener("FOLLOWING_EVENT", updateFollowing);
    updateFollowing();
    return () => window.removeEventListener("FOLLOWING_EVENT", updateFollowing);
  }, []);

  // My posts
  const [postsVersion, setPostsVersion] = useState(0);
  useEffect(() => {
    const onPosts = () => setPostsVersion((v) => v + 1);
    window.addEventListener(POSTS_EVENT, onPosts);
    window.addEventListener("focus", onPosts);
    return () => {
      window.removeEventListener(POSTS_EVENT, onPosts);
      window.removeEventListener("focus", onPosts);
    };
  }, []);
  const myPosts = useMemo(() => getAllPosts(), [postsVersion]);

  // Bookmarks hook
  useEffect(() => {
    const onChange = () => setBookmarksVersion((v) => v + 1);
    window.addEventListener(BOOKMARKS_EVENT, onChange);
    return () => window.removeEventListener(BOOKMARKS_EVENT, onChange);
  }, []);

  const bookmarkedIds = useMemo(
    () => new Set((getBookmarks() || []).map(String)),
    [bookmarksVersion]
  );
  const bookmarkedEvents = useMemo(
    () => (marketsData || []).filter((m) => bookmarkedIds.has(String(m.id))),
    [bookmarkedIds]
  );

  useEffect(() => {
    if (!bookmarkedEvents.length && selectedSavedEventId !== null) {
      setSelectedSavedEventId(null);
    } else if (
      selectedSavedEventId !== null &&
      !bookmarkedEvents.some(
        (e) => String(e.id) === String(selectedSavedEventId)
      )
    ) {
      setSelectedSavedEventId(null);
    }
  }, [bookmarkedEvents, selectedSavedEventId]);

  const handleFollow = () => {
    setIsFollowing((f) => !f);
    setFollowers((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  const handleSaveProfile = () => {
    setIsEditModalOpen(false);
    console.log("Updated profile:", { profileName, bio, role, profileImage });
  };

  const toggleFromProfile = (id) => {
    storeToggle(id);
  };

  // Upcoming events
  const marts = flattenMarts(ARTISTS);
  const upcomingEvents = marts
    .filter((m) => new Date(m.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* ---------- HEADER ---------- */}
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
        <div className="flex gap-8 mt-6 text-lg font-semibold">
          <p>
            Followers <span className="font-bold">{followers}</span>
          </p>
          <p>
            Following <span className="font-bold">{following}</span>
          </p>
        </div>
        <div className="mt-4 space-y-1 text-base">
          <p>{bio}</p>
        </div>
        <div className="flex gap-6 mt-6 text-2xl">
          <FaCalendarAlt
            className={`cursor-pointer ${
              activeTab === "calendar" ? "text-primary" : ""
            }`}
            onClick={() => setActiveTab("calendar")}
          />
          <Images
            className={`cursor-pointer ${
              activeTab === "posts" ? "text-primary" : ""
            }`}
            onClick={() => setActiveTab("posts")}
          />
        </div>
      </div>

      {/* ---------- TAB CONTENT ---------- */}
      {activeTab === "calendar" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
          {upcomingEvents.length ? (
            <div className="flex gap-8">
              {/* Event list */}
              <div className="flex-1 space-y-4 border-l-4 border-primary pl-6">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 bg-base-100 border rounded-xl shadow-sm p-2"
                  >
                    {/* Smaller date box */}
                    <div className="flex flex-col items-center justify-center w-20 h-20 bg-base-200 rounded-2xl">
                      <div className="text-xl font-extrabold text-primary">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="uppercase text-xs font-bold text-primary">
                        {new Date(event.date).toLocaleString("en-US", {
                          month: "short",
                        })}
                      </div>
                      <div className="text-[10px] text-base-content/70">
                        {new Date(event.date).getFullYear()}
                      </div>
                    </div>
                    {event.martimagIMG && (
                      <img
                        src={event.martimagIMG}
                        alt={event.name}
                        className="w-24 h-16 object-cover rounded-lg border border-base-300"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{event.name}</div>
                      <div className="text-xs opacity-70">
                        {event.location} •{" "}
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      {event.description && (
                        <div className="text-xs opacity-60 truncate">
                          {event.description}
                        </div>
                      )}
                      {event.tags && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {event.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="badge badge-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bigger calendar sidebar with smaller today highlight */}
              <div className="hidden md:flex flex-col items-end w-56 sticky top-20">
                <div className="w-full rounded-xl border bg-base-100 p-6 shadow">
                  <div className="flex items-center justify-between font-bold text-sm mb-4">
                    <span>
                      {new Date().toLocaleString("en-US", { month: "long" })}{" "}
                      {new Date().getFullYear()}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-sm">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                      <div key={d} className="font-bold text-center opacity-50">
                        {d}
                      </div>
                    ))}
                    {(() => {
                      const now = new Date();
                      const firstOfMonth = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1
                      );
                      const startDay = (firstOfMonth.getDay() + 6) % 7;
                      const daysInMonth = new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        0
                      ).getDate();
                      const today = now.getDate();

                      const eventDaySet = new Set(
                        upcomingEvents
                          .map((e) => new Date(e.date))
                          .filter(
                            (d) =>
                              d.getMonth() === now.getMonth() &&
                              d.getFullYear() === now.getFullYear()
                          )
                          .map((d) => d.getDate())
                      );

                      const cells = [];
                      for (let i = 0; i < startDay; ++i)
                        cells.push(<div key={"empty" + i} />);
                      for (let d = 1; d <= daysInMonth; ++d) {
                        const isToday = d === today;
                        const hasEvent = eventDaySet.has(d);
                        cells.push(
                          <div key={d} className="relative text-center">
                            <span
                              className={
                                isToday
                                  ? "inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-white text-sm"
                                  : hasEvent
                                  ? "text-primary font-bold"
                                  : undefined
                              }
                            >
                              {d}
                            </span>
                            {hasEvent && !isToday && (
                              <span className="absolute left-1/2 -bottom-1 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></span>
                            )}
                          </div>
                        );
                      }
                      return cells;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>No upcoming events.</p>
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
              {myPosts.map((p) => (
                <Link
                  key={p.id}
                  to={`/post/${p.id}`}
                  className="block aspect-square overflow-hidden rounded-xl border hover:ring hover:ring-primary/30"
                >
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt="post cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs opacity-60">
                      No Image
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAVED EVENTS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Saved Events</h2>
          {bookmarkedEvents.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearBookmarks}>
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
                      <button
                        type="button"
                        className="absolute top-3 right-3 btn btn-ghost btn-xs btn-circle text-warning z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFromProfile(ev.id);
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
                      {ev.image && (
                        <img
                          src={ev.image}
                          alt={ev.name}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      )}
                      <h3 className="card-title text-base line-clamp-2 mb-1">
                        {ev.name}
                      </h3>
                      <p className="opacity-80 text-sm mb-2 line-clamp-2">
                        {ev.address}
                      </p>
                      <span className="badge badge-outline text-xs mb-2">
                        {ev.date
                          ? new Date(ev.date).toLocaleDateString()
                          : "Date TBA"}
                      </span>
                      {ev.tags?.length && (
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {ev.tags.slice(0, 3).map((t) => (
                            <span key={t} className="badge badge-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="alert">
            <span>
              No saved events yet. Go bookmark some from the Explorer!
            </span>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
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
