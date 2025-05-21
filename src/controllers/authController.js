const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

exports.postRegister = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      // Add error handling/messaging later
      return res.redirect('/register');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    // Add success messaging later
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    // Add error handling/messaging later
    res.redirect('/register');
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      // Add error handling/messaging later
      return res.redirect('/login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Add error handling/messaging later
      return res.redirect('/login');
    }
    req.session.isLoggedIn = true;
    req.session.user = user; // Store user object in session
    req.session.save(err => { // Ensure session is saved before redirecting
        if (err) {
            console.error('Session save error:', err);
            return res.redirect('/login'); // Or handle error appropriately
        }
        res.redirect('/'); // Redirect to a dashboard or home page
    });
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
};

exports.getLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
};
