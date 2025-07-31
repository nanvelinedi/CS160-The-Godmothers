import { Routes, Route, Link } from 'react-router-dom';
import Home from './home';
import Login from './login';
import Signup from './signup';
import Search from './search';
import Profile from './profile';

function App() {
  return (
    <div>
      {/* Simple nav bar */}
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/signup">Signup</Link> |{' '}
        <Link to="/search">Search</Link> |{' '}
        <Link to="/profile">Profile</Link>
      </nav>

      {/* Tailwind test box */}
      <div className="bg-pink-400 text-white p-4 rounded-lg mt-4">
        If this box is pink, Tailwind is working 🎉
      </div>

      {/* Routes to different pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );

}

export default App;
