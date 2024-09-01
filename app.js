const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const sessionMiddleware = session({
  store: new FileStore(),
  secret: process.env.socketSecret || 'defaultSecret',
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});

app.use(express.static('public'));
 
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('name', (data) => {
    console.log('Name received:', data.name);
    socket.request.session.name = data.name;
    socket.request.session.save();
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

var db = require("./db");
global.__root = __dirname + "/";

const Match = require("./models/Match");

app.get("/api", function (req, res) {
  res.status(200).send("API works.");
});

var indexRouter = require("./routes/index");
app.use("/", indexRouter);

app.use("/", indexRouter);

var UserController = require(__root + "./controllers/user/UserController");
app.use("/api/users", UserController);

var MatchController = require(__root + "./controllers/match/MatchController");
app.use("/api/match", MatchController);

/*var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);*/

var AuthController = require("./controllers/auth/AuthController");
app.use("/api/auth", AuthController);

module.exports = app;
