const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const appRouter = require("./routers/authRouter");
const postsRouter = require("./routers/postsRouter");
// const { generateSecretKey } = require("./utils/generateJwtToken");

const app = express();
const PORT = process.env.PORT || 5000;

//! generating the crpto token for jwt secret key, only for one time
// const secretKey = generateSecretKey();
// console.log("Generated Secret Key:", secretKey);

//! adding middleware
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json()); // ! for handling request and response in json
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo DB is connected"))
  .catch((err) => console.log("Something went wrong: ", err));

//! use appRouter
app.use("/api/auth", appRouter);
//! use postsRouter
app.use("/api/post", postsRouter);
//! create routers
app.get("/", (req, res) => {
  res.json({
    message: "Hello From Express Server",
  });
});

app.listen(PORT, () =>
  console.log(`Server is listening at http://localhost:${PORT}/`)
); //! http://localhost:8000/

module.exports = app;
