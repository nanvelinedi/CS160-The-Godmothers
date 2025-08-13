import React from "react";
import { Link } from "react-router-dom";

export default function FAQPage() {
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState("All");

  const faqs = React.useMemo(
    () => [
      {
        q: "How do I find artists with a specific style?",
        a: (
          <>
            Use the search bar at the top of any page. Our AI-powered search
            understands natural language, so try things like{" "}
            <em>“watercolor landscapes”</em>, <em>“cozy cottagecore”</em>, or{" "}
            <em>“manga line art by Bay Area artists”</em>. We’ll surface
            artists, posts, and collections that match.
          </>
        ),
        cat: "Search & Discovery",
        keywords: ["search", "ai", "style", "artists", "discover"],
      },
      {
        q: "How do I find art marts near me?",
        a: (
          <>
            Head to the{" "}
            <Link className="link" to="/map">
              Map
            </Link>{" "}
            in the navbar. You can pan/zoom the map, filter by date, and search
            a city or ZIP code to see upcoming markets in that area.
          </>
        ),
        cat: "Events & Markets",
        keywords: ["map", "near me", "markets", "location", "geosearch"],
      },
      {
        q: "How do I become an artist or an organizer on the platform?",
        a: (
          <>
            Apply via our short form here:&nbsp;
            <Link className="link" to="/apply">
              Become an Artist/Organizer
            </Link>
            . Once submitted, an admin will review your application. You’ll
            receive an email when you’re approved.
          </>
        ),
        cat: "Artists & Organizers",
        keywords: ["apply", "approval", "artist", "organizer", "onboarding"],
      },
      {
        q: "How do I make a post about an event?",
        a: (
          <>
            Click the <span className="badge badge-outline">Make a Post</span>{" "}
            icon in the navbar and choose <strong>Organize an Event</strong>.
            Fill in the details (date, venue, vendors, cover image). Your event
            will be reviewed by an admin before it’s publicly listed.
          </>
        ),
        cat: "Posting",
        keywords: ["post", "event", "organize", "admin", "approval"],
      },
      {
        q: "How do I post my artwork?",
        a: (
          <>
            Click the <span className="badge badge-outline">Make a Post</span>{" "}
            icon and select <strong>Art Post</strong>. Add images/videos, title,
            tags, and optional price. You can also schedule a post for later.
          </>
        ),
        cat: "Posting",
        keywords: ["art", "upload", "gallery", "media", "schedule"],
      },
      {
        q: "What can I ask the AI search?",
        a: (
          <>
            Anything related to styles, mediums, subjects, or locations. Try
            prompts like <em>“ceramic mugs under $50”</em>,{" "}
            <em>“illustrators who draw cats”</em>, or{" "}
            <em>“vendors at Oakland markets this month”</em>.
          </>
        ),
        cat: "Search & Discovery",
        keywords: ["ai", "query", "natural language", "filter"],
      },
      {
        q: "How do I update my profile and portfolio?",
        a: (
          <>
            Go to{" "}
            <Link className="link" to="/profile">
              Profile
            </Link>{" "}
            → <strong>Edit</strong>. You can update your bio, links, cover
            image, and portfolio items. Organizers can add market credentials
            and vendor guidelines.
          </>
        ),
        cat: "Account",
        keywords: ["profile", "portfolio", "settings", "bio", "links"],
      },
      {
        q: "I need more help or I’m running into issues.",
        a: (
          <>
            We’ve got you! Visit{" "}
            <Link className="link" to="/contact">
              Contact Us
            </Link>{" "}
            or email{" "}
            <a className="link" href="mailto:support@artmarts.io">
              support@artmarts.io
            </a>
            . We typically reply within one business day.
          </>
        ),
        cat: "Support",
        keywords: ["help", "support", "bug", "contact", "issue"],
      },
    ],
    []
  );

  const categories = React.useMemo(() => {
    const set = new Set(["All"]);
    faqs.forEach((f) => set.add(f.cat));
    return Array.from(set);
  }, [faqs]);

  const filtered = faqs.filter((f) => {
    const inCat = activeCat === "All" || f.cat === activeCat;
    const q = query.trim().toLowerCase();
    if (!q) return inCat;
    const hay = [
      f.q.toLowerCase(),
      ...(f.keywords || []).map((k) => k.toLowerCase()),
    ].join(" ");
    return inCat && hay.includes(q);
  });

  // SEO: JSON-LD FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: typeof f.a === "string" ? f.a : "See answer on the page.", // keep simple; links are on-page
      },
    })),
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero / Header */}
      <section className="bg-base-100 border-b">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                Help Center & FAQ
              </h1>
              <p className="mt-2 text-base-content/70">
                Quick answers about finding artists, markets, and posting your
                work.
              </p>
            </div>

            {/* Search */}
            <label className="input input-bordered flex items-center gap-2 w-full md:w-[28rem]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" strokeWidth="2" />
              </svg>
              <input
                type="text"
                className="grow"
                placeholder="Search FAQs (e.g., watercolor, map, posting)…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setQuery("")}
                >
                  Clear
                </button>
              )}
            </label>
          </div>

          {/* Category Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                className={`btn btn-sm ${
                  activeCat === c ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => setActiveCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="h-150 bg-base-200">
        {filtered.length === 0 ? (
          <div className="alert">
            <span>No results. Try different keywords or reset filters.</span>
            <button
              className="btn btn-sm ml-auto"
              onClick={() => {
                setQuery("");
                setActiveCat("All");
              }}
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <div className="join join-vertical w-full">
                {filtered.map((f, i) => (
                  <div
                    key={i}
                    className="collapse collapse-plus join-item bg-base-100 border"
                  >
                    <input type="checkbox" />
                    <div className="collapse-title text-lg font-semibold">
                      {f.q}
                      <div className="badge badge-outline ml-3">{f.cat}</div>
                    </div>
                    <div className="collapse-content leading-relaxed">
                      <p>{f.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpful Links / Shortcuts */}
            <aside className="md:col-span-4">
              {/* <div className="card bg-base-100 border">
                <div className="card-body">
                  <h3 className="card-title">Quick Links</h3>
                  <ul className="menu">
                    <li>
                      <Link to="/map">🗺️ Open Map</Link>
                    </li>
                    <li>
                      <Link to="/apply">🧑‍🎨 Apply: Artist / Organizer</Link>
                    </li>
                    <li>
                      <Link to="/create">📝 Make a Post</Link>
                    </li>
                    <li>
                      <Link to="/contact">📮 Contact Us</Link>
                    </li>
                  </ul>
                </div>
              </div> */}

              {/* Contact Us */}
              <div className="card  bg-primary text-primary-content mt-6 mr-6">
                <div className="card-body">
                  <h3 className="card-title">Contact Us</h3>
                  <p className="opacity-90">
                    We’re here to help with search, posting, or event setup.
                  </p>
                  <div className="mt-2 space-y-1">
                    <p>📞 (510) 555-0148</p>
                    <p>📧 support@artmarts.io</p>
                    <p>📍 2450 Bancroft Way, Berkeley, CA 94704</p>
                  </div>
                  {/* <div className="card-actions justify-end mt-3">
                    <Link className="btn" to="/contact">
                      Get Support
                    </Link>
                  </div> */}
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="bg-base-100 border-t">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-auto">
          <div>
            <h4 className="text-xl font-bold">Still stuck?</h4>
            <p className="text-base-content/70">
              Tell us what you were trying to do and we’ll point you in the
              right direction.
            </p>
          </div>
          <a href="mailto:support@artmarts.io" className="btn btn-primary">
            Email Us
          </a>
        </div>
      </section>

      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
