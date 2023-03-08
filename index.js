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


// get logs
app.get('/api/users/:id/logs', (req, res) => {
  const { from, to, limit } = req.query;
  const { id } = req.params;
  
  User.findById(id, (err, userData) => {
    if (err || !userData) {
      res.send(err);
    } else {
      let dateObj = {}
      if (from) {
        dateObj['$gte'] = new Date(from);
      }
      if (to) {
        dateObj['$lte'] = new Date(to);
      }
      let filter = {
        userId: id
      }
      if (from || to ) {
        filter.date = dateObj
      }

      let nonNullLimit = limit ?? 500;
      Exercise.find(filter).limit(+nonNullLimit).exec((err, data) => {
        if (err || !data) {
          res.json([]);
        } else{
          const count = data.length;
          const rawLog = data;
          const { username, _id } = userData;
          const log = rawLog.map((l) => ({
            description: l.description,
            duration: l.duration,
            date: l.date.toDateString()
          }))
          res.json({
            username:username,
            count:count,
            _id: _id.toString(),
            log: log})
        }
      })
    } 
  })
});

// get users
app.get("/api/users", (req, res) => {
  User.find({}, (err, data) => {
    if (!data) {
      res.send('No data');
    } else {
      res.json(data);
    }
  })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
