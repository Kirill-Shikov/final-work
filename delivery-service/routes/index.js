const express = require('express');
const router = express.Router();

// Импортируем роутеры
const authRouter = require('./auth');
const advertisementsRouter = require('./advertisements');

// Подключаем роутеры
router.use('/auth', authRouter);
router.use('/advertisements', advertisementsRouter);

// Корневой маршрут
router.get('/', (req, res) => {
  res.json({
    name: 'Delivery Service API',
    version: '1.0.0',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        signin: 'POST /api/auth/signin'
      },
      advertisements: {
        list: 'GET /api/advertisements',
        get: 'GET /api/advertisements/:id',
        create: 'POST /api/advertisements',
        delete: 'DELETE /api/advertisements/:id'
      }
    }
  });
});

module.exports = router;