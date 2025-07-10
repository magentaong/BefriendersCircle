require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const openaiRoutes = require("./routes/openai");

const app = express();

app.get("/", (req, res) => {
  res.json({ status: "Server is running!" }); //check if server is running
});

app.use(cors({
  origin: "http://localhost:5173", //so it can connect and won't be blocked 
  credentials: true,
}));

app.use(express.json());

connectDB();

app.use("/api/openai", openaiRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
