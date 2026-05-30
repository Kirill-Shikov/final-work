require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const UserModule = require('./modules/userModule');
const ChatModule = require('./modules/chatModule');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.HTTP_PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongodb:27017/delivery';

// Подключение к MongoDB
mongoose.connect(MONGO_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Сессии
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Неверный логин или пароль' });
      }
      
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return done(null, false, { message: 'Неверный логин или пароль' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Маршруты
app.use('/api', require('./routes/auth'));
app.use('/api/advertisements', require('./routes/advertisements'));

// Socket.IO для чата
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  let currentUserId = null;
  
  socket.on('setUser', (userId) => {
    currentUserId = userId;
    console.log(`User ${userId} set for socket ${socket.id}`);
  });
  
  // Получить историю чата с собеседником
  socket.on('getHistory', async (receiverId) => {
    if (!currentUserId) {
      socket.emit('error', { message: 'Не авторизован' });
      return;
    }
    
    const chat = await ChatModule.find([currentUserId, receiverId]);
    if (!chat) {
      socket.emit('chatHistory', []);
      return;
    }
    
    const messages = await ChatModule.getHistory(chat.id);
    socket.emit('chatHistory', messages);
  });
  
  // Отправить сообщение
  socket.on('sendMessage', async ({ receiver, text }) => {
    if (!currentUserId) {
      socket.emit('error', { message: 'Не авторизован' });
      return;
    }
    
    const message = await ChatModule.sendMessage({
      author: currentUserId,
      receiver,
      text
    });
    
    // Отправляем сообщение отправителю и получателю
    socket.emit('newMessage', message);
    socket.to(`user_${receiver}`).emit('newMessage', message);
  });
  
  // Подписка на комнату пользователя
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    currentUserId = userId;
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Подписка на новые сообщения из ChatModule
ChatModule.subscribe(({ chatId, message }) => {
  io.emit('newMessage', message);
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});