import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Mart1Wizard({
  imageUrl = "../public/hpmart.jpg",
  title = "Wizarding Art Mart — Hogwarts Courtyard",
  author = "Luna Sketches",
  postedAt = "Sept 30, 2025",
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(128);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("comments");

  const comments = useMemo(
    () => [
      {
        id: "c1",
        user: "James",
        text: "Excited to bring my chibi art collection! 🐾",
        when: "1h ago",
      },
      {
        id: "c2",
        user: "Lola",
        text: "Can't wait to meet everyone in person!",
        when: "45m ago",
      },
      {
        id: "c3",
        user: "Mina",
        text: "This sounds magical ✨",
        when: "10m ago",
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
        <div className="breadcrumbs text-sm mb-4">
          <ul>
            <li>Search</li>
            <li>Events</li>
            <li className="font-semibold">{title}</li>
          </ul>
        </div>

        <div className="grid lg:grid-cols-[fr_1fr] bg-base-100 shadow-xl border border-base-300">
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
                  Hosted by <span className="font-semibold">{author}</span> •{" "}
                  {postedAt}
                </div>

                {/* Artists Attending */}
                <p className="mt-3 text-xs opacity-70">Artists Attending:</p>
                <div className="mt-1 flex items-center gap-3">
                  <Link
                    // to="../public/pfp2.png"
                    className="tooltip"
                    data-tip="Pixel Piper"
                  >
                    <div className="avatar">
                      <div className="w-10 rounded-full border border-base-300">
                        <img src="../public/pfp2.png" alt="Pixel Piper" />
                      </div>
                    </div>
                  </Link>
                  <Link
                    // to="/artist/theo-ink"
                    className="tooltip"
                    data-tip="Theo Ink"
                  >
                    <div className="avatar">
                      <div className="w-10 rounded-full border border-base-300">
                        <img src="../public/pfp3.png" alt="Theo Ink" />
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Extra Tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="badge badge-outline">harry potter</div>
                  <div className="badge badge-outline">fantasy</div>
                  <div className="badge badge-outline">fanart</div>
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
              Join us for a magical afternoon at the{" "}
              <strong>Wizarding Art Mart</strong>! Happening{" "}
              <strong>September 30, 2025</strong> in the Hogwarts Courtyard.
              Browse enchanting art, chat with your favorite creators, and enjoy
              the whimsical atmosphere of this one-day event.
            </p>

            {/* Comments */}
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
              </div>

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
              </div>
            </div>

            <div className="card-actions justify-end mt-2"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
