import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const gradients: Record<string, string> = {
  "/": "bg-gradient-to-br from-pink-200 via-orange-200 bg-latte",
  "/resources": "bg-gradient-to-br from-green-200 via-sky-200 to-yellow-100",
  "/forum": "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100",
  "/training": "bg-gradient-to-br from-lime-100 via-teal-100 to-yellow-100",
};

function pickGradient(pathname: string) {
  if (pathname === "/") return gradients["/"];
  if (pathname.startsWith("/resources")) return gradients["/resources"];
  if (pathname.startsWith("/forum")) return gradients["/forum"];
  if (pathname.startsWith("/training")) return gradients["/training"];
  return gradients["/"];
}

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [prevGradient, setPrevGradient] = useState(pickGradient(location.pathname));
  const [currGradient, setCurrGradient] = useState(pickGradient(location.pathname));
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const newGradient = pickGradient(location.pathname);
    if (newGradient !== currGradient) {
      setPrevGradient(currGradient);
      setCurrGradient(newGradient);
      setFade(true);
      const timeout = setTimeout(() => setFade(false), 600);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [location.pathname]);

  return (
    <div className={`relative min-h-screen w-full ${currGradient}`}>
      {/* Transition overlay for smooth gradient changes */}
      {fade && (
        <div 
          className={`absolute inset-0 z-10 transition-opacity duration-700 ${prevGradient}`}
          style={{ opacity: fade ? 1 : 0 }}
        />
      )}
      
      {/* Content wrapper */}
      <div className="relative z-20 min-h-screen w-full">
        {children}
      </div>
    </div>
  );
}