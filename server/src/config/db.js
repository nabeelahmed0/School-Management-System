import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async () => {
  try {
    const mongCon = await mongoose.connect(process.env.MONGO_URI);
    console.log(`"DB connect${mongCon.connection.host}`);
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};

export default connectDb;
