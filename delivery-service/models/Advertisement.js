const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  shortTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  images: [{
    type: String,
    default: []
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    default: []
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

advertisementSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Advertisement', advertisementSchema);