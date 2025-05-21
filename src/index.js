const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Updated MongoStore import

const authRoutes = require('./routes/authRoutes'); // Import auth routes

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban_app_dev';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_very_secret_key_123!', // Use environment variable in production
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ // Updated for connect-mongo v4+
    mongoUrl: MONGODB_URI,
    collectionName: 'sessions' // Optional: specify session collection name
  })
}));

// Middleware to make user available in all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    next();
});

// Routes
const boardRoutes = require('./routes/boardRoutes'); // Import board routes
const taskRoutes = require('./routes/taskRoutes'); // Import task routes

app.use(authRoutes); // Mount auth routes
app.use(boardRoutes); // Mount board routes
app.use(taskRoutes); // Mount task routes
const noteRoutes = require('./routes/noteRoutes'); // Import note routes
app.use(noteRoutes); // Mount note routes
const effortRoutes = require('./routes/effortRoutes'); // Import effort routes
app.use(effortRoutes); // Mount effort routes

app.get('/', (req, res) => {
  // User is already available via res.locals.user from middleware
  if (req.session.isLoggedIn) {
    res.redirect('/boards'); // Redirect logged-in users to their boards
  } else {
    res.render('index', { title: 'Home' }); // 'user' and 'isLoggedIn' are in res.locals
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
