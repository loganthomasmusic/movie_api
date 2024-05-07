const express = require('express');
    morgan = require('morgan');

const app = express();

app.use(morgan('common'));

let topMovies = [
    {
      title: 'Movie 1',
      director: 'Director 1'
    },
    {
      title: 'Movie 2',
      author: 'Director 2'
    },
    {
      title: 'Movie 3',
      author: 'Director 3'
    },
    {
      title: 'Movie 4',
      director: 'Director 4'
    },
    {
      title: 'Movie 5',
      author: 'Director 5'
    },
    {
      title: 'Movie 6',
      author: 'Director 6'
    },
    {
      title: 'Movie 7',
      author: 'Director 7'
    },
    {
      title: 'Movie 8',
      director: 'Director 8'
    },
    {
      title: 'Movie 9',
      author: 'Director 9'
    },
    {
      title: 'Movie 10',
      author: 'Director 10'
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