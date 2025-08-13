// src/pages/Navbar.jsx
import { Link } from "react-router-dom";
import {
  Home,
  Compass,
  User,
  Bookmark,
  Plus,
  FileQuestionMark,
  Search,
} from "lucide-react";
import Logo from '../images/logo.png'; // Import your logo image

export default function Navbar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-base-100 p-6 flex flex-col">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <img src={Logo} alt="ArtSpots Logo" className="w-10 h-10 object-contain" />
        <span className="text-xl font-bold text-gray-700">ArtSpots</span>
      </Link>

      {/* Main Section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Main</h3>
        <ul className="space-y-3">
          {/* <li>
            <label className="input">
              <svg
                className="h-[1em] opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input
                type="search"
                className="grow"
                placeholder="Search"
                onFocus={() => navigate("/searchpage")}
              />
            </label>
          </li> */}
          <li>
            <Link
              to="/searchpage"
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Search size={20} />
              <span>Search</span>
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/search"
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Compass size={20} />
              <span>Map</span>
            </Link>
          </li>
          {/* <li>
            <Link
              to="/"
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FileQuestionMark size={20} />
              <span>FAQ</span>
            </Link>
          </li> */}
          {/* <li>
            <Link
              to="/"
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingBag size={20} />
              <span>Market</span>
            </Link>
          </li> */}
          {/* <li>
            <Link
              to="/"
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Hammer size={20} />
              <span>Active Bids</span>
            </Link>
          </li> */}
        </ul>
      </div>

      {/* My Profile Section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 mb-4">My profile</h3>
        <ul className="space-y-3">
          <li>
            <Link
              to="/profile"
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <User size={20} />
              <span>My profile</span>
            </Link>
          </li>
          {/* <li>
            <Link to="/" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
              <Clock size={20} />
              <span>History</span>
            </Link>
          </li> */}
          <li>
            <Link
              to="/"
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Bookmark size={20} />
              <span>Saved</span>
            </Link>
          </li>
          <li>
            <Link
              to="/faqpage"
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FileQuestionMark size={20} />
              <span>FAQ</span>
            </Link>
          </li>
        </ul>

        {/* Show more link */}
        <div className="mt-4">
          {/* <button className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors">
            <ChevronDown size={16} />
            <span className="text-sm">Show more</span>
          </button> */}
        </div>
      </div>

      {/* New Post Dropdown */}
      <div className="mt-6">
        <div className="dropdown w-full">
          <label
            tabIndex={0}
            className="w-full bg-red-400 hover:bg-red-500 text-white font-medium py-3 px-4 rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Plus size={16} className="text-red-400" />
            </div>
            <span>New Post</span>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/new-post">New post</Link>
            </li>
            <li>
              <Link to="/submit-event">Submit an event</Link>
            </li>
          </ul>
        </div>
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
