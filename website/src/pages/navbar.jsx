// pages/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <aside className="w-64 bg-base-300 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Art Market Finder</h1>
      <ul className="menu bg-base-300 text-base-content rounded-box flex-1">
        <li>
          <Link to="/">🏠 Home</Link>
        </li>
        <li>
          <Link to="/search">🔍 Search Markets</Link>
        </li>
        <li>
          <Link to="/login">🔑 Login</Link>
        </li>
        <li>
          <Link to="/signup">📝 Signup</Link>
        </li>
        <li>
          <Link to="/profile">👤 Profile</Link>
        </li>
      </ul>
    </aside>
  );
}
