const Advertisement = require('../models/Advertisement');

class AdvertisementModule {
  // Поиск объявлений с фильтрацией
  static async find(params) {
    const query = { isDeleted: false };
    
    if (params.shortTitle) {
      query.shortTitle = { $regex: params.shortTitle, $options: 'i' };
    }
    if (params.description) {
      query.description = { $regex: params.description, $options: 'i' };
    }
    if (params.userId) {
      query.userId = params.userId;
    }
    if (params.tags && params.tags.length) {
      query.tags = { $all: params.tags };
    }
    
    return await Advertisement.find(query).populate('userId', 'name');
  }
  
  // Создание объявления
  static async create(data) {
    const advertisement = new Advertisement({
      shortTitle: data.shortTitle,
      description: data.description || '',
      images: data.images || [],
      userId: data.userId,
      tags: data.tags || []
    });
    await advertisement.save();
    return await advertisement.populate('userId', 'name');
  }
  
  // Мягкое удаление объявления
  static async remove(id) {
    const advertisement = await Advertisement.findById(id);
    if (!advertisement) return null;
    
    advertisement.isDeleted = true;
    await advertisement.save();
    return advertisement;
  }
  
  // Поиск по ID
  static async findById(id) {
    return await Advertisement.findOne({ _id: id, isDeleted: false }).populate('userId', 'name');
  }
}

module.exports = AdvertisementModule;