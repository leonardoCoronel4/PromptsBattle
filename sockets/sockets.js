var io = require("socket.io")(server);
var session = require("express-session");
var sharedsession = require("express-socket.io-session");
var FileStore = require("session-file-store")(session);
var fileStoreOptions = {};

var sessionMiddleware = session({
    store: new FileStore(fileStoreOptions),
    secret: "ultrasecreto",
    resave: true,
    saveUninitialized: true,
  });

app.use(sessionMiddleware);
io.use(sharedsession(sessionMiddleware));

