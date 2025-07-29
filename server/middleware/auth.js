const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
    const verified = jwt.verify(token, jwtSecret);
    req.user = verified; 
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;
