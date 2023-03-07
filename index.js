const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = require('mongoose');

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
  count: Number
});

// create Model
const User = mongoose.model('User', userSchema);

// post user
app.post('/api/users', async function(req, res) {
  const username = req.body.username;
  // create instance of User
  const user = new User({
    username,
    count: 0
  });

  try {
    const savedUser = await user.save();
    res.json({
      username,
      _id: savedUser.id
    })
  } catch (err) {
    res.send(err);
  }
});

// post exercise
app.post('/api/users/:_id/exercises', async function(req, res) {
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = req.body.date;
  const id = req.params._id;

  const exercise = {
    description,
    duration,
    date
  }

  try {
    const foundUser = await User.findByIdAndUpdate(id, {
      $push: { log: exercise },
      $inc: {count: 1}
    }, {new: true}
    );

    if (foundUser) {
      res.json({
        _id: foundUser.id,
        username: foundUser.username,
        ...exercise
      })
    }
  } catch (err) {
    res.send(err);
  }

});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
