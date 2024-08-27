var express = require("express");
var app = express();
var db = require("./db");
global.__root = __dirname + "/";

const Match = require("./models/Match");

app.get("/api", function (req, res) {
  res.status(200).send("API works.");
});

app.use(express.static("public"));

var indexRouter = require("./routes/index");
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
