var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.use(bodyParser.urlencoded({ extended: true }));
var Topic = require('../../models/Topic');

router.post('/create', function (req, res) {
    Topic.create({
            name : req.body.name,
        }, 
        function (err, topic) {
            if (err) return res.status(500).send("Error.");
            res.status(200).send(topic);
        });
});

router.get('/', function (req, res) {
    Topic.find({}, function (err, topics) {
        if (err) return res.status(500).send("Error al encontrar temas.");
        res.status(200).send(topics);
    });
});

module.exports = router;