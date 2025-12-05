import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['shared', 'document', 'private'],
    default: 'shared'
  },
  mimeType: {
    type: String
  },
  size: {
    type: Number
  },
  uploadedBy: {
    type: String,
    default: 'admin'
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;
