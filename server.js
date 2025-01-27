const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Root endpoint for testing
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// GitHub: Get latest repositories
app.get('/github-repos', async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
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
    console.error('GitHub API error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch GitHub repositories',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /');
  console.log('- GET /github-repos');
});
