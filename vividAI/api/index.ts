import express from "express";
import dotenv from "dotenv";
import { apiRouter } from "../src/apiRouter";

dotenv.config();

const app = express();
app.use(express.json());

// Mount the API router
app.use("/api", apiRouter);
app.use("/", apiRouter);

export default app;
