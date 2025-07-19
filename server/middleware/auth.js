const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Now req.user contains cID and whatever else was in the token
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;
