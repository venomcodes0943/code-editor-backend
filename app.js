import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./routes/index.js";
import codeRouter from "./routes/code.js";
import mongoose from "mongoose";
import cors from "cors";

var app = express();

// Cors configurations
app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routers
app.use("/", indexRouter);
app.use("/code", codeRouter);

// Catch 404 and forward to error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  res.status(500).json({ error: err.message });
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  console.log({ err });
  res.json(err);
});

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", () => {
  console.log("Successfully connected to the database");
});

export default app;
