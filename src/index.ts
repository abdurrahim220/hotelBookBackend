import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import hotelRoutes from './routes/my_hotel'
import cookieParser from 'cookie-parser'

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,

})


mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);

const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTED_URL,
  credentials: true
}));


app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/my-hotels", hotelRoutes)

app.get("/api/text", async (req: Request, res: Response) => {
  res.json("Hello from endpoint");
});

const db = mongoose.connection;
db.once("open", () => {
  console.log(
    "Database connected:",
    mongoose.connection.host,
    mongoose.connection.name
  );
});

app.listen(5000, () => {
  console.log("Server is running on localhost:5000");
});
