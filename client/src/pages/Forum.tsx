import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Category from "../components/Forum/Category.tsx";

// Main forum page that displays different categories (Topics & Events)
function Forum() {
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <Link to="/">
          <img src="/ESC.svg" alt="BefriendersCircle Logo" className="h-10 w-10 md:h-12 md:w-12" />
        </Link>
        <h1 className="text-lg md:text-xl font-bold text-charcoal">Community Forum</h1>
        {isLoggedIn && (
          <Link to="/profile">
            <img src="/Avatar.png" alt="User Profile" className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
          </Link>
        )}
      </header>

      <div className="flex items-center justify-end w-full mb-4 md:mb-6">
        <Link to="/resources">
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pistachio shadow text-lg flex items-center justify-center">
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </Link>
      </div>

      <div className='flex flex-col content-center gap-7 md:gap-8'>
        <Category category="Topics" header="Topics"></Category>
        <Category category="Events" header="Events"></Category>
      </div>
    </main>
  );
}

export default Forum;
