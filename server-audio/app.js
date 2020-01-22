var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
const rateLimit = require("express-rate-limit");

var songsRouter = require("./routes/songs");
var usersRouter = require("./routes/users");
var categoriesRouter = require("./routes/categories");
var artistsRouter = require("./routes/artists");
var playlistsRouter = require("./routes/playlists");

var mongoose = require("mongoose");

var app = express();

// Setup socket.io
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(function (req, res, next) {
  res.io = io;
  next();
});

var config = require('./config.js');

mongoose
  .connect(
    config.DB_STRING,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(v => console.log("Connect database successfully!"));

// Set API rate limit for all request
const limiter = rateLimit({
  windowMs: 1000, // 1s
  max: 50 // limit each IP to 10 requests per windowMs
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// apply api rate limiter to all request
app.use(limiter);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Passport middleware
app.use(passport.initialize());
// Passport Config
require('./config/passport')(passport);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});


app.use("/", songsRouter);
app.use("/users", usersRouter);
app.use("/categories", categoriesRouter);
app.use("/artists", artistsRouter);
app.use("/playlists", playlistsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = { app, server };
