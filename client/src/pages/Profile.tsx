import { Link, useNavigate } from "react-router-dom";
import { LogOut, Trash2, Pencil } from "lucide-react";
import { fetchCurrentUser } from "../api/auth";
import { useEffect, useState } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("English");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cID");
    navigate("/login");
  };

  const handleDelete = () => {
    // add your API call here for delete account
    alert("Account deleted forever (not really yet HEUHEUUE)");
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchCurrentUser();
        setName(user.name);
        setLanguage(user.language);
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };
    loadUser();
  }, []);

  return (
    <main className="w-full mx-auto px-5 py-5  max-w-md">
      {/* Header */}
      <header className="w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link to="/">
            <img src="/ESC.svg" alt="BefriendersCircle Logo" className="h-15 w-15" />
           </Link>  
          <h1 className="text-xl font-bold text-gray-700">Profile</h1>
        </div>

        {/* see how we wanna deal with nav :O 
        <div className="flex gap-3">
          <Link to="/forum">
            <button className="bg-blossom px-4 py-1 rounded-full text-charcoal shadow">Network</button>
          </Link>
          <Link to="/resources"> 
            <button className="bg-pistachio px-4 py-1 rounded-full text-charcoal shadow">Resource</button>
          </Link>
          <Link to="/training"> 
            <button className="bg-serene px-4 py-1 rounded-full text-charcoal shadow">Training</button>
          </Link>
          <img src="/Avatar.png" alt="Avatar" className="w-10 h-10 rounded-full border border-gray-300"/>
        </div>
        */}
      </header>

      {/* Profile Card */}
      <div className="flex justify-center"> 
        <section className="bg-canary p-6 rounded-3xl shadow-md w-full relative text-center max-w-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Caregiver</h2>

            <button className="absolute top-4 right-4 bg-white rounded-full p-1 shadow">
                <Pencil className="h-6 w-6 text-gray-600 p-1" />
            </button>

            <img src="/Avatar.png" alt="Profile Avatar" className="w-30 h-30 mx-auto mb-4"/>

            <p className="text-gray-700 font-medium">Name : {name || "No Name"} </p>
            {/* <p className="text-gray-700 font-medium">Password : f********</p> 
                boss i encrypted the password so uhm oops            
            */}
            <p className="text-gray-700 font-medium">Language : {language || "English"}</p>

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-latte text-black rounded-2xl shadow-md hover:brightness-95 w-full sm:w-auto">
                    <LogOut className="w-5 h-5" />
                    <span className="font-semibold">Log Out</span>
                </button>

                <button
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#E78686] text-black rounded-2xl shadow-md hover:brightness-95 w-full sm:w-auto">
                    <Trash2 className="w-5 h-5" />
                    <span className="font-semibold">Delete Forever</span>
                </button>
            </div>

        </section>
      </div>
    </main>
  );
}

//TODO: Edit modal for profile :(, handle deleting account