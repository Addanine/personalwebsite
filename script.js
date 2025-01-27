const output = document.getElementById('output');
const input = document.getElementById('input');
const body = document.body;

// Simulated file system
const fileSystem = {
  home: {
    type: 'directory',
    contents: {
      'about.txt': 'Hi! I\'m a developer passionate about building cool things with code.',
      'projects.txt': 'Here are some of my projects:\n- Project 1\n- Project 2\n- Project 3',
      'contact.txt': 'You can reach me at email@example.com.',
    },
  },
  skills: {
    type: 'directory',
    contents: {
      'languages.txt': 'JavaScript, Python, C++',
      'tools.txt': 'Git, Docker, VS Code',
    },
  },
};

let currentDirectory = 'home'; // Start in the "home" directory

// Update the prompt to show the current directory
function updatePrompt() {
  const prompt = document.querySelector('.prompt');
  prompt.textContent = `~/${currentDirectory} $`;
}

// Handle user input
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const command = input.value.trim();
    input.value = '';

    // Display the command in the output
    output.innerHTML += `<div><span class="prompt">~/${currentDirectory} $</span> ${command}</div>`;

    // Process the command
    const args = command.split(' ');
    const cmd = args[0];
    const arg = args[1];

    switch (cmd) {
      case 'ls':
        listContents();
        break;
      case 'cd':
        changeDirectory(arg);
        break;
      case 'cat':
        readFile(arg);
        break;
      case 'pwd':
        printWorkingDirectory();
        break;
      case 'mkdir':
        makeDirectory(arg);
        break;
      case 'clear':
        clearScreen();
        break;
      case 'nvim':
        openNvim(arg);
        break;
      case 'neofetch':
        showNeofetch();
        break;
      case 'theme':
        changeTheme(arg);
        break;
      case 'spotify':
        fetchRecentlyPlayed();
        break;
      case 'github':
        fetchGitHubRepos();
        break;
      case 'weather':
        fetchWeather(arg);
        break;
      case 'news':
        fetchNews();
        break;
      case 'quote':
        fetchQuote();
        break;
      case 'help':
        showHelp();
        break;
      default:
        output.innerHTML += `<div>Command not found. Type 'help' for a list of commands.</div>`;
    }

    // Scroll to the bottom of the output
    output.scrollTop = output.scrollHeight;
  }
});

// List contents of the current directory
function listContents() {
  const contents = Object.keys(fileSystem[currentDirectory].contents);
  output.innerHTML += `<div>${contents.join(' ')}</div>`;
}

// Change directory
function changeDirectory(dir) {
  if (dir === '..') {
    // Go back to the home directory (root)
    currentDirectory = 'home';
  } else if (fileSystem[dir] && fileSystem[dir].type === 'directory') {
    currentDirectory = dir;
  } else {
    output.innerHTML += `<div>Directory not found: ${dir}</div>`;
  }
  updatePrompt();
}

// Read a file
function readFile(file) {
  if (fileSystem[currentDirectory].contents[file]) {
    output.innerHTML += `<div>${fileSystem[currentDirectory].contents[file]}</div>`;
  } else {
    output.innerHTML += `<div>File not found: ${file}</div>`;
  }
}

// Show current directory
function printWorkingDirectory() {
  output.innerHTML += `<div>${currentDirectory}</div>`;
}

// Create a new directory
function makeDirectory(dir) {
  if (!fileSystem[dir]) {
    fileSystem[dir] = { type: 'directory', contents: {} };
    output.innerHTML += `<div>Created directory: ${dir}</div>`;
  } else {
    output.innerHTML += `<div>Directory already exists: ${dir}</div>`;
  }
}

// Clear the screen
function clearScreen() {
  output.innerHTML = '';
}

// Simulate opening a file in nvim (read-only)
function openNvim(file) {
  if (fileSystem[currentDirectory].contents[file]) {
    output.innerHTML += `
      <div>
        <pre>
Opening ${file} in nvim (read-only mode)...

${fileSystem[currentDirectory].contents[file]}

[Read-only] Press Enter to continue.
        </pre>
      </div>
    `;
  } else {
    output.innerHTML += `<div>File not found: ${file}</div>`;
  }
}

// Display neofetch-like system information
function showNeofetch() {
  const neofetchArt = `
      ___           ___           ___           ___     
     /\\__\\         /\\  \\         /\\  \\         /\\  \\    
    /::|  |       /::\\  \\       /::\\  \\       /::\\  \\   
   /:|:|  |      /:/\\:\\  \\     /:/\\:\\  \\     /:/\\:\\  \\  
  /:/|:|  |__   /:/  \\:\\  \\   /::\\~\\:\\  \\   /::\\~\\:\\  \\ 
 /:/ |:| /\\__\\ /:/__/ \\:\\__\\ /:/\\:\\ \\:\\__\\ /:/\\:\\ \\:\\__\\
 \\/__|:|/:/  / \\:\\  \\  \\/__/ \\/__\\:\\/:/  / \\/_|::\\/:/  /
     |:/:/  /   \\:\\  \\            \\::/  /     |:|::/  / 
     |::/  /     \\:\\  \\           /:/  /      |:|\\/__/  
     /:/  /       \\:\\__\\         /:/  /       |:|  |    
     \\/__/         \\/__/         \\/__/         \\|__|    
  `;

  const systemInfo = `
OS: macOS 14 Sonoma
Host: MacBook Pro (M3, 2023)
Kernel: Darwin 23.0.0
Shell: zsh 5.9
Terminal: Kitty
CPU: Apple M3
Memory: 16GB RAM
Disk: 1TB SSD
  `;

  output.innerHTML += `
    <div style="white-space: pre-line;">
      ${neofetchArt}
      ${systemInfo}
    </div>
  `;
}

// Change theme
function changeTheme(theme) {
  body.className = `theme-${theme}`;
  output.innerHTML += `<div>Switched to ${theme} theme.</div>`;
}

// Fetch recently played song from Spotify
async function fetchRecentlyPlayed() {
  try {
    const response = await fetch('http://localhost:8000/spotify-recently-played');
    const data = await response.json();
    const track = data.track;
    output.innerHTML += `<div>Your most recently played song is: <strong>${track.name}</strong> by <strong>${track.artists[0].name}</strong>.</div>`;
  } catch (error) {
    output.innerHTML += `<div>Error fetching recently played song: ${error.message}</div>`;
  }
}

// Fetch GitHub repositories
async function fetchGitHubRepos() {
  try {
    const response = await fetch('http://localhost:8000/github-repos');
    const repos = await response.json();
    output.innerHTML += `<div>Your latest GitHub repositories:</div>`;
    repos.forEach((repo) => {
      output.innerHTML += `<div>- <a href="${repo.html_url}" target="_blank">${repo.name}</a></div>`;
    });
  } catch (error) {
    output.innerHTML += `<div>Error fetching GitHub repositories: ${error.message}</div>`;
  }
}

// Fetch weather for a location
async function fetchWeather(location) {
  try {
    const response = await fetch(`http://localhost:8000/weather?location=${location}`);
    const weather = await response.json();
    output.innerHTML += `<div>Weather in ${location}: ${weather.description}, ${weather.temperature}°C</div>`;
  } catch (error) {
    output.innerHTML += `<div>Error fetching weather: ${error.message}</div>`;
  }
}

// Fetch latest news headlines
async function fetchNews() {
  try {
    const response = await fetch('http://localhost:8000/news');
    const news = await response.json();
    output.innerHTML += `<div>Latest news headlines:</div>`;
    news.forEach((headline) => {
      output.innerHTML += `<div>- <a href="${headline.url}" target="_blank">${headline.title}</a></div>`;
    });
  } catch (error) {
    output.innerHTML += `<div>Error fetching news: ${error.message}</div>`;
  }
}

// Fetch a random quote
async function fetchQuote() {
  try {
    const response = await fetch('http://localhost:8000/quote');
    const quote = await response.json();
    output.innerHTML += `<div>Random quote: "${quote.text}" - ${quote.author}</div>`;
  } catch (error) {
    output.innerHTML += `<div>Error fetching quote: ${error.message}</div>`;
  }
}

// Show help
function showHelp() {
  const helpText = `
Available commands:
- ls: List contents of the current directory
- cd [directory]: Change directory
- cat [file]: Display the contents of a file
- pwd: Show the current directory
- mkdir [directory]: Create a new directory
- clear: Clear the terminal screen
- nvim [file]: Open a file in nvim (read-only)
- neofetch: Display system information
- theme [dark/light/soft-pastel/matrix]: Change the terminal theme
- spotify: Show your most recently played song
- github: Show your latest GitHub repositories
- weather [location]: Show the weather for a location
- news: Show the latest news headlines
- quote: Show a random quote
- help: Show this help message
  `;
  output.innerHTML += `<div>${helpText}</div>`;
}

// Initialize the prompt
updatePrompt();
