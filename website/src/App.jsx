import { Link, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/search";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile";

export default function App() {
  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Sidebar */}
      <div className="w-64 bg-base-300 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Art Market Finder</h1>
        <ul className="menu bg-base-300 text-base-content rounded-box flex-1">
          <li><Link to="/">🏠 Home</Link></li>
          <li><Link to="/search">🔍 Search Markets</Link></li>
          <li><Link to="/login">🔑 Login</Link></li>
          <li><Link to="/signup">📝 Signup</Link></li>
          <li><Link to="/profile">👤 Profile</Link></li>
        </ul>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}
