const express = require('express');
    morgan = require('morgan');
    uuid = require('uuid');

const mongoose = require('mongoose');
const Models = require('./models.js')

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

const passport = require('passport');
require('./passport');

const app = express();
app.use(express.urlencoded({extended: true}));

const cors = require('cors');
app.use(cors());

const bcrypt = require('bcrypt');

const { check, validationResult } = require('express-validator');

let auth = require('./auth')(app);

app.use(morgan('common'));
app.use(express.json());
  
// 1. Return a list of ALL movies to the user
app.get('/movies', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Movies.find()
      .then((movies) => {
          res.status(201).json(movies);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// 2. Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get('/movies/:title', passport.authenticate('jwt', {session: false }), async (req, res) => {

  const title = req.params.title;
  const movie = await Movies.findOne({ Title: title });

  if (movie) {
      res.status(200).json(movie);
  } else {
      res.status(404).send('Movie not found');
  }

});

// 3. Return data about a genre (description) by name/title (e.g., “Thriller”)
app.get('/movies/genre/:genreName', passport.authenticate('jwt', {session: false }), async (req, res) => {
  try {
      const genreName = req.params.genreName;
      const movie = await Movies.findOne({ 'Genre.Name': genreName });

      if (movie) {
          res.status(200).json(movie.Genre);
      } else {
          res.status(404).send('No such genre found');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
  }
});

// 4. Return data about a director (bio, birth year, death year) by name
app.get('/movies/directors/:directorName', passport.authenticate('jwt', {session: false }), async (req, res) => {
  try {
      const directorName = req.params.directorName;
      const movie = await Movies.findOne({ 'Director.Name': directorName });

      if (movie) {
          res.status(200).json(movie.Director);
      } else {
          res.status(404).send('No such director');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
  }
});

// 5. Allow new users to register
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', 
  //Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {

    //check the validation object for errors
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// 6. Allow users to update their user info (username, password, email, date of birth)
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })

});

// 7. Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// 8. Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
      $pull: { FavoriteMovies: req.params.MovieID }
  },
      { new: true }) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
          res.json(updatedUser);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// 9. Allow existing users to deregister
app.delete('/users/:Username', passport.authenticate('jwt', {session: false }), async (req, res) => {

  await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
          if (!user) {
              res.status(404).send(req.params.Username + ' was not found');
          } else {
              res.status(200).send(req.params.Username + ' was deleted.');
          }
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// Get all users
app.get('/users', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/', (req, res) => {
    res.send('Welcome to my movie app!');
});
  
app.get('/movies', (req, res) => {
    res.json(topMovies);
});
  
app.use('/documentation', express.static('public', {index: 'documentation.html'}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
});

//UPDATE Allow users to update their user info (username)
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id)

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }

})

//CREATE Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later);
app.post('/users/:id/:moviesTitle', (req, res) => {
  const { id, moviesTitle } = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favMovies.push(moviesTitle);
    res.status(200).send(`${moviesTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }

})

app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // CONDITION TO CHECK ADDED HERE
  if(req.user.Username !== req.params.Username){
      return res.status(400).send('Permission denied');
  }
  // CONDITION ENDS
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set:
      {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
      }
  },
      { new: true }) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
          res.json(updatedUser);
      })
      .catch((err) => {
          console.log(err);
          res.status(500).send('Error: ' + err);
      })
});