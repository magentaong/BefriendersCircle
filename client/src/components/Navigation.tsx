import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Category from "./Forum/Category";

interface NavigationProps {
  header?: string;
}

export default function Navigation({ header }: NavigationProps) {
  const [navState, setNavState] = useState(false);
  const location = useLocation();

  // Auto-close mobile nav when route changes
  React.useEffect(() => {
    setNavState(false);
  }, [location.pathname]);

  return (
    <>
      {/* Header */}
            <div className="w-full flex justify-between items-center">
              <Link to="/">
                <img src="/ESC.svg" alt="Logo" className="w-12 h-12" />
              </Link>
              <h2>{header}</h2>
              <img src="/Avatar.png" alt="User" className="w-10 h-10 rounded-full" />
            </div>
    </>
  );
}
