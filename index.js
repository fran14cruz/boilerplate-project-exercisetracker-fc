const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
// use body-parser to handle POST Requests
app.use(bodyParser.urlencoded({extended: true})); // true means it will handle not only Strings (false), but any datatype

// connect to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// create Schema
const userSchema =  new Schema({
  username: {
    required: true,
    type: String
  },
  log: [{
    description: String,
    duration: Number,
    date: String
  }],
  counter: Number
});

// const exerciseSchema = new Schema({
//   id: String,
//   description: String,
//   duration: Number,
//   date: Date
// });

// create Model
const User = mongoose.model('User', userSchema);
//const Exercise = mongoose.model('Exercise', exerciseSchema);

// post user
app.post('/api/users', async function(req, res) {
  const userName = req.body.username;
  // create instance of User
  const user = new User({
    name: userName
  });

  try {
    const savedUser = await user.save();
    res.json({
      username: userName,
      _id: savedUser.id
    })
  } catch (err) {
    res.send(err);
  }
});

// post exercise
// app.post('/api/users/:_id/exercises', function(req, res, next) {
//   req.params._id = req.body._id;
//   next();
// }, function(req, res) {

// });





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
