import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Resources from "../pages/Resources";
import Forum from "../pages/Forum";
import Topic from "../pages/Topic";
import PostDetail from "../pages/PostDetail"
import Training from "../pages/Training";
import Profile from "../pages/Profile";
import HomeSafety from "../pages/HomeSafety";
import Onboarding from "../pages/Onboarding";
import Login from "../pages/Login";
import RequireAuth from "../components/common/RequireAuth.tsx";


export default function AppRoutes() {
    console.log("routes loaded!");
  return (
      
      <Routes>
      {/* public route */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      {/* all others require auth, cause we're very safe yesyes */}
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Routes>
              <Route path="/resources" element={<Resources />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/:currentCategory" element={<Topic />} />
              <Route path="/forum/:currentCategory/:postId" element={<PostDetail />} />
              <Route path="/training" element={<Training />} />
              <Route path="/training/home-safety" element={<HomeSafety />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Routes>
          </RequireAuth>
        }
      />
    </Routes>
  
  );
}