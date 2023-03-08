const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // note: this app uses the 6.6.5 version of mongoose
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

// create Schemas
const ExerciseSchema = new Schema({
  userId: {
    type: String,
    required: true 
  },
  description: String,
  duration: Number,
  date: Date
});

const UserSchema = new Schema({
  username: String
});

// create Models
const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// post user
app.post('/api/users', (req, res) => {
  const newUser = new User({
    username: req.body.username
  })
  newUser.save((err, data) => {
    if (err || !data) {
      res.send(err);
    } else {
      res.json(data);
    }
  })
});

// post exercises
app.post('/api/users/:id/exercises', (req, res) => {
  const id = req.params.id;
  let {description, duration, date} = req.body;

  if (!date) {
    date = new Date();
  }
  
  User.findById(id, (err, userData) => {
    if (err || !userData) {
      res.send(err);
    } else {
      const newExercise = new Exercise({
        userId: id, 
        description,
        duration,
        date: new Date(date), 
      });

      newExercise.save((err, data) => {
        if (err || !data) {
          res.send(err);
        } else {
          const { description, duration, date, _id} = data;
          res.json({
            username: userData.username,
            description: description,
            duration: duration,
            date: date.toDateString(),
            _id: userData.id
          });
        }
      })
    }
  })
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
