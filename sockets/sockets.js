const io = require("socket.io")(server);
const session = require("express-session");
const sharedsession = require("express-socket.io-session");
const FileStore = require("session-file-store")(session);
const fileStoreOptions = {};

let sessionMiddleware = session({
    store: new FileStore(fileStoreOptions),
    secret: process.env.socketSecret,
    resave: true,
    saveUninitialized: true,
  });

app.use(sessionMiddleware);
io.use(sharedsession(sessionMiddleware));

