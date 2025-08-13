import { useMemo, useState, useRef } from "react";

// [ ] add url ===============  demo data (add urls later) ==================
export const ARTISTS = [
  {
    id: "a1",
    name: "Luna Sketches",
    bio: "I’m Luna, a 27-year-old illustrator from San Francisco who loves blending dreamy fantasy with everyday city life in my art. I grew up sketching in every corner of the Bay, inspired by street art, foggy mornings, and colorful markets. These days, I work mostly in digital but still love the feel of pen and watercolor, creating pieces that capture magic in the mundane. When I’m not drawing, you’ll probably find me wandering Golden Gate Park, browsing art fairs, or hanging out with my cat, Mochi, who insists on being part of every livestream.",
    profileUrl: "blah", // <--- link to profile page (route or file)
    avatarIMG: "../public/pfp1.png",
    tags: ["fantasy", "magic", "harry potter", "art"],
    posts: [
      {
        id: "p1",
        title: "The Harry Potter Trio",
        postUrl: "/post1-hp", // <--- link to post page
        description: "i love the trio so much",
        imagIMG: "../public/harrypotterart.png",
        tags: ["poster", "harry potter", "hogwarts", "magic", "art"],
      },
    ],
    marts: [
      {
        id: "m1",
        martUrl: "/marts/wizarding-art-mart", // <--- link to mart page
        martimagIMG: "../public/hpmart.jpg", // <--- mart header image (rectangle, short)
        name: "Wizarding Art Mart",
        location: "Berkeley",
        date: "2025-10-01",
        description: "Vendors with HP-inspired art & props.",
        tags: ["market", "harry potter", "fantasy", "art", "wizard"],
      },
    ],
  },
  {
    id: "a2",
    name: "Pixel Piper",
    bio: "I’m Pixel, a 23-year-old artist who’s absolutely obsessed with drawing chibi animals, adorable characters, and all things cute. My style is playful, colorful, and full of tiny details that make people smile—whether it’s a sleepy cat in a teacup or a penguin in a hoodie. I work mostly in digital, but I still doodle in my sketchbook whenever inspiration strikes (which is pretty much all the time). When I’m not drawing, I’m usually cuddling my pets, collecting plushies, or hunting for cute cafés that feel straight out of an anime.",
    profileUrl: "/artists/pixel-piper",
    avatarIMG: "../public/pfp2.png",
    tags: ["art", "animals", "kawaii", "chibi", "cute"],
    posts: [
      {
        id: "p2",
        title: "Cute Chibi Cats",
        postUrl: "/posts/nimbus-2000-mock-ad",
        description: "lol i got bored so i drew my cats i love them",
        imagIMG: "../public/cute chibi art.jpg",
        tags: ["cute", "animals", "cats", "sketch", "art"],
      },
    ],
    marts: [
      {
        id: "m2",
        martUrl: "/marts/arcade-alley-pop-up",
        martimagIMG: "../public/artmart2.jpg",
        name: "Cute Animal Art Mart",
        location: "Oakland",
        date: "2025-09-20",
        description: "Indie prints and wizard-world fan art.",
        tags: ["animals", "cute", "chibi", "adorable", "art"],
      },
    ],
  },
  {
    id: "a3",
    name: "Theo Ink",
    bio: "I’m Theo, a 26-year-old illustrator who loves creating simple, clean designs using basic colors and minimal details. My art is all about capturing a feeling or story in the most straightforward, charming way possible—kind of like visual comfort food. Right now, I’m traveling through Italy, soaking up inspiration from sunlit streets, historic architecture, and the slow, beautiful pace of life here. When I’m not sketching, you’ll find me people-watching at cafés, exploring tiny art shops, or tasting every flavor of gelato I can find.",
    profileUrl: "/artists/theo-ink",
    avatarIMG: "../public/pfp3.png",
    tags: ["maps", "castles", "creatures", "art"],
    posts: [
      {
        id: "p3",
        title: "San Francisco Vibes",
        postUrl: "/posts/map-of-a-certain-school",
        description: "mmm sf is so pretty",
        imagIMG: "../public/sfimage.jpg",
        tags: ["map", "hangout", "sf", "chill", "art"],
      },
    ],
    marts: [
      {
        id: "m3",
        martUrl: "/marts/old-town-makers-market",
        martimagIMG: "../public/artmart3.jpg",
        name: "San Francisco Art Mart",
        location: "San Francisco",
        date: "2025-11-05",
        description: "Hand-drawn prints, magical maps.",
        tags: ["hand-drawn", "maps", "sf", "art"],
      },
    ],
  },
];

// =============== Utilities ==================
const normalize = (s = "") => s.toLowerCase();
const tokenize = (q = "") =>
  normalize(q)
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
const matchesTokens = (tokens, ...cand) => {
  const hay = normalize(cand.filter(Boolean).join("  "));
  return tokens.every((t) => hay.includes(t));
};

const flattenPosts = (artists) =>
  artists.flatMap((a) =>
    (a.posts || []).map((p) => ({
      ...p,
      artistId: a.id,
      artistName: a.name,
      artistTags: a.tags,
    }))
  );
const flattenMarts = (artists) =>
  artists.flatMap((a) =>
    (a.marts || []).map((m) => ({
      ...m,
      artistId: a.id,
      artistName: a.name,
      artistTags: a.tags,
    }))
  );

// =============== UI bits (daisyUI) ==================
function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="divider divider-start grow before:bg-base-300 after:bg-base-300 text-base-content/70 text-sm">
          {title}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function Badge({ children }) {
  return <div className="badge badge-outline badge-sm">{children}</div>;
}

function ClickableCard({ href, children, ariaLabel }) {
  const isExternal = /^https?:\/\//i.test(href || "");
  return (
    <a
      href={href || "#"}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={ariaLabel}
      className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
    >
      {children}
    </a>
  );
}

function ArtistCard({ name, bio, tags, avatarUrl, profileUrl }) {
  return (
    <ClickableCard href={profileUrl} ariaLabel={`Open profile ${name}`}>
      <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-14 rounded-full border border-base-300">
                <img src={avatarUrl} alt={`Avatar of ${name}`} />
              </div>
            </div>
            <div>
              <h3 className="card-title text-base">{name}</h3>
              {bio && (
                <p className="text-sm opacity-80">{truncateText(bio, 120)}</p>
              )}
            </div>
          </div>
          {tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ClickableCard>
  );
}

function PostCard({ title, description, imagIMG, tags, artistName, postUrl }) {
  return (
    <ClickableCard href={postUrl} ariaLabel={`Open post ${title}`}>
      <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition">
        <figure className="h-56 overflow-hidden bg-base-200">
          <img
            src={imagIMG}
            alt={title}
            className="h-full w-full object-cover"
          />
        </figure>
        <div className="card-body">
          <h3 className="card-title text-base">{title}</h3>
          {description && (
            <p className="text-sm opacity-80">
              {description}{" "}
              {artistName ? (
                <span className="opacity-70">• by {artistName}</span>
              ) : null}
            </p>
          )}
          {tags?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ClickableCard>
  );
}

function MartCard({
  name,
  location,
  date,
  description,
  tags,
  martUrl,
  martimagIMG,
  artistName, // optional
}) {
  return (
    <ClickableCard href={martUrl} ariaLabel={`Open mart ${name}`}>
      <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition">
        {martimagIMG ? (
          <figure className="h-36 overflow-hidden bg-base-200">
            {/* shorter header image */}
            <img
              src={martimagIMG}
              alt={`${name} header image`}
              className="h-full w-full object-cover"
            />
          </figure>
        ) : null}
        <div className="card-body">
          <h3 className="card-title text-base">{name}</h3>
          <p className="text-sm opacity-80">
            {[location, date].filter(Boolean).join(" • ")}
          </p>
          {description && (
            <p className="text-sm opacity-80">
              {description}{" "}
              {artistName ? (
                <span className="opacity-70">• hosted by {artistName}</span>
              ) : null}
            </p>
          )}
          {tags?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ClickableCard>
  );
}

function HeroEmpty() {
  return (
    <div className="hero min-h-[50vh] bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-xl">
          <h1 className="text-4xl font-black">Discover art, artists & marts</h1>
          <p className="py-4 opacity-80">
            Pick a vibe and search (e.g.,{" "}
            <span className="kbd kbd-sm">harry potter</span>). Nothing shows
            until you search.
          </p>
          <div className="opacity-60 text-sm">
            Theme: <span className="badge">retro</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner({ label = "Searching…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="loading loading-spinner loading-lg" />
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}

// =============== Main Page (retro theme) ==================
export default function SearchPageRetroWithMartImages() {
  const [input, setInput] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [apiResponse, setApiResponse] = useState(""); // API text
  const [apiLoading, setApiLoading] = useState(false); // API loading
  const [loading, setLoading] = useState(false); // fake 2s local loading
  const [hasSearched, setHasSearched] = useState(false);
  const timeoutRef = useRef(null);

  const tokens = useMemo(() => tokenize(appliedQ), [appliedQ]);

  const filteredArtists = useMemo(() => {
    if (!tokens.length) return [];
    return ARTISTS.filter((a) => {
      const self = matchesTokens(
        tokens,
        a.name,
        a.bio,
        (a.tags || []).join(" ")
      );
      const post = (a.posts || []).some((p) =>
        matchesTokens(tokens, p.title, p.description, (p.tags || []).join(" "))
      );
      const mart = (a.marts || []).some((m) =>
        matchesTokens(
          tokens,
          m.name,
          m.description,
          m.location,
          m.date,
          (m.tags || []).join(" ")
        )
      );
      return self || post || mart;
    });
  }, [tokens]);

  const filteredPosts = useMemo(() => {
    if (!tokens.length) return [];
    return flattenPosts(ARTISTS).filter((p) =>
      matchesTokens(
        tokens,
        p.title,
        p.description,
        (p.tags || []).join(" "),
        p.artistName,
        (p.artistTags || []).join(" ")
      )
    );
  }, [tokens]);

  const filteredMarts = useMemo(() => {
    if (!tokens.length) return [];
    return flattenMarts(ARTISTS).filter((m) =>
      matchesTokens(
        tokens,
        m.name,
        m.description,
        m.location,
        m.date,
        (m.tags || []).join(" "),
        m.artistName,
        (m.artistTags || []).join(" ")
      )
    );
  }, [tokens]);

  async function callReagentAPI(searchValue) {
    try {
      setApiLoading(true);
      setApiResponse("");
      const res = await fetch(
        "https://noggin.rea.gent/sophisticated-horse-4983",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer rg_v1_5mazncz9xkl4jd6vcbrvjiup9aj88aq6tw1r_ngk",
          },
          body: JSON.stringify({
            var1: searchValue, // set var1 to search bar input
          }),
        }
      );
      const text = await res.text();
      setApiResponse(text || "(empty response)");
    } catch (err) {
      console.error("Error fetching from Reagent:", err);
      setApiResponse("Error fetching data.");
    } finally {
      setApiLoading(false);
    }
  }

  function submitSearch(e) {
    e?.preventDefault?.();
    const q = input.trim();
    setHasSearched(true);

    // clear previous api text on new search
    setApiResponse("");

    if (!q) {
      setAppliedQ("");
      setLoading(false);
      return;
    }

    // kick off API call (its own spinner)
    callReagentAPI(q);

    // start fake 2s local loading for the sections
    setLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setAppliedQ(q);
      setLoading(false);
    }, 2000);
  }

  return (
    <div data-theme="retro" className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow border-b border-base-300">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl font-black">Art Market Finder</a>
        </div>
        <div className="flex-none">
          <a className="btn btn-ghost btn-sm"></a>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-4">
        <form className="join w-full" onSubmit={submitSearch}>
          <input
            className="input input-bordered join-item w-full"
            placeholder="Search themes, artists, posts, marts…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary join-item">
            Search
          </button>
        </form>

        {/* API loading spinner */}
        {apiLoading && (
          <div className="mt-2 p-3 rounded border border-base-300 bg-base-100 flex items-center gap-3">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="text-sm opacity-80">hmm…</span>
          </div>
        )}

        {/* API response below the search bar */}
        {!apiLoading && apiResponse && (
          <div className="mt-2 p-3 rounded border border-base-300 bg-base-100">
            <p className="text-sm whitespace-pre-wrap break-words">
              {apiResponse}
            </p>
          </div>
        )}

        {!hasSearched && <HeroEmpty />}
        {hasSearched && loading && <Spinner />}

        {hasSearched && !loading && tokens.length > 0 && (
          <div className="space-y-10">
            <Section title={`Artist Profiles (${filteredArtists.length})`}>
              {filteredArtists.length ? (
                filteredArtists.map((a) => (
                  <ArtistCard
                    key={a.id}
                    name={a.name}
                    bio={a.bio}
                    tags={a.tags}
                    avatarUrl={a.avatarIMG}
                    profileUrl={a.profileUrl}
                  />
                ))
              ) : (
                <div className="alert">
                  <span>No artist profiles match “{appliedQ}”.</span>
                </div>
              )}
            </Section>

            <Section title={`Art Posts (${filteredPosts.length})`}>
              {filteredPosts.length ? (
                filteredPosts.map((p) => (
                  <PostCard
                    key={p.id}
                    title={p.title}
                    description={p.description}
                    imagIMG={p.imagIMG}
                    tags={p.tags}
                    artistName={p.artistName}
                    postUrl={p.postUrl}
                  />
                ))
              ) : (
                <div className="alert">
                  <span>No posts match “{appliedQ}”.</span>
                </div>
              )}
            </Section>

            <Section title={`Art Marts (${filteredMarts.length})`}>
              {filteredMarts.length ? (
                filteredMarts.map((m) => (
                  <MartCard
                    key={m.id}
                    name={m.name}
                    location={m.location}
                    date={m.date}
                    description={m.description}
                    tags={m.tags}
                    martUrl={m.martUrl}
                    martimagIMG={m.martimagIMG}
                    artistName={m.artistName}
                  />
                ))
              ) : (
                <div className="alert">
                  <span>No art marts match “{appliedQ}”.</span>
                </div>
              )}
            </Section>
          </div>
        )}

        {hasSearched && !loading && tokens.length === 0 && (
          <div className="opacity-70 text-center text-sm">
            Please type a search term to see results.
          </div>
        )}
      </main>
    </div>
  );
}
