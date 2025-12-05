import express from 'express';
import Media from '../models/Media.js';
import { s3Client, upload } from '../config/aws.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();

// Get all media by type
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const media = await Media.find(filter).sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload media
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được upload' });
    }

    const media = new Media({
      filename: req.file.key,
      originalName: req.file.originalname,
      url: req.file.location,
      s3Key: req.file.key,
      type: req.body.type || 'shared',
      mimeType: req.file.mimetype,
      size: req.file.size,
      description: req.body.description || '',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
    });

    await media.save();
    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update media info
router.put('/:id', async (req, res) => {
  try {
    const { description, tags } = req.body;
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { description, tags: tags ? tags.split(',').map(t => t.trim()) : [] },
      { new: true }
    );
    
    if (!media) {
      return res.status(404).json({ message: 'Không tìm thấy media' });
    }
    
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete media
router.delete('/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ message: 'Không tìm thấy media' });
    }

    // Delete from S3 (SDK v3)
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'mmo-kyc-storage',
      Key: media.s3Key
    });

    await s3Client.send(deleteCommand);
    
    // Delete from database
    await Media.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Đã xóa media thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get media by ID
router.get('/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ message: 'Không tìm thấy media' });
    }
    
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
