var mongoose = require("mongoose");
var TopicSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  name: String,
});
mongoose.model("Topic", TopicSchema);

module.exports = mongoose.model("Topic");
