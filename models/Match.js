var mongoose = require("mongoose");

var MatchSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  playerOne: String,
  playerTwo: String,
  date: Date,
  winner: String,
  imagenWinner: String
});
mongoose.model("Match", MatchSchema);

module.exports = mongoose.model("Match");

