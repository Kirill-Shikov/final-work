const express = require('express');
const router = express.Router();
const AdvertisementModule = require('../modules/advertisementModule');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/advertisements - список объявлений (публичный)
router.get('/', async (req, res) => {
  try {
    const { shortTitle, description, userId, tags } = req.query;
    const params = {};
    if (shortTitle) params.shortTitle = shortTitle;
    if (description) params.description = description;
    if (userId) params.userId = userId;
    if (tags) params.tags = tags.split(',');
    
    const advertisements = await AdvertisementModule.find(params);
    
    const data = advertisements.map(ad => ({
      id: ad.id,
      shortTitle: ad.shortTitle,
      description: ad.description,
      images: ad.images,
      user: {
        id: ad.userId?.id || ad.userId,
        name: ad.userId?.name
      },
      createdAt: ad.createdAt
    }));
    
    res.json({ data, status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: error.message, status: 'error' });
  }
});

// GET /api/advertisements/:id - получить объявление по ID (публичный)
router.get('/:id', async (req, res) => {
  try {
    const advertisement = await AdvertisementModule.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Объявление не найдено', status: 'error' });
    }
    
    res.json({
      data: {
        id: advertisement.id,
        shortTitle: advertisement.shortTitle,
        description: advertisement.description,
        images: advertisement.images,
        user: {
          id: advertisement.userId?.id || advertisement.userId,
          name: advertisement.userId?.name
        },
        createdAt: advertisement.createdAt
      },
      status: 'ok'
    });
  } catch (error) {
    res.status(500).json({ error: error.message, status: 'error' });
  }
});

// POST /api/advertisements - создать объявление (требует аутентификации)
router.post('/', isAuthenticated, upload, async (req, res) => {
  try {
    const { shortTitle, description, tags } = req.body;
    
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const advertisement = await AdvertisementModule.create({
      shortTitle,
      description: description || '',
      images,
      userId: req.user.id,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : []
    });
    
    res.json({
      data: {
        id: advertisement.id,
        shortTitle: advertisement.shortTitle,
        description: advertisement.description,
        images: advertisement.images,
        user: {
          id: advertisement.userId.id,
          name: advertisement.userId.name
        },
        createdAt: advertisement.createdAt
      },
      status: 'ok'
    });
  } catch (error) {
    res.status(500).json({ error: error.message, status: 'error' });
  }
});

// DELETE /api/advertisements/:id - удалить объявление (требует аутентификации)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const advertisement = await AdvertisementModule.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ error: 'Объявление не найдено', status: 'error' });
    }
    
    if (advertisement.userId.id !== req.user.id && advertisement.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для удаления этого объявления', status: 'error' });
    }
    
    await AdvertisementModule.remove(req.params.id);
    
    res.json({ data: null, status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: error.message, status: 'error' });
  }
});

module.exports = router;