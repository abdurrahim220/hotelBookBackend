import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";

import "dotenv/config";
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use("/api/auth",authRoutes)
app.use("/api/users",userRoutes)

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
