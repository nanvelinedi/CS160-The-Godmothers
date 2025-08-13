import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Search from "./pages/search";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile";
import Navbar from "./pages/navbar";
import SubmitEvent from "./pages/submitEvent";
import SearchPage from './pages/searchpage';
import FAQPage from './pages/faqpage'; // Import the FAQPage component
import NewPost from "./pages/NewPost"; 
import PostDetail from "./pages/PostDetail";
import DevPostsJson from "./pages/DevPostsJson";


export default function App() {
  return (
    <div>
      <Navbar /> {/* fixed sidebar */}
      <main className="pl-64 min-h-screen">   {/* <-- offset by sidebar width */}
        <div className="p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/submit-event" element={<SubmitEvent />} />
            <Route path="/searchpage" element={<SearchPage />} />
            <Route path="/faqpage" element={<FAQPage />} /> {/* Add the FAQ route */}
            <Route path="/new-post" element={<NewPost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/dev/posts" element={<DevPostsJson />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}