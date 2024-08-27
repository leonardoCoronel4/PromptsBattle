const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', function(req, res) {
    res.render('index'); 
});

router.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, '../public/views/login.html'));
});

module.exports = router;
