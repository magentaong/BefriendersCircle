import React, { useState } from "react"; import { Link, useLocation } from "react-router-dom";


interface NavigationProps {
  header?: string;
}

export default function Navigation({ header }: NavigationProps) {
  const [navState, setNavState] = useState(false);
  const location = useLocation();

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  // Auto-close mobile nav when route changes
  React.useEffect(() => {
    setNavState(false);
  }, [location.pathname]);

  return (
    <>
      {/* Header with Logo and Profile */}
      <header className="flex justify-between items-center w-full mb-6 md:mb-8">
        <div className="flex justify-between gap-2 items-center ">
          <Link to="/">
            <img src="/ESC.svg" alt="BefriendersCircle Logo" className="h-12 w-12 md:h-15 md:w-15" />
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-charcoal">Befrienders Circle</h1>
        </div>
        {isLoggedIn && (
          <Link to="/profile">
            <img src="/Avatar.png" alt="User Profile" className="h-10 w-10 md:h-13 md:w-13 rounded-full" />
          </Link>
        )}
      </header>
    </>
  );
}
