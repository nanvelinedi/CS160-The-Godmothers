export default function Home() {
    // Mock data for creators
    const featuredCreators = [
      { id: 1, name: 'Skylar Dias', status: 'Follow', avatar: '/api/placeholder/40/40', nfts: 2 },
      { id: 2, name: 'Sam Rolfes', status: 'Follow', avatar: '/api/placeholder/40/40', nfts: 2 },
      { id: 3, name: 'Andrew Benson', status: 'Follow', avatar: '/api/placeholder/40/40', nfts: 2 },
      { id: 4, name: 'Huntlancer', status: 'Follow', avatar: '/api/placeholder/40/40', nfts: 2 },
      { id: 5, name: 'Eric tansoy', status: 'Follow', avatar: '/api/placeholder/40/40', nfts: 2 },
      { id: 6, name: 'Eric tansoy', status: 'Follow', avatar: '/api/placeholder/40/40', nfts: 2 },
      { id: 7, name: 'Eric tansoy', status: 'Follow', avatar: '/api/placeholder/40/40', nfts: 2 },
      { id: 8, name: 'Eric tansoy', status: 'Follow', avatar: '/api/placeholder/40/40', nfts: 2 }
    ];
  
    // Mock data for trending art marts
    const trendingMarts = [
      { id: 1, name: 'Flower Girl', price: '0.13 ETH' },
      { id: 2, name: 'Space point', price: '0.13 ETH' },
      { id: 3, name: 'Man Artwork', price: '0.13 ETH' },
      { id: 4, name: 'Space art', price: '0.13 ETH' },
      { id: 5, name: 'Digital Point', price: '0.13 ETH' }
    ];
    const CreatorCard = ({ creator }) => (
      <div className="card bg-base-100 shadow-md compact">
        <div className="card-body items-center text-center p-4">
          <div className="avatar">
            <div className="w-12 rounded-full bg-base-300">
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full"></div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="card-title text-sm font-medium">{creator.name}</h3>
            <button className="btn btn-ghost btn-xs text-error hover:text-error-focus">{creator.status}</button>
          </div>
          <div className="flex gap-1 mt-2">
            {[...Array(creator.nfts)].map((_, index) => (
              <div key={index} className="w-8 h-8 bg-neutral rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );

    const TrendingArtCard = ({ art }) => (
      <div className="space-y-3">
        <div className="flex gap-1">
          <div className="w-16 h-16 bg-neutral rounded-lg"></div>
          <div className="w-16 h-16 bg-neutral rounded-lg"></div>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-base-content">{art.name}</h3>
          <div className="flex items-center text-xs text-base-content/70">
            <span className="mr-1">💎</span>
            <span className="font-mono">{art.price}</span>
          </div>
        </div>
      </div>
    );
  
  
  return (
    <div className="min-h-screen bg-base-200" data-theme="retro">
      {/* Header Section */}
      <div className="py-8 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Welcome John</h1>
        <p className="text-lg text-base-content/70">Discover, collect, and sell extraordinary digital art</p>
      </div>

      {/* Featured Creators Section */}
      <section className="py-6 px-4">
        <h2 className="text-2xl font-semibold mb-4">Featured Creators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </section>

      {/* Featured Digital Arts Section */}
      <section className="py-6 px-4">
        <h2 className="text-2xl font-semibold mb-4">Featured Digital Arts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {trendingMarts.map((art) => (
            <TrendingArtCard key={art.id} art={art} />
          ))}
        </div>
      </section>

      {/* Featured Art Marts Section */}
      <section className="py-6 px-4">
        <h2 className="text-2xl font-semibold mb-4">Featured Art Marts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Replace the below with your actual featured art marts data and card component */}
          {trendingMarts.map((mart) => (
            <TrendingArtCard key={mart.id + "-mart"} art={mart} />
          ))}
        </div>
      </section>
    </div>
  );
}
