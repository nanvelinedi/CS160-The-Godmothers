// Home.jsx
// Landing page — auto-populates Featured Artists, Digital Art, & Art Marts from ARTISTS in searchpage.jsx
import React, { useState } from "react";
import { ARTISTS } from "./searchpage"; // Adjust the path as needed

// ================== Real Data Import (REQUIRED) ==================
// Copy-paste the ARTISTS array below, or import it if modularized:
//const ARTISTS = [
// ...PASTE your ARTISTS array here from searchpage.jsx...
//];

// Helper: flatten posts/marts across ARTISTS for easy listing
const flattenPosts = (artists) =>
  artists.flatMap((a) =>
    (a.posts || []).map((p) => ({
      ...p,
      artistId: a.id,
      artistName: a.name,
      artistAvatar: a.avatarIMG,
    }))
  );

const flattenMarts = (artists) =>
  artists.flatMap((a) =>
    (a.marts || []).map((m) => ({
      ...m,
      artistId: a.id,
      artistName: a.name,
      artistAvatar: a.avatarIMG,
    }))
  );

// ------------- Main Home Page ----------------
export default function Home() {
  // ========== Follow state (persisted/set for Profile.jsx sync) ==========
  const [followingSet, setFollowingSet] = useState(() => {
    return new Set(
      JSON.parse(localStorage.getItem("followingArtists") || "[]")
    );
  });

  const toggleFollow = (artistId) => {
    const updated = new Set(followingSet);
    if (updated.has(artistId)) {
      updated.delete(artistId);
    } else {
      updated.add(artistId);
    }
    setFollowingSet(updated);
    localStorage.setItem("followingArtists", JSON.stringify([...updated]));
    localStorage.setItem("followingCount", updated.size); // sync with Profile
    window.dispatchEvent(new Event("FOLLOWING_EVENT")); // for live updates
  };

  // ========== Featured Artists ==========
  // Show all artists in ARTISTS (or filter/top as needed)
  const featuredCreators = ARTISTS;

  // ========== Trending Digital Arts ==========
  const trendingDigitalArts = flattenPosts(ARTISTS);

  // ========== Trending Art Marts ==========
  const trendingMarts = flattenMarts(ARTISTS);

  // ---------- Card Components -----------
  const CreatorCard = ({ artist }) => (
    <div className="flex flex-col items-center bg-base-100 rounded-2xl shadow p-4 w-32 mx-2">
      {/* User_pfp placeholder for you to swap images */}
      <div className="mb-2">
        <img
          src={artist.avatarIMG || "User_pfp"} // replace "User_pfp" with your image
          alt={artist.name}
          className="rounded-full w-16 h-16 object-cover border border-base-300"
        />
      </div>
      <div className="font-semibold text-center text-sm mb-2">
        {artist.name}
      </div>
      <button
        className={`btn btn-xs w-full ${
          followingSet.has(artist.id) ? "btn-success" : "btn-error"
        }`}
        onClick={() => toggleFollow(artist.id)}
      >
        {followingSet.has(artist.id) ? "Following" : "Follow"}
      </button>
    </div>
  );

  const TrendingArtCard = ({ post }) => (
    <div className="flex flex-col bg-base-100 rounded-2xl shadow p-3 w-[170px] mx-2">
      {/* Preview image */}
      <div className="aspect-square overflow-hidden rounded-xl mb-3 border border-base-300 bg-base-200 flex items-center justify-center">
        <img
          src={post.imagIMG}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="font-semibold text-sm leading-tight mb-1 line-clamp-1">
        {post.title}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <img
          src={post.artistAvatar || "User_pfp"}
          alt={post.artistName}
          className="w-6 h-6 rounded-full object-cover border border-base-300"
        />
        <span className="text-xs text-base-content/70">{post.artistName}</span>
      </div>
      {/* If price info exists, show it */}
      {post.price && (
        <div className="flex items-center gap-1 mt-auto">
          <span className="font-bold text-xs text-primary">{post.price}</span>
          <span className="text-xs text-base-content/70">ETH</span>
        </div>
      )}
    </div>
  );

  const TrendingMartCard = ({ mart }) => (
    <div className="flex flex-col bg-base-100 rounded-2xl shadow p-4 w-[220px] mx-2">
      {mart.martimagIMG && (
        <div className="rounded-xl mb-2 overflow-hidden border border-base-300 bg-base-200 flex items-center justify-center h-20">
          <img
            src={mart.martimagIMG}
            alt={mart.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="font-bold text-base mb-1">{mart.name}</div>
      <div className="text-xs mb-1">
        {mart.location} • {mart.date}
      </div>
      <div className="text-sm opacity-70 mb-1">{mart.description}</div>
      <div className="flex gap-1 mt-1 flex-wrap">
        {mart.tags &&
          mart.tags.map((tag) => (
            <span key={tag} className="badge badge-xs">
              {tag}
            </span>
          ))}
      </div>
      <div className="mt-1 text-xs opacity-60">
        {mart.artistName && `hosted by ${mart.artistName}`}
      </div>
    </div>
  );

  // ----------------- Main Render ----------------
  return (
    <div className="min-h-screen bg-base-200" data-theme="retro">
      {/* Header Section */}
      <div className="py-8 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Welcome John</h1>
        <p className="text-lg text-base-content/70">
          Discover, collect, and sell extraordinary digital art
        </p>
      </div>

      {/* Featured Artists */}
      <section className="py-6 px-4">
        <h2 className="text-xl font-extrabold mb-4">Featured Artists</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {featuredCreators.map((artist) => (
            <CreatorCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      {/* Trending Digital Art */}
      <section className="py-6 px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-extrabold">Trending Digital Art</h2>
          <span className="text-xs text-error"></span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {trendingDigitalArts.map((post) => (
            <TrendingArtCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Trending Art Marts */}
      <section className="py-6 px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-extrabold">Trending Art Marts</h2>
          <span className="text-xs text-error"></span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {trendingMarts.map((mart) => (
            <TrendingMartCard key={mart.id} mart={mart} />
          ))}
        </div>
      </section>
    </div>
  );
}
