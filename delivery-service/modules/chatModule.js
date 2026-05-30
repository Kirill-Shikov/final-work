const Chat = require('../models/Chat');
const EventEmitter = require('events');

const chatEmitter = new EventEmitter();

class ChatModule {
  // Получить чат между пользователями
  static async find(users) {
    const [user1, user2] = users;
    return await Chat.findOne({
      users: { $all: [user1, user2], $size: 2 }
    });
  }
  
  // Отправить сообщение
  static async sendMessage(data) {
    const { author, receiver, text } = data;
    
    let chat = await this.find([author, receiver]);
    
    if (!chat) {
      chat = new Chat({
        users: [author, receiver],
        messages: []
      });
    }
    
    const message = {
      author,
      sentAt: new Date(),
      text,
      readAt: null
    };
    
    chat.messages.push(message);
    await chat.save();
    
    const savedMessage = chat.messages[chat.messages.length - 1];
    
    // Эмитим событие для подписчиков
    chatEmitter.emit('newMessage', {
      chatId: chat._id,
      message: savedMessage
    });
    
    return savedMessage;
  }
  
  // Подписаться на новые сообщения
  static subscribe(callback) {
    chatEmitter.on('newMessage', callback);
  }
  
  // Получить историю сообщений чата
  static async getHistory(chatId) {
    const chat = await Chat.findById(chatId);
    if (!chat) return [];
    return chat.messages;
  }
}

module.exports = ChatModule;