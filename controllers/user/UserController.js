var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');



//var VerifyToken = require(__root + 'auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: true }));
var User = require('../../models/User');

router.post('/', function (req, res) {
    User.create({
            name : req.body.name,
            email : req.body.email,
            password : req.body.password
        }, 
        function (err, user) {
            if (err) return res.status(500).send("Error.");
            res.status(200).send(user);
        });
});

router.get('/', function (req, res) {
    User.find({}, function (err, users) {
        if (err) return res.status(500).send("Error al encontrar usuarios.");
        res.status(200).send(users);
    });
});

router.get('/:id', function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) return res.status(500).send("Error al encontrar usuario.");
        if (!user) return res.status(404).send("No existe el usuario.");
        res.status(200).send(user);
    });
});

router.delete('/:id', function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) return res.status(500).send("Error al eliminar actualizar usuario.");
        res.status(200).send("User: "+ user.name +" eliminado.");
    });
});

router.put('/:id', /* VerifyToken, */ function (req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
        if (err) return res.status(500).send("Error al actualizar usuario.");
        res.status(200).send(user);    
    });
});


module.exports = router;