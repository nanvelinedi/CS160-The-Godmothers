import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Search from "./pages/search";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile";
import Navbar from "./pages/navbar";
import SubmitEvent from "./pages/submitEvent";
import SearchPage from "./pages/searchpage";
import FAQPage from "./pages/faqpage";
import NewPost from "./pages/NewPost";
import PostDetail from "./pages/PostDetail";
import DevPostsJson from "./pages/DevPostsJson";
import AdminPage from "./pages/AdminPage.jsx";
/* profiles */
import LunaPfp from "./profiles/lunapfp.jsx";
/* posts */
import Post1HP from "./artposts/post1-hp.jsx";
/* marts */
import Mart1Wizard from "./artmarts/mart1-wizard.jsx";

export default function App() {
  return (
    <div>
      <Navbar />
      <main className="pl-64 min-h-screen">
        <div className="p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/submit-event" element={<SubmitEvent />} />
            <Route path="/submit" element={<SubmitEvent />} />
            <Route path="/searchpage" element={<SearchPage />} />
            <Route path="/faqpage" element={<FAQPage />} />
            <Route path="/new-post" element={<NewPost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/dev/posts" element={<DevPostsJson />} />
            <Route path="/admin" element={<AdminPage />} />
            {/* profiles */}
            <Route path="/luna-pfp" element={<LunaPfp />} />
            {/* posts */}
            <Route path="/post1-hp" element={<Post1HP />} />
            {/* marts */}
            <Route path="/mart1-wizard" element={<Mart1Wizard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
