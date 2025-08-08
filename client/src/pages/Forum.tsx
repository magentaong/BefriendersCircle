import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Category from "../components/Forum/Category.tsx";
import Navigation from '../components/Navigation';

// Main forum page that displays different categories (Topics & Events)
function Forum() {
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  return (
    <main className="bg-white text-gray-800 px-8 py-6 w-full max-w-5xl mx-auto">
      {/* Header with Logo and Profile */}
      <Navigation header={"Community Forum"} />

      <div className="flex items-center justify-between w-full gap-2 mb-4 md:mb-6">
        <Link to="/training">
          <button className="w-12 h-12 rounded-full bg-serene shadow text-lg flex items-center justify-center hover:scale-105"><ArrowLeft></ArrowLeft></button>
        </Link>

        {/* Title Card */}
        <h1 className="w-full h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center gap-2 md:text-lg font-bold text-charcoal">Community Forum</h1>

        <Link to="/resources">
          <button className="w-12 h-12 rounded-full bg-pistachio shadow text-lg flex items-center justify-center hover:scale-105"><ArrowRight></ArrowRight></button>
        </Link>
      </div>

      <div className='flex flex-col content-center gap-7 md:gap-8 mb-4'>
        {/* Category section for discussion topics */}
        <Category category="Topics" header="Topics"></Category>
        {/* Category section for discussion topics */}
        <Category category="Events" header="Events"></Category>
      </div>
    </main>
  );
}

export default Forum;