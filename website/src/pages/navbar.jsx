// pages/Navbar.jsx
import { Link } from "react-router-dom";
import { Home, Compass, Bell, ShoppingBag, Hammer, User, Clock, Bookmark, ChevronDown, Plus } from 'lucide-react';

export default function Navbar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-base-100 p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
        </div>
        <span className="text-xl font-bold text-gray-700">LOGO</span>
      </div>

      {/* Pages Section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Pages</h3>
        <ul className="space-y-3">
          <li>
            <Link to="/" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
              <Home size={20} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/search" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
              <Compass size={20} />
              <span>Explorer</span>
            </Link>
          </li>
          <li>
            <Link to="/" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
              <Bell size={20} />
              <span>Notifications</span>
            </Link>
          </li>
          <li>
            <Link to="/" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
              <ShoppingBag size={20} />
              <span>Market</span>
            </Link>
          </li>
          <li>
            <Link to="/" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
              <Hammer size={20} />
              <span>Active Bids</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* My Profile Section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 mb-4">My profile</h3>
        <ul className="space-y-3">
          <li>
            <Link to="/profile" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
              <User size={20} />
              <span>My profile</span>
            </Link>
          </li>
          <li>
            <Link to="/" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
              <Clock size={20} />
              <span>History</span>
            </Link>
          </li>
          <li>
            <Link to="/" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
              <Bookmark size={20} />
              <span>Saved</span>
            </Link>
          </li>
        </ul>
        
        {/* Show more link */}
        <div className="mt-4">
          <button className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors">
            <ChevronDown size={16} />
            <span className="text-sm">Show more</span>
          </button>
        </div>
      </div>

      {/* New Post Button */}
      <div className="mt-6">
        <button className="w-full bg-red-400 hover:bg-red-500 text-white font-medium py-3 px-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Plus size={16} className="text-red-400" />
          </div>
          <span>New Post</span>
        </button>
      </div>

      {/* Discrete Admin Login at the very bottom-left */}
      <div className="mt-auto pt-6 border-t border-base-200 self-start">
        <Link
        to="/login"
        className="absolute left-0 bottom-0 m-4 text-sm font-medium text-primary hover:underline"
      >
        Admin
      </Link>
      </div>
    </aside>
  );
}