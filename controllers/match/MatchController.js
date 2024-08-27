var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
var Match = require('../../models/Match');

router.post('/', function (req, res) {
    Match.create({
            playerOne : null,
            playerTwo : null,
            date : Date(),
            winner : null,
            imagenWinner : null
        }, 
        function (err, match) {
            if (err) return res.status(500).send("Error.");
            res.status(200).send(match);
        });
});

router.get('/', function (req, res) {
    Match.find({}, function (err, matchs) {
        if (err) return res.status(500).send("Error al encontrar las partidas.");
        res.status(200).send(matchs);
    });
});

router.get('/pending', async (req, res) => {
    try{
        const matches = await Match.find({ winner: null});
        res.status(200).send(matches);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/:id', function (req, res) {
    Match.findById(req.params.id, function (err, match) {
        if (err) return res.status(500).send("Error al encontrar la partida.");
        if (!match) return res.status(404).send("No existe el usuario.");
        res.status(200).send(match);
    });
});

router.delete('/:id', function (req, res) {
    Match.findByIdAndRemove(req.params.id, function (err, match) {
        if (err) return res.status(500).send("Error al eliminar actualizar partida.");
        res.status(200).send("match: "+ match.name +" eliminado.");
    });
});

router.put('/:id', function (req, res) {
    Match.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, match) {
        if (err) return res.status(500).send("Error al actualizar partida.");
        res.status(200).send(match);    
    });
});


module.exports = router;