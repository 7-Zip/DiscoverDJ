let express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require("mongoose"),
    Song = require("./models/song"),
    User = require("./models/user"),
    path = require('path'),
    bcrypt = require('bcrypt-nodejs'),
    serveStatic = require('serve-static'),
    port = process.env.PORT || 5000;

app = express();
app.use(bodyParser.json());
app.use(cors());

// Server static files from Vue app
app.use(serveStatic(__dirname + "/dist"));

// For bcrypt
const saltRounds = 10;

// Connect to mongoDB
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }, () => {
  console.log("Connected to mongoDB");
});

// Routes
app.get('/songs', (req, res) => {
  console.log("Requesting Songs")
  res.setHeader("Content-type", "application/json");
  res.send(JSON.stringify([
    {
      "id": 1,
      "title": "Song 1 from server"
    },
    {
      "id": 2,
      "title": "Song 2 from server"
    }
  ]));
});

app.get('/user/:id', (req, res) => {
  User.find({_id: req.params.id}, (err, user) => {
    if (user !== undefined && user.length > 0) {
      // User exists
      res.writeHead(200, {'Content-type': 'application/json'});
      res.end(JSON.stringify(user[0].username));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
});

app.post('/register', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  // Ensure username is unique
  User.find({username: username}, (err, user) => {
    if (user !== undefined && user.length > 0) {
      // Username already exists
      res.writeHead(409);
      res.end();
    } else {
      // Add user to database
      bcrypt.hash(password, null, null, function(err, hash) {
        User.create({username: username, password: hash}, (err, newUser) => {
          if (err) {
            console.log(err);
          } else {
            // Successful creation
            res.writeHead(200, {'Content-type': 'application/json'});
            res.end(JSON.stringify(newUser._id));
          }
        });
      });
    }
  });
});

app.post('/login', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  // Verify login
  User.find({username: username}, (err, user) => {
    if (user === undefined || user.length == 0) {
      // Username does not exist
      res.writeHead(401, {'Content-type': 'application/json'});
      res.end();
    } else {
      // Check password
      bcrypt.compare(password, user[0].password, function(err, equivalent) {
        if(equivalent === true) {
          // Successful login, retrieve data for results page
          res.writeHead(200, {'Content-type': 'application/json'});
          res.end(JSON.stringify(user[0]._id));
        } else {
          // Incorrect password
          res.writeHead(401);
          res.end();
        }
      });
    }
  });
});

app.post('/songs', (req, res) => {
  // Add song to database
  Song.create(req.body, (err, newPost) => {
    if (err) {
      console.log(err);
      res.status(400).send(err.message);
    } else {
      // Send new object back
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(newPost));
    }
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back Vue's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + "/dist/index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
