var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Todo = new Schema({
  task_id: String,
  task: String,
  status: Boolean
});

mongoose.model("Todo", Todo);

// var mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/todo';
// NOTE process.env.MONGODB_URI is for heroku env
const mongoDbAtlas = `mongodb+srv://giagiang:Giagiang20@cluster0-n3ela.mongodb.net/test?retryWrites=true&w=majority`;
console.log("making db connect to ", mongoDbAtlas);

mongoose.connect(mongoDbAtlas, { useNewUrlParser: true }, err => {
  if (err) console.error(err);
  else console.log("mongo connected to:", mongoDbAtlas);
});
