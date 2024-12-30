const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// Middleware for serving static files like CSS
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Setting view engine to EJS for rendering HTML templates
app.set('view engine', 'ejs');

// Route to display the search form
app.get('/', (req, res) => {
  res.render('index', { colleges: null, error: null });
});

// Route to handle form submission and web scraping
app.post('/search', async (req, res) => {
    const place = req.body.place;
    let url = `https://en.wikipedia.org/wiki/List_of_universities_and_colleges_in_${place.replace(/\s/g, '_')}`;
  
    try {
      // Make a request to the Wikipedia page for colleges in the specified place
      const response = await axios.get(url);
  
      const $ = cheerio.load(response.data);
      let colleges = [];
  
      // Scraping college names from Wikipedia lists
      $('table.wikitable tbody tr').each((index, element) => {
        const collegeName = $(element).find('td:first-child').text().trim();
        if (collegeName) {
          colleges.push({ name: collegeName });
        }
      });
  
      // Check if no colleges are found
      if (colleges.length === 0) {
        res.render('index', { colleges: null, error: 'No colleges found.', place: place });
      } else {
        // Render the template with the college names and place
        res.render('index', { colleges, error: null, place: place });
      }
    } catch (error) {
      console.error('Error fetching or processing data:', error);
      res.render('index', { colleges: null, error: 'Error fetching data. Please try again.', place: place });
    }
  });

  app.listen(port,()=>{
    console.log(`app is listening at ${port}`);
  })