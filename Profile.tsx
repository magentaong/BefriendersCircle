import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Profile() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cID");
    window.location.href = "/";
  };

  return (
    <main className="w-full mx-auto px-4 md:px-6 py-4 md:py-6 max-w-4xl">
      {/* Header */}
      <header className="w-full flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/">
            <img src="/ESC.svg" alt="BefriendersCircle Logo" className="h-10 w-10 md:h-12 md:w-12" />
          </Link>  
          <h1 className="text-lg md:text-xl font-bold text-charcoal">Profile</h1>
        </div>
      </header>

      {/* Profile Card */}
      <section className="bg-canary p-4 md:p-6 rounded-3xl shadow-md w-full relative text-center max-w-md mx-auto">
        <div className="flex flex-col items-center">
          <img 
            src="/Avatar.png" 
            alt="Profile Picture" 
            className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg mb-4"
          />
          <h2 className="text-lg md:text-xl font-bold text-charcoal mb-2">John Doe</h2>
          <p className="text-sm md:text-base text-charcoal mb-4">Caregiver</p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-lg md:text-xl font-bold text-charcoal">12</p>
              <p className="text-xs md:text-sm text-charcoal">Posts</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-lg md:text-xl font-bold text-charcoal">45</p>
              <p className="text-xs md:text-sm text-charcoal">Connections</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="mt-6 md:mt-8 space-y-3 flex justify-center">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-latte text-charcoal rounded-2xl shadow-md hover:brightness-95">
          <ArrowLeft className="w-4 h-4" />
          Logout
        </button>
      </div>
    </main>
  );
}