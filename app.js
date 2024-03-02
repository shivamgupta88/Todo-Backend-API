import express from "express";
import cors from "cors";
import userRouter from "./routes/users.js";
import taskRouter from "./routes/task.js";
import "./config/mongodbConfig.js";
import dotenv from "dotenv";
import createError from 'http-errors';
import errorHandler from "./middleware/errorHandler.js";
import cronScheduler from "./services/cronScheduler.js";

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(errorHandler);

// API endpoints
app.use("/api/v0/user", userRouter);
app.use("/api/v0/task", taskRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

app.listen(port, () => console.log(`Listening on localhost:${port}`));
