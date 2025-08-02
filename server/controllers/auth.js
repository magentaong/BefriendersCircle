const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

// controller file to abstract out logic from routes (for unit testing of async functions)

async function registerUser({ email, password, name }) {
    if (!email || ! password || !name) {
      const err = new Error("All fields are required")
      err.status = 400;
      throw  err;
    }   

    //email validation for backend side 
    if (!/\S+@\S+\.\S+/.test(email)) {
        const err = new Error("Invalid email format");
        err.status = 400;
        throw err;
    }


    const existingUser = await User.findOne({email})
    if (existingUser) {
        const err = new Error("Email already in use");
        err.status = 400;
        throw err;
    }

    
    const newUser = new User({ email, password, name });
    await newUser.save();

    const token = jwt.sign({ cID: newUser.cID }, process.env.JWT_SECRET, { expiresIn: "2h" });
    const isOnboarded = !!(newUser.name && newUser.language);
    return { token, cID: newUser.cID, isOnboarded };
}

async function loginUser({ email, password}) {
    if (!email || !password ) {
      const err = new Error("All fields are required")
      err.status = 400;
      throw err;
    } //email, password can't be empty

    const user = await User.findOne({ email });
    if (!user) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
    }
    const token = jwt.sign({ cID: user.cID }, process.env.JWT_SECRET, { expiresIn: "2h" });

    const isOnboarded = !!(user.name && user.language);
    return { token, cID: user.cID, isOnboarded };
}


async function getUserProfile(cID) {
    const user = await User.findOne({ cID}).select("-password");
    if (!user){
        const err = new Error("User not found"); 
        err.status = 404; 
        throw err;
    }
    return user;
}


async function updateProfile({language, name, profileImg}) {
    const updated = await User.findOneAndUpdate(
          { cID },
          { $set: { language, name, profileImg } },
          { new: true }
        ).select("-password");

    if (!updated) {
      const err = new Error("User not found");
        err.status = 404;
        throw err;
    }
    return updated;
}

async function deleteAccount(cID) {
    const result = await User.deleteOne({ cID });
  if (result.deletedCount === 0) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
}
module.exports = { registerUser, loginUser, getUserProfile , updateProfile, deleteAccount}