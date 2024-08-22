var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var VerifyToken = require("./VerifyToken");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require("../user/User");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var config = require("../config");

router.post("/register", function (req, res) {
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  User.create(
    {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    },
    function (err, user) {
      if (err) return res.status(500).send("Error");
      // crear token
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400, // expira en 24 hours
      });
      res.status(200).send({ auth: true, token: token });
    }
  );
});

router.post("/login", function (req, res) {
  User.findOne(
    {
      email: req.body.email,
    },
    function (err, user) {
      if (err) return res.status(500).send("Error");
      const passwordUser = bcrypt.hashSync(req.body.password, 8);
      if (!bcrypt.compareSync(passwordUser, user.password)) {
        return res
          .status(401)
          .send({ auth: false, message: "Contraseña incorrecta" });
      }
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400,
      });
      res.status(200).send({ auth: true, token: token });
    }
  );
});

router.get("/me", function (req, res) {
  var token = req.headers["x-access-token"];
  if (!token)
    return res.status(401).send({ auth: false, message: "Sin token" });
  jwt.verify(token, config.secret, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Error de autenticacion" });
    res.status(200).send(decoded);
  });

  /*jwt.verify(token, config.secret, function(err, decoded) {
		if (err) return res.status(500).send({ auth: false, message: 'Error de autenticacion' });
		User.findById(decoded.id, function (err, user) {
			if (err) return res.status(500).send("Error al buscar usuario.");
			if (!user) return res.status(404).send("No existe el usuario.");
			res.status(200).send(user);
		});
	});*/
});
router.get("/me2", VerifyToken, function (req, res, next) {
  User.findById(
    req.userId,
    { password: 0 }, // projection
    function (err, user) {
      if (err) return res.status(500).send("Error al encontrar usuario.");
      if (!user) return res.status(404).send("No existe el usuario.");
      res.status(200).send(user);
    }
  );
});

/* router.post("/login", function (req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send("Error.");
    if (!user) return res.status(404).send("No existe usuario.");
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid)
      return res.status(401).send({ auth: false, token: null });
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400, // expira en 24 hours
    });
    res.status(200).send({ auth: true, token: token });
  });
}); */

module.exports = router;
