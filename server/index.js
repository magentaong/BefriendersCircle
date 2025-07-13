require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const openaiRoutes = require("./routes/openai");
const resourceRoutes = require("./routes/resource");//for database of resources
import resourceRoutes from "./routes/resource.js";// I hope this is right



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
app.use("/api/resources", resourceRoutes);//I still hope I'm right here, For resource database


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
