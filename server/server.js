import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./src/config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ture",
    message: "School Managemnt system is running",
  });
});

const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log("server is running");
    });
  } catch (error) {
    console.log(error.message);
  }
};

startServer();
