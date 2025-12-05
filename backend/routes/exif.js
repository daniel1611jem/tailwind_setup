import express from 'express';
import multer from 'multer';
import { exiftool } from 'exiftool-vendored';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for temporary file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tempDir = path.join(__dirname, '../../temp');
    try {
      await fs.mkdir(tempDir, { recursive: true });
      cb(null, tempDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'exif-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|tiff|raw|cr2|nef|arw/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, TIFF, RAW)'));
    }
  }
});

// Helper function to clean up temp files
const cleanupFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};

// Read EXIF data from image
router.post('/read', upload.single('image'), async (req, res) => {
  let tempFile = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được upload' });
    }

    tempFile = req.file.path;
    
    // Read EXIF using exiftool
    const tags = await exiftool.read(tempFile);
    
    // Convert to simple object
    const exifData = {};
    for (const [key, value] of Object.entries(tags)) {
      if (value !== null && value !== undefined) {
        exifData[key] = value;
      }
    }
    
    res.json({ exifData });
  } catch (error) {
    console.error('Error reading EXIF:', error);
    res.status(500).json({ message: 'Lỗi khi đọc EXIF: ' + error.message });
  } finally {
    if (tempFile) {
      await cleanupFile(tempFile);
    }
  }
});

// Write EXIF data to image
router.post('/write', upload.single('image'), async (req, res) => {
  let tempInputFile = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được upload' });
    }

    if (!req.body.exifData) {
      return res.status(400).json({ message: 'Không có dữ liệu EXIF để ghi' });
    }

    tempInputFile = req.file.path;

    const exifData = JSON.parse(req.body.exifData);
    
    // Prepare tags for writing
    const tagsToWrite = {};
    
    // Map common field names to ExifTool tags
    const fieldMapping = {
      'Make': 'Make',
      'Model': 'Model',
      'Software': 'Software',
      'LensModel': 'LensModel',
      'LensMake': 'LensMake',
      'SerialNumber': 'SerialNumber',
      'DateTime': 'DateTime',
      'DateTimeOriginal': 'DateTimeOriginal',
      'DateTimeDigitized': 'CreateDate',
      'ModifyDate': 'ModifyDate',
      'OffsetTime': 'OffsetTime',
      'OffsetTimeOriginal': 'OffsetTimeOriginal',
      'OffsetTimeDigitized': 'OffsetTimeDigitized',
      'GPSLatitude': 'GPSLatitude',
      'GPSLongitude': 'GPSLongitude',
      'GPSLatitudeRef': 'GPSLatitudeRef',
      'GPSLongitudeRef': 'GPSLongitudeRef',
      'GPSAltitude': 'GPSAltitude',
      'GPSAltitudeRef': 'GPSAltitudeRef',
      'GPSDateTime': 'GPSDateTime',
      'FNumber': 'FNumber',
      'ExposureTime': 'ExposureTime',
      'ISO': 'ISO',
      'ISOSpeedRatings': 'ISOSpeedRatings',
      'FocalLength': 'FocalLength',
      'WhiteBalance': 'WhiteBalance',
      'Flash': 'Flash',
      'MeteringMode': 'MeteringMode',
      'ExposureProgram': 'ExposureProgram',
      'SceneType': 'SceneType',
      'SensingMethod': 'SensingMethod',
      'Copyright': 'Copyright',
      'Artist': 'Artist',
      'ImageDescription': 'ImageDescription',
      'UserComment': 'UserComment',
      'Orientation': 'Orientation',
      'ColorSpace': 'ColorSpace'
    };

    // Map edited data to ExifTool tags
    // ⚠️ FIX: Cho phép empty string để XÓA fields!
    const tagsToDelete = []; // Danh sách tags cần xóa
    
    // Helper: Normalize values về format EXIF chuẩn
    const normalizeExifValue = (field, value) => {
      // GPSLatitudeRef: Normalize về chữ cái đơn
      if (field === 'GPSLatitudeRef') {
        const v = String(value).toUpperCase();
        if (v.includes('N') || v === 'NORTH') return 'N';
        if (v.includes('S') || v === 'SOUTH') return 'S';
        return value;
      }
      
      // GPSLongitudeRef: Normalize về chữ cái đơn
      if (field === 'GPSLongitudeRef') {
        const v = String(value).toUpperCase();
        if (v.includes('W') || v === 'WEST') return 'W';
        if (v.includes('E') || v === 'EAST') return 'E';
        return value;
      }
      
      // GPSAltitudeRef: Normalize về số
      if (field === 'GPSAltitudeRef') {
        const v = String(value).toLowerCase();
        if (v === '0' || v === 'above sea level' || v === 'sea level') return '0';
        if (v === '1' || v === 'below sea level') return '1';
        return '0'; // Default: above sea level
      }
      
      // Orientation: Normalize về số hoặc text chuẩn
      if (field === 'Orientation') {
        const v = String(value).toLowerCase();
        if (v === '1' || v === 'horizontal' || v === 'top-left') return '1';
        if (v === '3' || v === 'rotate 180') return '3';
        if (v === '6' || v === 'rotate 90 cw') return '6';
        if (v === '8' || v === 'rotate 270 cw') return '8';
        return value;
      }
      
      // SceneCaptureType: Normalize về số
      if (field === 'SceneCaptureType') {
        const v = String(value).toLowerCase();
        if (v === '0' || v === 'standard') return '0';
        if (v === '1' || v === 'landscape') return '1';
        if (v === '2' || v === 'portrait') return '2';
        if (v === '3' || v === 'night scene') return '3';
        return value;
      }
      
      return value;
    };
    
    for (const [field, value] of Object.entries(exifData)) {
      if (fieldMapping[field]) {
        if (value === null || value === undefined) {
          // Skip null/undefined
          continue;
        } else if (value === '') {
          // Empty string = XÓA field
          tagsToDelete.push(fieldMapping[field]);
        } else {
          // SKIP GPS Ref fields - đã được xử lý trong GPS Latitude/Longitude
          if (field === 'GPSLatitudeRef' || field === 'GPSLongitudeRef') {
            console.log(`Skipping ${field} - already merged into GPS coordinate`);
            continue;
          }
          
          // Normal value - XỬ LÝ ĐẶC BIỆT CHO GPS
          let processedValue = value;
          
          // GPS Latitude: Xử lý số âm
          if (field === 'GPSLatitude') {
            const lat = parseFloat(value);
            if (!isNaN(lat)) {
              // Lấy Ref từ frontend HOẶC auto-detect từ dấu
              let ref;
              if (exifData.GPSLatitudeRef) {
                ref = normalizeExifValue('GPSLatitudeRef', exifData.GPSLatitudeRef);
              } else {
                ref = lat >= 0 ? 'N' : 'S';
              }
              
              // EXIFTOOL-VENDORED STRATEGY:
              // Nếu West/South → GHI SỐ ÂM (ExifTool sẽ tự set Ref)
              // Nếu East/North → GHI SỐ DƯƠNG
              let finalLat = lat;
              if (ref === 'S' && lat > 0) {
                finalLat = -Math.abs(lat);
              } else if (ref === 'N' && lat < 0) {
                finalLat = Math.abs(lat);
              }
              
              tagsToWrite['GPSLatitude'] = finalLat;
              
              console.log(`GPS Latitude: ${value} (Ref: ${ref}) → ${finalLat} (ExifTool sẽ tự set Ref)`);
            }
            continue;
          }
          
          // GPS Longitude: Xử lý số âm
          if (field === 'GPSLongitude') {
            const lon = parseFloat(value);
            if (!isNaN(lon)) {
              // Lấy Ref từ frontend HOẶC auto-detect từ dấu
              let ref;
              if (exifData.GPSLongitudeRef) {
                ref = normalizeExifValue('GPSLongitudeRef', exifData.GPSLongitudeRef);
              } else {
                ref = lon >= 0 ? 'E' : 'W';
              }
              
              // EXIFTOOL-VENDORED STRATEGY:
              // Nếu West → GHI SỐ ÂM
              // Nếu East → GHI SỐ DƯƠNG
              let finalLon = lon;
              if (ref === 'W' && lon > 0) {
                finalLon = -Math.abs(lon);
              } else if (ref === 'E' && lon < 0) {
                finalLon = Math.abs(lon);
              }
              
              tagsToWrite['GPSLongitude'] = finalLon;
              
              console.log(`GPS Longitude: ${value} (Ref: ${ref}) → ${finalLon} (ExifTool sẽ tự set Ref)`);
            }
            continue;
          }
          
          // Apply normalize cho các field khác
          processedValue = normalizeExifValue(field, value);
          
          tagsToWrite[fieldMapping[field]] = processedValue;
        }
      }
    }

    console.log('=== EXIF WRITE DEBUG ===');
    console.log('GPSLongitude from client:', exifData.GPSLongitude);
    console.log('GPSLongitudeRef from client:', exifData.GPSLongitudeRef);
    console.log('Artist from client:', exifData.Artist);
    console.log('UserComment from client:', exifData.UserComment);
    console.log('Tags to write:', tagsToWrite);
    console.log('Tags to delete:', tagsToDelete);

    // BƯỚC 1: XÓA TẤT CẢ EXIF CŨ TRƯỚC (để đảm bảo không còn data cũ)
    console.log('Step 1: Removing ALL existing EXIF...');
    await exiftool.write(tempInputFile, {}, ['-all=', '-overwrite_original']);
    
    // BƯỚC 2: XÓA các tags cụ thể (nếu có trong danh sách delete)
    if (tagsToDelete.length > 0) {
      console.log('Step 2: Deleting specific tags:', tagsToDelete);
      const deleteArgs = tagsToDelete.map(tag => `-${tag}=`);
      await exiftool.write(tempInputFile, {}, [...deleteArgs, '-overwrite_original']);
    }

    // BƯỚC 3: GHI các tags mới
    if (Object.keys(tagsToWrite).length > 0) {
      console.log('Step 3: Writing new tags...');
      console.log('Final tags object:', tagsToWrite);
      await exiftool.write(tempInputFile, tagsToWrite, ['-overwrite_original']);
    }
    
    console.log('EXIF write completed successfully!');
    
    // Read the modified file
    const modifiedImage = await fs.readFile(tempInputFile);
    
    // Send file back to client
    res.set({
      'Content-Type': req.file.mimetype,
      'Content-Disposition': `attachment; filename="modified_${req.file.originalname}"`
    });
    
    res.send(modifiedImage);
  } catch (error) {
    console.error('Error writing EXIF:', error);
    res.status(500).json({ message: 'Lỗi khi ghi EXIF: ' + error.message });
  } finally {
    // Cleanup temp file
    if (tempInputFile) {
      await cleanupFile(tempInputFile);
    }
  }
});

// Validate EXIF data
router.post('/validate', async (req, res) => {
  try {
    const { exifData } = req.body;
    const results = [];

    // Validate Make/Model
    if (exifData.Make && exifData.Model) {
      const make = exifData.Make.toLowerCase();
      const model = exifData.Model.toLowerCase();
      
      const brandModels = {
        'canon': ['eos', '5d', '6d', '7d', '80d', '90d', 'r5', 'r6'],
        'nikon': ['d', 'z'],
        'sony': ['alpha', 'a7', 'a6', 'rx'],
        'fujifilm': ['x-t', 'x-pro', 'x-e', 'x-h'],
        'olympus': ['om-d', 'pen'],
        'panasonic': ['lumix', 'gh', 'g']
      };

      let isValid = false;
      for (const [brand, models] of Object.entries(brandModels)) {
        if (make.includes(brand)) {
          isValid = models.some(m => model.includes(m));
          break;
        }
      }

      results.push({
        field: 'Make/Model',
        valid: isValid,
        message: isValid ? 'Model phù hợp với hãng' : 'Model có thể không phù hợp với hãng'
      });
    }

    // Validate GPS coordinates
    if (exifData.GPSLatitude || exifData.GPSLongitude) {
      const lat = parseFloat(exifData.GPSLatitude);
      const lon = parseFloat(exifData.GPSLongitude);
      
      const isValid = !isNaN(lat) && !isNaN(lon) && 
                     lat >= -90 && lat <= 90 && 
                     lon >= -180 && lon <= 180;
      
      results.push({
        field: 'GPS Coordinates',
        valid: isValid,
        message: isValid ? 'Tọa độ GPS hợp lệ' : 'Tọa độ GPS không hợp lệ'
      });
    }

    // Validate ISO
    if (exifData.ISO) {
      const iso = parseInt(exifData.ISO);
      const isValid = !isNaN(iso) && iso >= 50 && iso <= 102400;
      
      results.push({
        field: 'ISO',
        valid: isValid,
        message: isValid ? 'ISO hợp lệ' : 'ISO ngoài phạm vi thông thường'
      });
    }

    res.json({ results });
  } catch (error) {
    console.error('Error validating EXIF:', error);
    res.status(500).json({ message: 'Lỗi khi validate EXIF: ' + error.message });
  }
});

// Compare EXIF between two images
router.post('/compare', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]), async (req, res) => {
  let tempFile1 = null;
  let tempFile2 = null;
  
  try {
    if (!req.files || !req.files.image1 || !req.files.image2) {
      return res.status(400).json({ message: 'Cần 2 file để so sánh' });
    }

    tempFile1 = req.files.image1[0].path;
    tempFile2 = req.files.image2[0].path;
    
    const [exif1, exif2] = await Promise.all([
      exiftool.read(tempFile1),
      exiftool.read(tempFile2)
    ]);

    const differences = [];
    const commonKeys = new Set([...Object.keys(exif1), ...Object.keys(exif2)]);

    for (const key of commonKeys) {
      if (exif1[key] !== exif2[key]) {
        differences.push({
          field: key,
          value1: exif1[key],
          value2: exif2[key]
        });
      }
    }

    res.json({ differences, exif1, exif2 });
  } catch (error) {
    console.error('Error comparing EXIF:', error);
    res.status(500).json({ message: 'Lỗi khi so sánh EXIF: ' + error.message });
  } finally {
    if (tempFile1) await cleanupFile(tempFile1);
    if (tempFile2) await cleanupFile(tempFile2);
  }
});

// Remove all EXIF data
router.post('/remove-all', upload.single('image'), async (req, res) => {
  let tempFile = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được upload' });
    }

    tempFile = req.file.path;
    
    // Remove all EXIF/metadata
    await exiftool.write(tempFile, {}, ['-all=', '-overwrite_original']);
    
    // Read the cleaned file
    const cleanedImage = await fs.readFile(tempFile);
    
    res.set({
      'Content-Type': req.file.mimetype,
      'Content-Disposition': `attachment; filename="cleaned_${req.file.originalname}"`
    });
    
    res.send(cleanedImage);
  } catch (error) {
    console.error('Error removing EXIF:', error);
    res.status(500).json({ message: 'Lỗi khi xóa EXIF: ' + error.message });
  } finally {
    if (tempFile) await cleanupFile(tempFile);
  }
});

// Cleanup on server shutdown
process.on('exit', async () => {
  await exiftool.end();
});

export default router;
