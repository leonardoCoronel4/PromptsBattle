const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/jugar", (req, res) => {
  res.render(path.join(__dirname, "../public/views/jugar.html"));
});

router.get("/match", (req, res) => {
  res.render(path.join(__dirname, "../public/views/match.html"));
});

router.get("/match/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/match/[id].html"));
});
module.exports = router;
