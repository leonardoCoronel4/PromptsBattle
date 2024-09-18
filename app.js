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
let matchData = {};
let matchVoting = {};

function createVotingData(matchId) {
  matchVoting[matchId] = {};
  matchVoting[matchId].playerOneFinished = false;
  matchVoting[matchId].playerTwoFinished = false;
  matchVoting[matchId].matchVotes = {
    playerOneVotes: 0,
    playerTwoVotes: 0,
  };
}

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
  socket.emit("joinMatch", user, matchData);

  socket.on("name", (name) => {
    user.name = name;
    socket.handshake.session.save();
  });

  socket.on(
    "iniciarPartida",
    ({ playerOneSession, playerTwoSession, matchId }) => {
      socket.broadcast.emit(`redirectToGame${playerOneSession}`);
      socket.broadcast.emit(`redirectToGame${playerTwoSession}`);
    }
  );
  socket.on(`matchTimerSelect`, (matchId) => {
    matchData[matchId].arranco = false;
  });

  socket.on(`matchTimer`, (matchId, time) => {
    if (!matchVoting[matchId]) {
      matchVoting[matchId] = {};
    }
    if (!matchData[matchId]) {
      matchData[matchId] = {};
    }
    if (!matchData[matchId].arranco) {
      matchData[matchId].timeRemaining = Math.floor(time * 60);
      matchData[matchId].arranco = true;
      socket.broadcast.emit(
        `currentTimer${matchId}`,
        matchData[matchId].timeRemaining
      );

      const timerInterval = setInterval(() => {
        if (matchData[matchId].timeRemaining > 0) {
          matchData[matchId].timeRemaining--;
          socket.broadcast.emit(
            `updateTimer${matchId}`,
            matchData[matchId].timeRemaining
          );
        } else {
          if (matchData[matchId].porTerminar) {
            clearInterval(timerInterval);
            socket.broadcast.emit(`imageSelectFinished${matchId}`);
          } else {
            socket.broadcast.emit(`timerFinished${matchId}`);
            matchData[matchId].porTerminar = true;
            matchData[matchId].timeRemaining = 30;
          }
        }
      }, 1000);
    }
  });

  socket.on(`playerImages${user.id}`, (i, imgURL, id, matchId) => {
    if (!matchData[id + matchId]) {
      matchData[id + matchId] = {
        playerText: "",
        images: {},
        imagenFinal: "",
      };
    }
    if (!matchData[id + matchId].images[i]) {
      matchData[id + matchId].images[i] = "";
    }
    matchData[id + matchId].images[i] = imgURL;
    socket.broadcast.emit(`updatePlayerImages${id}${i}${matchId}`, imgURL);
  });

  socket.on(`playerMessage${user.id}`, (message, id, matchId) => {
    if (!matchData[id + matchId]) {
      matchData[id + matchId] = {
        playerText: "",
        images: {},
        imagenFinal: "",
      };
    }
    matchData[id + matchId].playerText = message;
    socket.broadcast.emit(`updatePlayerText${id}${matchId}`, message);
  });

  socket.on(`seleccionarImagenesFinal`, (matchId) => {
    if (matchData[matchId] && matchData[matchId].porTerminar) {
      socket.emit("currentEstadoFinal");
    }
  });

  socket.on(`tomarText`, (matchId) => {
    socket.emit("currentText", matchData, matchId);
  });

  socket.on(`tomarImagenSeleccionada`, (matchId) => {
    socket.emit("currentImagenSeleccionada", matchData, matchId);
  });

  socket.on(`tomarImagenes`, (matchId) => {
    socket.emit("currentImages", matchData, matchId);
  });

  socket.on(`tomarTextJugador`, (id, matchId) => {
    socket.emit("currentTextJugador", matchData, id, matchId);
  });

  socket.on(`playerSelectImage${user.id}`, (imgUrl, matchId, id, playerOne) => {
    if (!matchData[id + matchId]) {
      matchData[id + matchId] = {
        playerText: "",
        images: {},
        imagenFinal: "",
      };
    }
    if (!matchVoting[matchId]) {
      matchVoting[matchId] = {};
    }
    if (playerOne) {
      matchVoting[matchId].playerOneFinished = true;
    } else {
      matchVoting[matchId].playerTwoFinished = true;
    }
    if (
      matchVoting[matchId].playerOneFinished &&
      matchVoting[matchId].playerTwoFinished
    ) {
      socket.broadcast.emit(`enableVoting${matchId}`);
    }
    matchData[id + matchId].imagenFinal = imgUrl;
    socket.broadcast.emit(`updatePlayerSelectImage${id}${matchId}`, imgUrl);
  });

  socket.on("updateMatchData", (matchDataNueva) => {
    matchData = matchDataNueva;
  });

  socket.on("playerVoted", (player, matchId) => {
    matchVoting[matchId].matchVotes[player]++;
    socket.broadcast.emit(`updateVotes${matchId}`, matchVoting[matchId]);
  });

  socket.on("votarPlayer1", (matchId) => {
    console.log(matchId);
    if (!matchVoting[matchId].matchVotes){
      matchVoting[matchId].matchVotes = {};
    };
    if (!matchVoting[matchId].matchVotes.playerOneVotes){
      matchVoting[matchId].matchVotes.playerOneVotes = 0;
    };
    matchVoting[matchId].matchVotes.playerOneVotes += 1;
    console.log(matchVoting[matchId].matchVotes.playerOneVotes);
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

var TopicController = require("./controllers/topic/topicController");
const { match } = require("assert");
app.use("/topic", TopicController);

app.get("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.redirect("/");
});
module.exports = server;
