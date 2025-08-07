import { useState } from "react";
import { login, register } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = isSignup
        ? await register(email, password, confirmPassword, name)
        : await login(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("cID", data.cID);

      if (data.isOnboarded) {
        navigate("/");
      } else {
        navigate("/onboarding");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-30 bg-white text-center">
      <img src="/ESC.svg" alt="Logo" className="w-15 mb-6" />
    {/* Back arrow */}
    <div className="absolute top-10 left-8 md:top-15 md:left-50">
        <Link to="/">
        <button className="w-12 h-12 rounded-full bg-latte shadow text-lg flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
        </button>
        </Link>
    </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white space-y-6 py-5 "
      >
        <h2 className="text-lg md:text-xl font-semibold text-charcoal mb-2 py-2">
          {isSignup
            ? "Register with us to join the community!"
            : "Want to access our caregiver community?"}
        </h2>

        {/* Name Input (Signup only) */}
        {isSignup && (
          <input
            className="w-full p-3 border border-yellow-300 rounded-xl focus:outline-none placeholder:text-gray-400"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        {/* Email */}
        <input
          className="w-full p-3 border border-yellow-300 rounded-xl focus:outline-none placeholder:text-gray-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        {/* Password */}
        <input
          className="w-full p-3 border border-yellow-300 rounded-xl focus:outline-none placeholder:text-gray-400"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        {isSignup && (
          <input
            className="w-full p-3 border border-yellow-300 rounded-xl focus:outline-none placeholder:text-gray-400"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            required
          />
        )}

        {/* Error */}
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}

        {/* Toggle Signup/Login */}
        <button
          type="button"
          className="text-sm text-[#964B00] underline hover:opacity-80"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? "Already have an account? Log in" : "New here? Sign up"}
        </button>
        
        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          {!isSignup && (
            <button
              type="submit"
              className="bg-[#D9CBC2] text-black px-6 py-2 rounded-2xl shadow hover:brightness-95"
            >
              Log In
            </button>
          )}
          {isSignup && (
            <button
                type="submit"
                className="bg-latte text-black px-6 py-2 rounded-2xl shadow hover:brightness-95"
            >
                Register
            </button>
            )}

        </div>
      </form>
    </main>
  );
}
