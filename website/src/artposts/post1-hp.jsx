// src/pages/Post1HP.jsx
import React, { useMemo, useState } from "react";

/**
 * Art post page (daisyUI "retro" theme)
 * - Pass a custom image path via the `imageUrl` prop
 * - Likes toggle, Save toggle
 * - Click "Comments" or "Reviews" to reveal hard-coded content
 */
export default function Post1HP({
  imageUrl = "../public/harrypotterart.png",
  title = "Post 1 — Harry Potter",
  author = "Luna Sketches",
  postedAt = "2h ago",
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(128);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("comments"); // "comments" | "reviews"

  const comments = useMemo(
    () => [
      {
        id: "c1",
        user: "Pixel",
        text: "Love the lighting on the castle! ✨",
        when: "1h ago",
      },
      {
        id: "c2",
        user: "Theo",
        text: "The color blocking is so clean. Nice work.",
        when: "45m ago",
      },
      {
        id: "c3",
        user: "Mina",
        text: "Gives me cozy fall vibes 🍂",
        when: "10m ago",
      },
    ],
    []
  );

  const reviews = useMemo(
    () => [
      {
        id: "r1",
        user: "Avery",
        stars: 5,
        text: "Stunning composition and atmosphere. Instant favorite.",
        when: "yesterday",
      },
      {
        id: "r2",
        user: "Ken",
        stars: 4,
        text: "Great texture work—would love a wallpaper size!",
        when: "2d ago",
      },
    ],
    []
  );

  function toggleLike() {
    setLiked((prev) => {
      const next = !prev;
      setLikes((n) => (next ? n + 1 : n - 1));
      return next;
    });
  }

  function toggleSave() {
    setSaved((prev) => !prev);
  }

  return (
    <main data-theme="retro" className="min-h-screen bg-base-200">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="breadcrumbs text-sm mb-4">
          <ul>
            <li>Search</li>
            <li>Profile</li>
            <li className="font-semibold">{title}</li>
          </ul>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] bg-base-100 shadow-xl border border-base-300">
          {/* Image */}
          <figure className="bg-base-300 max-h-[70vh] overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="object-contain w-full h-full"
            />
          </figure>

          {/* Right panel */}
          <div className="card-body">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="card-title">{title}</h1>
                <div className="text-sm opacity-70">
                  by <span className="font-semibold">{author}</span> •{" "}
                  {postedAt}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className="badge badge-outline">digital</div>
                  <div className="badge badge-outline">fanart</div>
                  <div className="badge badge-outline">castle</div>
                </div>
              </div>

              {/* Like / Save */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLike}
                  className={`btn btn-sm ${
                    liked ? "btn-secondary" : "btn-outline"
                  }`}
                  aria-pressed={liked}
                >
                  {liked ? "♥ Liked" : "♡ Like"}{" "}
                  <span className="ml-1">{likes}</span>
                </button>
                <button
                  onClick={toggleSave}
                  className={`btn btn-sm ${
                    saved ? "btn-accent" : "btn-outline"
                  }`}
                  aria-pressed={saved}
                >
                  {saved ? "✓ Saved" : "☆ Save"}
                </button>
              </div>
            </div>

            <p className="mt-2">
              A moody evening at Hogwarts—mist rolling off the lake, warm lights
              glowing from ancient windows. Painted with a soft, dreamy palette.
            </p>

            {/* Tabs */}
            <div className="mt-3">
              <div role="tablist" className="tabs tabs-boxed">
                <button
                  role="tab"
                  className={`tab ${
                    activeTab === "comments" ? "tab-active" : ""
                  }`}
                  onClick={() => setActiveTab("comments")}
                >
                  Comments ({comments.length})
                </button>
                {/* <button
                  role="tab"
                  className={`tab ${
                    activeTab === "reviews" ? "tab-active" : ""
                  }`}
                  onClick={() => setActiveTab("reviews")}
                >
                  Reviews ({reviews.length})
                </button> */}
              </div>

              {/* Tab content */}
              <div className="mt-4 space-y-3">
                {activeTab === "comments" &&
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="alert bg-base-200 border border-base-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-10">
                            <span className="text-sm">
                              {c.user.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">{c.user}</div>
                          <div className="text-sm opacity-80">{c.text}</div>
                          <div className="text-xs opacity-60 mt-1">
                            {c.when}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {activeTab === "reviews" &&
                  reviews.map((r) => (
                    <div
                      key={r.id}
                      className="alert bg-base-200 border border-base-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-10">
                            <span className="text-sm">
                              {r.user.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{r.user}</div>
                            <StarRating stars={r.stars} />
                          </div>
                          <div className="text-sm opacity-80 mt-1">
                            {r.text}
                          </div>
                          <div className="text-xs opacity-60 mt-1">
                            {r.when}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="card-actions justify-end mt-2">
              {/* <button className="btn btn-primary">Share</button>
              <button className="btn">Report</button> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StarRating({ stars = 0, max = 5 }) {
  return (
    <div className="rating rating-sm">
      {Array.from({ length: max }).map((_, i) => (
        <input
          key={i}
          type="radio"
          className="mask mask-star-2 bg-orange-400"
          readOnly
          checked={i + 1 === stars}
          aria-label={`${stars} out of ${max} stars`}
        />
      ))}
    </div>
  );
}
