var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/pooljdope", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", (err) => {
  console.log(err);
});

db.once("open", () => {
  console.log("Database Connection Established!");
});

var player_listRouter = require("./routes/player_list");
var AuthRouter = require("./routes/auth");
var poolRouter = require("./routes/pool");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/player_list", player_listRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/pool", poolRouter);

module.exports = app;
