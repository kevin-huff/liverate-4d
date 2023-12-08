require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const tmi = require('tmi.js');
const exphbs = require('express-handlebars').create();
const OpenAI = require('openai');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.engine('handlebars', exphbs.engine);
app.set('view engine', 'handlebars');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Passport configuration
passport.use(new LocalStrategy(
  function(username, password, done) {
    const user = { id: '1', username: process.env.WEB_USER, password: process.env.WEB_PASSWORD };

    if (username === user.username && password === user.password) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Invalid credentials.\n' });
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  const user = { id: '1', username: process.env.WEB_USER, password: process.env.WEB_PASSWORD };
  done(null, user);
});

// Routes
app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: 'Invalid username or password.' }), function(req, res) {
  res.redirect('/dashboard');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/login', function(req, res) {
  res.render('login', { title: 'Login', message: req.flash('error') });
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
});

app.get('/display', (req, res) => {
  res.render('display', { title: 'Display' });
});

app.post('/api/process-image', ensureAuthenticated, async (req, res) => {
  let base64Image = req.body.image;
  const prompt = req.body.prompt;
  const prefix = 'data:image/png;base64,';
  if (base64Image.startsWith(prefix)) {
    base64Image = base64Image.slice(prefix.length);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              image_url: {
                "url": `data:image/png;base64,${base64Image}`
              }
            },
          ],
        },
      ],
    });
    console.log('full response:', response);
    console.log('sent response:', response.choices[0]);
    res.json(response.choices[0].message.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('rating show', (data) => {
    console.log('rating show', data);
    socket.broadcast.emit('rating show', data);
  });

  socket.on('rating submit', (data) => {
    console.log('rating submit', data);
    client.say(process.env.twitch_channel, `!rate ${data.item}|${data.rating}`);
    io.emit('rating submit', data);
  });

  socket.on('rating hide', () => {
    console.log('rating hide');
    socket.broadcast.emit('rating hide');
  });
});

// TMI.js
const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: process.env.bot_account,
    password: process.env.oauth,
  },
  channels: [process.env.twitch_channel],
});
client.connect();

// Start the server
server.listen(3000, () => {
  console.log('listening on *:3000');
});
