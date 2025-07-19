require("dotenv").config();
// console.log("MONGO_URI from .env is:", process.env.MONGO_URI); debug to check smth
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const openaiRoutes = require("./routes/openai");
const resourceRoutes = require("./routes/resource");//for database of resources
const boardRoutes = require("./routes/board");


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
app.use("/api/resources", resourceRoutes);//I still hope I'm right here, For resource database
app.use("/api/boards", boardRoutes);



const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
