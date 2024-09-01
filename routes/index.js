const express = require("express");
const router = express.Router();
const path = require('path');

router.get('/', function (req, res) {
  res.render('index');
});

router.get('/jugar', (req, res) => {
  if (req.session.name) {
    res.render(path.join(__dirname, '../public/views/jugar.html'), { nombre: req.session.name });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
