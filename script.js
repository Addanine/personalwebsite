const output = document.getElementById('output');
const input = document.getElementById('input');
const body = document.body;

window.onload = () => {
  input.focus();
};

// Prevent the user from leaving the input box
input.addEventListener('blur', () => {
  setTimeout(() => input.focus(), 0);
});



let vimMode = false;
let vimContent = '';
let currentFile = '';
let matrixInterval;
let snakeGame;

const fileSystem = {
  home: {
    type: 'directory',
    contents: {
      'about.txt': 'hey! im harry (aka adenine), a 14 yr old developer from san francisco. i previously went to live oak school and now im at lick-wilmerding high school!',
      'contact.txt': 'email: harry.oltmans@icloud.com\nphone: 4154654736',
      'projects/': { type: 'directory', contents: {} },
      'interests/': { type: 'directory', contents: {} },
      'skills/': { type: 'directory', contents: {} },
      'favorites/': { type: 'directory', contents: {} },
      'misc/': { type: 'directory', contents: {} },
    }
  },
  skills: {
    type: 'directory',
    contents: {
      'cloud.txt': 'aws certified in:\n- cloud practitioner\n- sysops administrator\n- solutions engineer\n- developer\n\ncomfortable with ec2, s3, lambda, and more!',
      'frontend.txt': 'next.js, react, svelte, typescript, tailwind, htmx',
      'backend.txt': 'python, flask, django, mysql',
      'devops.txt': 'git, docker, kubernetes, github actions, vercel, netlify',
      'editor.txt': 'neovim enthusiast! find my config at https://github.com/Addanine/nvim.git'
    }
  },
  projects: {
    type: 'directory',
    contents: {
      'polysim.txt': 'a project to simulate u.s. elections with detailed modeling and analysis',
      'cont.txt': 'conceptual translation tool - working on making language translation more intuitive with https://github.com/ababythwumps',
      'liveoak-portal.txt': 'during my tech internship at live oak, i built a portal for teachers and students to upload and send documents using next.js and aws'
    }
  },
  interests: {
    type: 'directory',
    contents: {
      'hematology.txt': 'fascinated by blood disorders and the complex systems of blood cell production. particularly interested in how different conditions affect blood cell development and function. currently reading "hoffbrand\'s essential haematology"!',
      'endocrinology.txt': 'love learning about hormones and how they regulate body functions. especially interested in the feedback loops between different endocrine glands and how they maintain homeostasis. currently reading "harrison\'s endocrinology" by j. larry jameson!',
      'photography.txt': 'i love taking photos! check out my work at instagram.com/harryoltmans or type "photos" to see a quick collage of some of my shots.'
    }
  },
  favorites: {
    type: 'directory',
    contents: {
      'tv-shows.txt': 'my favorite shows:\n- silo: dystopian series about a community living in an underground silo with mysterious rules and history\n- severance: workers undergo a procedure to separate their work and personal memories, leading to fascinating questions about identity\n- house md: brilliant but difficult doctor solves medical mysteries while being a jerk to everyone\n- the wire: incredibly detailed and realistic look at different institutions in baltimore, from police to schools to politics',
      'programming.txt': 'my favorite programming languages:\n- python: love how readable and versatile it is\n- typescript: javascript but actually makes sense\n- swift: great for ios development and super clean syntax',
      'songs.txt': 'favorite artists:\n- laufey (promise, i wish you love)\n- clairo (4ever, amoeba)\n- mitski (i dont like my mind)\n- sabrina carpenter (feather)\n- beabadoobee (the perfect pair, beaches, glue song)\n\ni love how these artists blend different styles and create such unique sounds!',
      'video-games.txt': 'disco elysium is my absolute favorite - its a "detective rpg" with incredible writing"'
    }
  },
  misc: {
    type: 'directory',
    contents: {
      'readme.txt': 'this folder is for miscellaneous stuff - more coming soon!',
      'socials.txt': 'find me online:\n- twitter: @0xadenine where i post about politics and tech\n- instagram: @harryoltmans where i post my photography',
      'politics.txt': 'i identify as a market socialist economically - believe in worker ownership while maintaining market dynamics. socially on the left, supporting progressive policies and social justice.',
      'stack.txt': 'i mainly use the t3 stack for most projects:\n- next.js: react framework for both frontend and api routes\n- typescript: type safety is a must!\n- tailwind: utility-first css that makes styling fast\n- trpc: end-to-end type safety for api calls\n- prisma: type-safe orm for databases'
    }
  }
};

const secretCommands = {
  'bi': "did you really think i'd be anything else after reading this stuff? ",
  'adenine': "adenine is one of the four nucleotide bases in DNA! it's also my username :) it pairs with thymine in DNA strands.",
  'neovim': "check out my config! https://github.com/Addanine/nvim.git",
  'nvim': "check out my config! https://github.com/Addanine/nvim.git",
  'aws': "i'm aws certified! cloud practitioner, sysops administrator, solutions engineer, and developer",
  'blood': "did you know? adult humans have around 5-6 liters of blood! try 'cat hematology.txt' in the interests directory",
  'hormones': "check out 'cat endocrinology.txt' in the interests directory",
  't3': "type-safety all the way down! check out 'cat stack.txt' in the misc directory",
  'ping': "pong!",
  'secret': "try these commands: neovim, aws, blood, hormones, t3, repo and bi.",
  'sudo': 'nice try :)',
  'rm': 'come on',
  'repo': 'check out the repository for this at https://github.com/Addanine/personalwebsite!',
  'rm -rf': '🚨 NOPE! 🚨',
  'draw': asciiArtMode,
  'snake': startSnakeGame,
  'matrix': startMatrixEffect,
  'calc': (expr) => {
    try { return eval(expr) }
    catch { return 'Invalid expression' }
  }
};

let currentDirectory = 'home';

output.style.overflowY = 'auto';
input.style.position = 'sticky';
input.style.bottom = '0';

function updatePrompt() {
  const prompt = document.querySelector('.prompt');
  prompt.textContent = `~/${currentDirectory}`;
}

function listContents() {
  const contents = Object.entries(fileSystem[currentDirectory].contents).map(([name, obj]) => {
    return obj.type === 'directory' ? `<span class="directory">${name}</span>` : name;
  });
  output.innerHTML += `<div>${contents.join(' ')}</div>`;
}

function tree(dir = currentDirectory, depth = 0, prefix = '') {
  let result = '';
  const entries = Object.entries(fileSystem[dir].contents);
  entries.forEach(([name, obj], index) => {
    const isLast = index === entries.length - 1;
    result += `${prefix}${isLast ? '└── ' : '├── '}${name}\n`;
    if (obj.type === 'directory') {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      result += tree(name.split('/')[0], depth + 1, newPrefix);
    }
  });
  return result;
}

function changeDirectory(dir) {
  if (dir === '..') {
    currentDirectory = 'home';
  } else if (fileSystem[dir]?.type === 'directory') {
    currentDirectory = dir;
  } else {
    output.innerHTML += `<div>Directory not found: ${dir}</div>`;
  }
  updatePrompt();
}

function readFile(file) {
  if (fileSystem[currentDirectory].contents[file]) {
    output.innerHTML += `<div>${fileSystem[currentDirectory].contents[file]}</div>`;
  } else {
    output.innerHTML += `<div>File not found: ${file}</div>`;
  }
}

function printWorkingDirectory() {
  output.innerHTML += `<div>${currentDirectory}</div>`;
}

function makeDirectory(dir) {
  if (!fileSystem[dir]) {
    fileSystem[dir] = { type: 'directory', contents: {} };
    output.innerHTML += `<div>Created directory: ${dir}</div>`;
  } else {
    output.innerHTML += `<div>Directory already exists: ${dir}</div>`;
  }
}

function clearScreen() {
  output.innerHTML = '';
}

function openNvim(file) {
  if (!file) return output.innerHTML += `<div>Usage: nvim [file]</div>`;
  if (!fileSystem[currentDirectory].contents[file]) return output.innerHTML += `<div>File not found: ${file}</div>`;

  vimMode = true;
  currentFile = file;
  vimContent = fileSystem[currentDirectory].contents[file];
  
  output.innerHTML += `<div class="vim-mode">
    <pre>${vimContent}\n\n-- INSERT --</pre>
    <div class="vim-status">${file} [+] [unix]</div>
  </div>`;
  input.value = '';
  input.focus();
}

const showPhoto = () => {
  const photoDisplay = document.createElement('img');
  photoDisplay.src = 'collage.png';
  photoDisplay.style.maxWidth = '100%';
  photoDisplay.style.height = 'auto';
  output.appendChild(photoDisplay);
  output.innerHTML += '\n\ntype "clear" to remove the photo collage';
};

function showNeofetch() {
  const neofetchArt = `
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
      ${systemInfo}
    </div>
  `;
}

function changeTheme(theme) {
  body.className = `theme-${theme}`;
  output.innerHTML += `<div>Switched to ${theme} theme.</div>`;
}

async function fetchRecentlyPlayed() {
  output.innerHTML += `<div>Attempting to connect to Spotify service...</div>`;
  
  try {
    const response = await fetch('http://localhost:3000/spotify-recently-played', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    
    const data = await response.json();
    if (!data.track) throw new Error('Invalid response format');
    
    output.innerHTML += `<div>Your most recently played song is: <strong>${data.track.name}</strong> by <strong>${data.track.artists[0].name}</strong>.</div>`;
  } catch (error) {
    output.innerHTML += error.message.includes('Failed to fetch') 
      ? `<div>Error: Could not connect to the server. Make sure the server is running on port 3000.</div>`
      : `<div>Error: ${error.message}</div>`;
  }
}

async function fetchGitHubRepos() {
  try {
    const response = await fetch('http://localhost:3000/github-repos', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const repos = await response.json();
    output.innerHTML += `<div>Your latest GitHub repositories:</div>`;
    repos.forEach((repo) => {
      output.innerHTML += `<div>- <a href="${repo.html_url}" target="_blank">${repo.name}</a></div>`;
    });
  } catch (error) {
    output.innerHTML += `<div>Error: ${error.message}</div>`;
  }
}

async function fetchWeather(location) {
  if (!location) {
    output.innerHTML += `<div>Please provide a location. Usage: weather [city]</div>`;
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/weather?location=${encodeURIComponent(location)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const weather = await response.json();
    output.innerHTML += `<div>Weather in ${location}: ${weather.description}, ${weather.temperature}°C</div>`;
  } catch (error) {
    output.innerHTML += `<div>Error: ${error.message}</div>`;
  }
}

async function fetchNews() {
  try {
    const response = await fetch('http://localhost:3000/news', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const news = await response.json();
    output.innerHTML += `<div>Latest news headlines:</div>`;
    news.forEach((headline) => {
      output.innerHTML += `<div>- <a href="${headline.url}" target="_blank">${headline.title}</a></div>`;
    });
  } catch (error) {
    output.innerHTML += `<div>Error: ${error.message}</div>`;
  }
}

async function fetchQuote() {
  try {
    const response = await fetch('http://localhost:3000/quote', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const quote = await response.json();
    output.innerHTML += `<div>Random quote: "${quote.text}" - ${quote.author}</div>`;
  } catch (error) {
    output.innerHTML += `<div>Error: ${error.message}</div>`;
  }
}

function showHelp() {
  const helpText = `
available commands:
- ls: list directory contents (try this first)
- cd: change directory
- cat: view file
- mkdir: create directory
- clear: clear screen
- nvim: edit files
- theme: change color scheme
- photos: view photo collage
- help: show this help
- repo: get the repo link of how i made this!

folders to explore:
- skills: check out my programming knowledge
- projects: see what i'm working on
- interests: learn about my medical interests
- favorites: my favorite media and tech
- misc: other cool stuff about me

try commands like:
sudo, rm -rf, vim, secret

wanna see how i made this? (it isnt very organized) 
check out the source code on github at 
https://github.com/Addanine/personalwebsite.git!
  `;
  output.innerHTML += `<pre>${helpText}</pre>`;
}

function asciiArtMode() {
  output.innerHTML += `<pre>
  ╔═══════════════╗
  ║ ASCII ART MODE║
  ╚═══════════════╝
  Use these characters:
  ░▒▓██▀▄■αβγδεζηθ
  Type 'exit' to return
  </pre>`;
}

function startSnakeGame() {
  output.innerHTML += `<div>Snake game started! Use arrow keys</div>`;
}

function startMatrixEffect() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
  output.innerHTML = `<div class="matrix-effect"></div>`;
  matrixInterval = setInterval(() => {
    document.querySelector('.matrix-effect').innerHTML += 
      chars[Math.floor(Math.random() * chars.length)];
  }, 50);
}

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const command = input.value.trim();
    input.value = '';

    if (vimMode) {
      if (command.startsWith(':')) {
        switch (command) {
          case ':wq':
          case ':q':
          case ':q!':
            vimMode = false;
            output.querySelector('.vim-mode').remove();
            break;
          default:
            output.innerHTML += `<div>Unknown vim command: ${command}</div>`;
        }
        return;
      }
      vimContent += '\n' + command;
      return;
    }

    output.innerHTML += `<div><span class="prompt">~/${currentDirectory} $</span> ${command}</div>`;
    const args = command.split(' ');
    const cmd = args[0].toLowerCase();
    const arg = args.slice(1).join(' ');

    if (secretCommands[cmd]) {
      output.innerHTML += `<div>${typeof secretCommands[cmd] === 'function' 
        ? secretCommands[cmd](arg)
        : secretCommands[cmd]}</div>`;
    } else {
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
        case 'photos':
          showPhoto();
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
        case 'tree':
          output.innerHTML += `<pre>.\n${tree()}</pre>`;
          break;
        case 'help':
          showHelp();
          break;
        default:
          output.innerHTML += `<div>command not found. type 'help'</div>`;
      }
    }

    output.scrollTop = output.scrollHeight;
  }
});

output.innerHTML = `<div>hi! im harry (aka adenine). run "help" to start. (this site works better on laptop)</div>`;
updatePrompt();
