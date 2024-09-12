var mongoose = require("mongoose");

const stateMatch = [
  "En espera",
  "Iniciada",
  "Finalizada"
];

var MatchSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  playerOne: String,
  playerTwo: String,
  playerOneSession: String,
  playerTwoSession: String,
  date: Date,
  winner: String,
  imagenWinner: String,
  state: {
    type: String,
    required: false,
    enum: stateMatch,
  },
});
mongoose.model("Match", MatchSchema);

module.exports = mongoose.model("Match");

