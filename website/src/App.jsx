import { Link, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Search from "./pages/search";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile";
import Navbar from "./pages/navbar";
import SubmitEvent from './pages/submitEvent';

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
            <Route path="/submit" element={<SubmitEvent />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
// export default function App() {
//   // const username = "John"; // Define the variable here

//   return (
//     <div className="flex min-h-screen bg-base-200">
//       <Navbar></Navbar>

//       {/* Main Page Content */}
//       <div className="flex-1 p-6">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/search" element={<Search />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/submit" element={<SubmitEvent />} />
//         </Routes>
//       </div>
//     </div>
//   );
// }
