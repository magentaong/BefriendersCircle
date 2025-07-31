import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const endpoint = isSignup ? "/auth/register" : "/auth/login";
      const data = isSignup ? { name, email, password } : { email, password };

      const response = await axios.post(`http://localhost:5050/api${endpoint}`, data);
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("cID", response.data.cID);
        window.location.href = "/";
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 md:px-6 py-8 md:py-12 bg-white text-center">
      <img src="/ESC.svg" alt="Logo" className="w-12 md:w-16 mb-6 md:mb-8" />
      
      {/*retreat arrow aka back arrow*/}
      <div className="absolute top-6 md:top-8 left-4 md:left-6">
        <Link to="/">
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-latte shadow text-lg flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </Link>
      </div>
      
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white space-y-4 md:space-y-6 py-4 md:py-6"
      >

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2 py-2">
          {isSignup
            ? "Register with us to join the community!"
            : "Want to access our caregiver community?"}
        </h2>

        {/*put in useranme, only in sign up section*/}
        {isSignup && (
          <input
            className="w-full p-3 md:p-4 border-2 border-canary rounded-2xl focus:outline-none placeholder:text-gray-500 text-charcoal"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        {/*email*/}
        <input
          className="w-full p-3 border border-yellow-300 rounded-xl focus:outline-none placeholder:text-gray-400 mt-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        {/*secret password segment*/}
        <input
          className="w-full p-3 md:p-4 border-2 border-canary rounded-2xl focus:outline-none placeholder:text-gray-500 text-charcoal"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        {/*error messages*/}
        {errorMessage && (
          <div className="text-red-500 text-sm md:text-base">{errorMessage}</div>
        )}

        {/*change betwene Signup/Login */}
        <button
          type="submit"
          className="bg-latte text-charcoal px-4 md:px-6 py-2 md:py-3 rounded-2xl shadow-md hover:brightness-95 w-full font-semibold"
        >
          {isSignup ? "Register" : "Login"}
        </button>

        <button
          type="button"
          onClick={() => setIsSignup(!isSignup)}
          className="text-charcoal underline text-sm md:text-base"
        >
          {isSignup ? "Already have an account? Login" : "Don't have an account? Register"}
        </button>
      </form>
    </main>
  );
}
