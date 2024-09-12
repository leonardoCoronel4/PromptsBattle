var express = require("express");
var session = require("express-session");
const cookieParser = require("cookie-parser");
var FileStore = require("session-file-store")(session);

var app = express();
app.use(cookieParser());
var server = require("http").createServer(app);
var io = require("socket.io")(server);

var sharedsession = require("express-socket.io-session");
var fileStoreOptions = {};
var sessionMiddleware = session({
  store: new FileStore(fileStoreOptions),
  secret: process.env.socketSecret || "defaultSecret",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);
var users = [];
io.use(sharedsession(sessionMiddleware));
io.sockets.on("connection", function (socket) {
  if (!socket.handshake.session.user) {
    var user = {
      name: "",
      id: socket.id,
    };
    users.push(user);
    socket.handshake.session.user = user;
    socket.handshake.session.save();
  } else {
    var user = socket.handshake.session.user;
  }

  socket.emit("welcome", user);
  socket.emit("joinMatch", user);

  socket.on("name", (name) => {
    user.name = name;
    socket.handshake.session.save();
  });

  socket.on(`playerMessage${user.id}`, (message, id) => {
    socket.broadcast.emit(`updatePlayerText${id}`, message);
  });
});

app.use(express.static("public"));
app.set("view engine", "html");
app.use(express.json());

app.engine("html", require("ejs").renderFile);

var db = require("./db");
global.__root = __dirname + "/";

const Match = require("./models/Match");

app.get("/api", function (req, res) {
  res.status(200).send("API works.");
});

var indexRouter = require("./routes/index");
app.use("/", indexRouter);

var UserController = require(__root + "./controllers/user/UserController");
app.use("/api/users", UserController);

var MatchController = require(__root + "./controllers/match/MatchController");
app.use("/api/match", MatchController);

var AuthController = require("./controllers/auth/AuthController");
app.use("/api/auth", AuthController);

app.get("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.redirect("/");
});
module.exports = server;
