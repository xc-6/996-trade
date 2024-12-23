// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import mongoose from "mongoose";
 
const MONGODB_URI = process.env.MONGODB_URI;
export const dbName= process.env.MONGO_DB_NAME

export const db = async () => {
  // I like to throw an error if the app doesn't get the right env variables
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI not provided");
  }

  try {
    // If readyState === 0 then there is no connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        dbName
      });
      console.log("Connected to DB");
    }
  } catch (error) {
    console.log(error);
  }
};

db();

export const client = mongoose.connection.getClient();