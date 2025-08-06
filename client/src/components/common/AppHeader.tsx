import { useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Forums", path: "/forum" },
  { name: "Resources", path: "/resources" },
  { name: "Simulation", path: "/training" },
];

interface AppHeaderProps {
  isLoggedIn: boolean;
  username?: string;
  onProfileClick?: () => void;
  onLoginClick?: () => void;
}

export default function AppHeader({
  isLoggedIn,
  username,
  onProfileClick,
  onLoginClick,
}: AppHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="flex items-center big-white w-full px-2 sm:px-6 py-4 mb-8">
      {/* Logo */}
      <img
        src="/ESC.svg"
        alt="BefriendersCircle Logo"
        className="h-16 w-16 sm:h-20 sm:w-20"
      />

      {/* Navigation */}
      <nav className="flex gap-2 sm:gap-4 items-center ml-4">
        {navLinks.map((link) => {
          const isActive =
            location.pathname === link.path ||
            (link.path !== "/" && location.pathname.startsWith(link.path));
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={classNames(
                "px-3 py-2 rounded-xl font-medium text-base sm:text-lg transition-all duration-200 relative group",
                isActive
                  ? "text-charcoal"
                  : "hover:bg-latte/40"
              )}
            >
              {link.name}
              <span
                className={classNames(
                  "absolute left-1/2 -translate-x-1/2 bottom-0 h-[3px] w-0 bg-latte rounded-full transition-all duration-300",
                  isActive && "w-8 shadow-[0_0_8px_0_rgba(240,208,160,0.5)]"
                )}
              />
            </button>
          );
        })}
      </nav>

      {/* Spacer to push user section right */}
      <div className="flex-1" />

      {/* User Section */}
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-charcoal font-medium mr-2">
            {`Welcome, ${username ?? "User"}`}
          </span>
          <img
            src="/Avatar.png"
            alt="User Avatar"
            className="h-12 w-12 sm:h-15 sm:w-15 rounded-full cursor-pointer"
            onClick={onProfileClick}
          />
        </div>
      ) : (
        <button
          onClick={onLoginClick}
          className="bg-latte text-charcoal font-heading text-base sm:text-lg px-5 py-2 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-90"
        >
          Login
        </button>
      )}
    </header>
  );
}
