const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserModule {
  // Создание пользователя
  static async create(data) {
    const { email, password, name, contactPhone } = data;
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = new User({
      email,
      passwordHash,
      name,
      contactPhone: contactPhone || ''
    });
    
    await user.save();
    return user;
  }
  
  // Поиск пользователя по email
  static async findByEmail(email) {
    return await User.findOne({ email });
  }
  
  // Поиск пользователя по ID
  static async findById(id) {
    return await User.findById(id);
  }
}

module.exports = UserModule;