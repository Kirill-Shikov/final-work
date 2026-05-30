const express = require('express');
const router = express.Router();
const passport = require('passport');
const UserModule = require('../modules/userModule');

// POST /api/signup - регистрация
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, contactPhone } = req.body;
    
    const existingUser = await UserModule.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'email занят', status: 'error' });
    }
    
    const user = await UserModule.create({ email, password, name, contactPhone });
    
    res.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        contactPhone: user.contactPhone
      },
      status: 'ok'
    });
  } catch (error) {
    res.status(500).json({ error: error.message, status: 'error' });
  }
});

// POST /api/signin - аутентификация
router.post('/signin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: err.message, status: 'error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль', status: 'error' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message, status: 'error' });
      }
      res.json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          contactPhone: user.contactPhone
        },
        status: 'ok'
      });
    });
  })(req, res, next);
});

module.exports = router;