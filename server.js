const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Spotify: Get recently played track
app.get('/spotify-recently-played', async (req, res) => {
  try {
    // Get Spotify access token
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get recently played tracks
    const recentlyPlayedResponse = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const track = recentlyPlayedResponse.data.items[0].track;
    res.json({ track });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recently played track' });
  }
});

// GitHub: Get latest repositories
app.get('/github-repos', async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      params: {
        sort: 'updated',
        per_page: 5,
      },
    });

    const repos = response.data.map((repo) => ({
      name: repo.name,
      html_url: repo.html_url,
    }));

    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch GitHub repositories' });
  }
});

// Weather: Get weather for a location
app.get('/weather', async (req, res) => {
  const location = req.query.location;

  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`);
    const weather = {
      description: response.data.weather[0].description,
      temperature: response.data.main.temp,
    };

    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// News: Get latest news headlines
app.get('/news', async (req, res) => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`);
    const headlines = response.data.articles.slice(0, 5).map((article) => ({
      title: article.title,
      url: article.url,
    }));

    res.json(headlines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news headlines' });
  }
});

// Quotes: Get a random quote
app.get('/quote', async (req, res) => {
  try {
    const response = await axios.get('https://api.quotable.io/random');
    const quote = {
      text: response.data.content,
      author: response.data.author,
    };

    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch a quote' });
  }
});

// Serve static files (for the frontend)
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
