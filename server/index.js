require("dotenv").config();
// console.log("MONGO_URI from .env is:", process.env.MONGO_URI); debug to check smth
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const openaiRoutes = require("./routes/openai");
const resourceRoutes = require("./routes/resource");//for database of resources
const boardRoutes = require("./routes/board");
const trainingRoutes = require("./routes/training");
const postRoutes = require("./routes/post")
const commentRoutes = require("./routes/comment")
const forumLikeRoutes = require("./routes/like");
const authRoutes = require("./routes/auth");
const auth = require("./middleware/auth")
const audioRoutes = require("./routes/audio.js")
const resourceChatRoutes = require("./routes/resourceChat");

// Conditionally load langchainChat routes
let langchainChatRoutes;
try {
  langchainChatRoutes = require("./routes/langchainChat");
} catch (error) {
  console.warn("LangChain Chat routes not available:", error.message);
}

const path = require("path");
const testRoutes = require("./routes/test");

const app = express();
connectDB();

app.get("/", (req, res) => {
  res.json({ status: "Server is running!" }); //check if server is running
});

app.use(cors({
  origin: "http://localhost:5173", //so it can connect and won't be blocked 
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/openai", openaiRoutes);
app.use("/api/resources", resourceRoutes);//Public access to resources
app.use("/api/boards", auth, boardRoutes);
app.use("/api/training", auth, trainingRoutes);
app.use("/api/post", auth, postRoutes);
app.use("/api/comment", auth, commentRoutes);
app.use("/api/like", forumLikeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/resourcechat", resourceChatRoutes);

// Conditionally register langchainChat routes
if (langchainChatRoutes) {
  app.use("/api/langchainchat", langchainChatRoutes);
}

app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// this makes the server run only if this file is run directly, and not imported for testing
if (require.main === module) {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}


if (process.env.NODE_ENV === "development") {
  app.use("/api/test", testRoutes);
}


module.exports = app; 

