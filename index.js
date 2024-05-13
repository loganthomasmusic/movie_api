const express = require('express');
    morgan = require('morgan');
    uuid = require('uuid');

const app = express();

app.use(morgan('common'));
app.use(express.json());

let users = [
  {
    id:'1',
    name: 'John Doe',
    email: 'johndoe@mail.com',
    favMovies: [{
      title: 'Inception',
      director: 'Christopher Nolan',
      genre: 'Sci-Fi'
    }]
  },
  {
    id:'2',
    name: 'Jane Doe',
    email: 'janedoe@mail.com',
    favMovies: [{
      title: 'Inception',
      director: 'Christopher Nolan',
      genre: 'Sci-Fi'
    }]
  }

];

let movies = [
    {
      Title: 'Movie 1',
      Director: {
        Name: 'Director 1'
      },
      Genre: {
          Name: 'Thriller',
          Description: 'A genre of fiction that evokes excitement and suspense in the audience'
      }
    },
    {
      Title: 'Movie 2',
      Director: 'Director 2'
    },
    {
      Title: 'Movie 3',
      Director: 'Director 3'
    },
    {
      Title: 'Movie 4',
      Director: 'Director 4'
    },
    {
      Title: 'Movie 5',
      Director: 'Director 5'
    },
    {
      Title: 'Movie 6',
      Director: 'Director 6'
    },
    {
      Title: 'Movie 7',
      Director: 'Director 7'
    },
    {
      Title: 'Movie 8',
      Director: 'Director 8'
    },
    {
      Title: 'Movie 9',
      Director: 'Director 9'
    },
    {
      Title: 'Movie 10',
      Director: 'Director 10'
    }
  ];
  
// GET requests
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
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

//READ Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
})

//READ Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title );

  if (movie) {
    res.status(200).json(movie); 
  } else {
    res.status(400).send('no such movie')
  }

})

//READ Return data about a genre (description) by name/title (e.g., “Thriller”)
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    res.status(200).json(genre); 
  } else {
    res.status(400).send('no such genre')
  }

})

//READ Return data about a director (bio, birth year, death year) by name
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName ).Director;

  if (director) {
    res.status(200).json(director); 
  } else {
    res.status(400).send('no such director')
  }

})

//CREATE Allow new users to register
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('users need names')
  }

})

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

//DELETE Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed—more on this later);
app.delete('/users/:id/:moviesTitle', (req, res) => {
  const { id, moviesTitle } = req.params;

  let user = users.find( user => user.id == id)

  if (user) {
    user.favMovies = user.favMovies.filter( title => title !== moviesTitle);
    res.status(200).send(`${moviesTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }

})

//DELETE Allow existing users to deregister (showing only a text that a user email has been removed—more on this later).
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id)

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }

})