// Device EXIF Profiles - Metadata thật từ các thiết bị phổ biến
// Dữ liệu được thu thập từ ảnh thực tế để đảm bảo tính chân thực

export const DEVICE_PROFILES = {
  // ========== IPHONE ==========
  'iPhone 15 Pro Max': {
    category: 'iPhone',
    icon: '📱',
    metadata: {
      'Make': 'Apple',
      'Model': 'iPhone 15 Pro Max',
      'Software': 'iOS 17.1.1',
      'LensModel': 'iPhone 15 Pro Max back triple camera 6.86mm f/1.78',
      'LensMake': 'Apple',
      
      // Camera Settings - Main Camera
      'FocalLength': '6.86',
      'FocalLengthIn35mmFormat': '24',
      'FNumber': '1.78',
      'ExposureTime': '1/120',
      'ISO': '50',
      'WhiteBalance': 'Auto',
      'Flash': 'Off, Did not fire',
      'MeteringMode': 'Pattern',
      'ExposureProgram': 'Program AE',
      'ExposureMode': 'Auto',
      'SceneCaptureType': 'Standard',
      'Sharpness': 'Normal',
      'Saturation': 'Normal',
      'Contrast': 'Normal',
      
      // Resolution
      'XResolution': '72',
      'YResolution': '72',
      'ResolutionUnit': 'inches',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4032',
      'ExifImageHeight': '3024',
      
      // Other
      'Orientation': 'Horizontal (normal)',
      'YCbCrPositioning': 'Centered',
      'SensingMethod': 'One-chip color area',
      'SceneType': 'Directly photographed',
      'ExposureBiasValue': '0',
      'MeteringMode': 'Multi-segment',
      'LightSource': 'Unknown',
      'SubjectDistanceRange': 'Unknown'
    }
  },

  'iPhone 15 Pro': {
    category: 'iPhone',
    icon: '📱',
    metadata: {
      'Make': 'Apple',
      'Model': 'iPhone 15 Pro',
      'Software': 'iOS 17.1.1',
      'LensModel': 'iPhone 15 Pro back triple camera 6.86mm f/1.78',
      'LensMake': 'Apple',
      'FocalLength': '6.86',
      'FocalLengthIn35mmFormat': '24',
      'FNumber': '1.78',
      'ExposureTime': '1/120',
      'ISO': '50',
      'WhiteBalance': 'Auto',
      'Flash': 'Off, Did not fire',
      'MeteringMode': 'Pattern',
      'ExposureProgram': 'Program AE',
      'XResolution': '72',
      'YResolution': '72',
      'ResolutionUnit': 'inches',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4032',
      'ExifImageHeight': '3024',
      'Orientation': 'Horizontal (normal)',
      'SensingMethod': 'One-chip color area'
    }
  },

  'iPhone 14 Pro Max': {
    category: 'iPhone',
    icon: '📱',
    metadata: {
      'Make': 'Apple',
      'Model': 'iPhone 14 Pro Max',
      'Software': 'iOS 16.6',
      'LensModel': 'iPhone 14 Pro Max back triple camera 6.86mm f/1.78',
      'LensMake': 'Apple',
      'FocalLength': '6.86',
      'FocalLengthIn35mmFormat': '24',
      'FNumber': '1.78',
      'ExposureTime': '1/100',
      'ISO': '64',
      'WhiteBalance': 'Auto',
      'Flash': 'Off, Did not fire',
      'MeteringMode': 'Pattern',
      'ExposureProgram': 'Program AE',
      'XResolution': '72',
      'YResolution': '72',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4032',
      'ExifImageHeight': '3024',
      'Orientation': 'Horizontal (normal)'
    }
  },

  'iPhone 13 Pro': {
    category: 'iPhone',
    icon: '📱',
    metadata: {
      'Make': 'Apple',
      'Model': 'iPhone 13 Pro',
      'Software': 'iOS 15.7',
      'LensModel': 'iPhone 13 Pro back triple camera 5.7mm f/1.5',
      'LensMake': 'Apple',
      'FocalLength': '5.7',
      'FocalLengthIn35mmFormat': '26',
      'FNumber': '1.5',
      'ExposureTime': '1/120',
      'ISO': '50',
      'WhiteBalance': 'Auto',
      'Flash': 'Off, Did not fire',
      'MeteringMode': 'Pattern',
      'ExposureProgram': 'Program AE',
      'XResolution': '72',
      'YResolution': '72',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4032',
      'ExifImageHeight': '3024'
    }
  },

  // ========== SAMSUNG ==========
  'Samsung Galaxy S23 Ultra': {
    category: 'Samsung',
    icon: '📱',
    metadata: {
      'Make': 'samsung',
      'Model': 'SM-S918B',
      'Software': 'S918BXXU2AWC5',
      'LensModel': 'Samsung Galaxy S23 Ultra Rear Camera',
      'FocalLength': '6.4',
      'FocalLengthIn35mmFormat': '24',
      'FNumber': '1.7',
      'ExposureTime': '1/100',
      'ISO': '50',
      'ISOSpeedRatings': '50',
      'WhiteBalance': 'Auto',
      'Flash': 'Off, Did not fire',
      'MeteringMode': 'Center-weighted average',
      'ExposureProgram': 'Program AE',
      'SceneCaptureType': 'Standard',
      'XResolution': '72',
      'YResolution': '72',
      'ResolutionUnit': 'inches',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4000',
      'ExifImageHeight': '3000',
      'Orientation': 'Horizontal (normal)',
      'YCbCrPositioning': 'Centered',
      'ExposureBiasValue': '0',
      'MaxApertureValue': '1.7',
      'MeteringMode': 'Center-weighted average',
      'LightSource': 'Unknown',
      'Flash': 'Flash did not fire',
      'SubjectDistance': '0',
      'SensingMethod': 'One-chip color area'
    }
  },

  'Samsung Galaxy S22 Ultra': {
    category: 'Samsung',
    icon: '📱',
    metadata: {
      'Make': 'samsung',
      'Model': 'SM-S908B',
      'Software': 'S908BXXU2CVC4',
      'LensModel': 'Samsung Galaxy S22 Ultra Rear Camera',
      'FocalLength': '5.4',
      'FocalLengthIn35mmFormat': '23',
      'FNumber': '1.8',
      'ExposureTime': '1/100',
      'ISO': '50',
      'WhiteBalance': 'Auto',
      'Flash': 'Off, Did not fire',
      'MeteringMode': 'Center-weighted average',
      'ExposureProgram': 'Program AE',
      'XResolution': '72',
      'YResolution': '72',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4000',
      'ExifImageHeight': '3000'
    }
  },

  'Samsung Galaxy S21 Ultra': {
    category: 'Samsung',
    icon: '📱',
    metadata: {
      'Make': 'samsung',
      'Model': 'SM-G998B',
      'Software': 'G998BXXU5FVIB',
      'LensModel': 'Samsung Galaxy S21 Ultra 5G Rear Camera',
      'FocalLength': '6.0',
      'FocalLengthIn35mmFormat': '24',
      'FNumber': '1.8',
      'ExposureTime': '1/100',
      'ISO': '64',
      'WhiteBalance': 'Auto',
      'Flash': 'Off, Did not fire',
      'MeteringMode': 'Center-weighted average',
      'ExposureProgram': 'Program AE',
      'XResolution': '72',
      'YResolution': '72',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4000',
      'ExifImageHeight': '3000'
    }
  },

  // ========== GOOGLE PIXEL ==========
  'Google Pixel 8 Pro': {
    category: 'Google Pixel',
    icon: '📱',
    metadata: {
      'Make': 'Google',
      'Model': 'Pixel 8 Pro',
      'Software': 'HDR+ 1.0.560464533zd',
      'LensModel': 'Pixel 8 Pro back camera 6.9mm f/1.68',
      'FocalLength': '6.9',
      'FocalLengthIn35mmFormat': '24',
      'FNumber': '1.68',
      'ExposureTime': '1/120',
      'ISO': '55',
      'WhiteBalance': 'Auto',
      'Flash': 'No Flash',
      'MeteringMode': 'Center-weighted average',
      'ExposureProgram': 'Program AE',
      'XResolution': '72',
      'YResolution': '72',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4080',
      'ExifImageHeight': '3072',
      'Orientation': 'Horizontal (normal)'
    }
  },

  'Google Pixel 7 Pro': {
    category: 'Google Pixel',
    icon: '📱',
    metadata: {
      'Make': 'Google',
      'Model': 'Pixel 7 Pro',
      'Software': 'HDR+ 1.0.509558569zd',
      'LensModel': 'Pixel 7 Pro back camera 6.81mm f/1.85',
      'FocalLength': '6.81',
      'FocalLengthIn35mmFormat': '24',
      'FNumber': '1.85',
      'ExposureTime': '1/120',
      'ISO': '56',
      'WhiteBalance': 'Auto',
      'Flash': 'No Flash',
      'MeteringMode': 'Center-weighted average',
      'ExposureProgram': 'Program AE',
      'XResolution': '72',
      'YResolution': '72',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4080',
      'ExifImageHeight': '3072'
    }
  },

  // ========== XIAOMI ==========
  'Xiaomi 13 Pro': {
    category: 'Xiaomi',
    icon: '📱',
    metadata: {
      'Make': 'Xiaomi',
      'Model': '2210132C',
      'Software': 'MIUI 14.0.6',
      'LensModel': 'Xiaomi 13 Pro rear camera',
      'FocalLength': '4.7',
      'FocalLengthIn35mmFormat': '23',
      'FNumber': '1.9',
      'ExposureTime': '1/100',
      'ISO': '50',
      'WhiteBalance': 'Auto',
      'Flash': 'Off, Did not fire',
      'MeteringMode': 'Center-weighted average',
      'ExposureProgram': 'Program AE',
      'XResolution': '72',
      'YResolution': '72',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4000',
      'ExifImageHeight': '3000'
    }
  },

  // ========== OPPO ==========
  'OPPO Find X5 Pro': {
    category: 'OPPO',
    icon: '📱',
    metadata: {
      'Make': 'OPPO',
      'Model': 'CPH2305',
      'Software': 'ColorOS 13.0',
      'LensModel': 'OPPO Find X5 Pro rear camera',
      'FocalLength': '5.59',
      'FocalLengthIn35mmFormat': '24',
      'FNumber': '1.7',
      'ExposureTime': '1/100',
      'ISO': '100',
      'WhiteBalance': 'Auto',
      'Flash': 'Off, Did not fire',
      'MeteringMode': 'Pattern',
      'ExposureProgram': 'Program AE',
      'XResolution': '72',
      'YResolution': '72',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '4000',
      'ExifImageHeight': '3000'
    }
  },

  // ========== CANON DSLR (bonus) ==========
  'Canon EOS R5': {
    category: 'DSLR/Mirrorless',
    icon: '📷',
    metadata: {
      'Make': 'Canon',
      'Model': 'Canon EOS R5',
      'LensModel': 'RF24-105mm F4 L IS USM',
      'LensMake': 'Canon',
      'SerialNumber': '',
      'FocalLength': '50',
      'FocalLengthIn35mmFormat': '50',
      'FNumber': '5.6',
      'ExposureTime': '1/250',
      'ISO': '100',
      'WhiteBalance': 'Auto',
      'Flash': 'Off, Did not fire',
      'MeteringMode': 'Multi-segment',
      'ExposureProgram': 'Aperture-priority AE',
      'XResolution': '72',
      'YResolution': '72',
      'ColorSpace': 'sRGB',
      'ExifImageWidth': '8192',
      'ExifImageHeight': '5464',
      'Orientation': 'Horizontal (normal)'
    }
  }
};

// Quick categories for filtering
export const DEVICE_CATEGORIES = [
  'iPhone',
  'Samsung',
  'Google Pixel',
  'Xiaomi',
  'OPPO',
  'DSLR/Mirrorless'
];

// Helper: Get devices by category
export const getDevicesByCategory = (category) => {
  return Object.entries(DEVICE_PROFILES)
    .filter(([_, profile]) => profile.category === category)
    .map(([name, profile]) => ({ name, ...profile }));
};

// Helper: Get all device names
export const getAllDeviceNames = () => {
  return Object.keys(DEVICE_PROFILES);
};

// Helper: Get profile by device name
export const getDeviceProfile = (deviceName) => {
  return DEVICE_PROFILES[deviceName];
};

// Fields that can be edited in Legit Mode
// Bao gồm: GPS, DateTime, và các thông tin cá nhân hóa
// CÁC FIELD HỆ THỐNG (Make, Model, Lens, ISO, v.v.) SẼ BỊ KHÓA để đảm bảo độ chân thật
export const LEGIT_MODE_EDITABLE_FIELDS = [
  // === GPS Location (Định vị) ===
  'GPSLatitude',
  'GPSLongitude',
  'GPSAltitude',
  'GPSLatitudeRef',
  'GPSLongitudeRef',
  'GPSAltitudeRef',
  'GPSDateTime',
  'GPSDateStamp',
  'GPSTimeStamp',
  'GPSSpeed',
  'GPSSpeedRef',
  'GPSImgDirection',
  'GPSImgDirectionRef',
  'GPSDestBearing',
  'GPSDestBearingRef',
  'GPSHPositioningError',
  
  // === Date & Time (Thời gian) ===
  'DateTime',
  'DateTimeOriginal',
  'DateTimeDigitized',
  'ModifyDate',
  'CreateDate',
  'OffsetTime',
  'OffsetTimeOriginal',
  'OffsetTimeDigitized',
  'SubSecTime',
  'SubSecTimeOriginal',
  'SubSecTimeDigitized',
  'TimeZone',
  'TimeZoneOffset',
  
  // === Personal Information (Thông tin cá nhân) ===
  'Artist',
  'Copyright',
  'OwnerName',
  'Creator',
  'CreatorWorkURL',
  'AuthorsPosition',
  'CaptionAbstract',
  'Credit',
  'Source',
  'Title',
  'Subject',
  'Description',
  'UserComment',
  'ImageDescription',
  'Comment',
  'Keywords',
  'Category',
  'SupplementalCategories',
  
  // === User Settings (Cài đặt người dùng) ===
  'Rating',
  'RatingPercent',
  'Label',
  'Marked',
  'Select',
  
  // === Optional Metadata ===
  'Headline',
  'Instructions',
  'TransmissionReference',
  'ImageUniqueID',
  'CameraOwnerName',
  'BodySerialNumber',
  'LensSerialNumber'
];

// Nhóm các field để hiển thị cho user dễ hiểu
export const LEGIT_MODE_FIELD_GROUPS = {
  'GPS & Location': [
    'GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSLatitudeRef', 
    'GPSLongitudeRef', 'GPSAltitudeRef', 'GPSDateTime', 'GPSDateStamp', 
    'GPSTimeStamp', 'GPSSpeed', 'GPSImgDirection', 'GPSHPositioningError'
  ],
  'Date & Time': [
    'DateTime', 'DateTimeOriginal', 'DateTimeDigitized', 'ModifyDate', 
    'CreateDate', 'OffsetTime', 'OffsetTimeOriginal', 'OffsetTimeDigitized',
    'SubSecTime', 'SubSecTimeOriginal', 'SubSecTimeDigitized'
  ],
  'Personal Info': [
    'Artist', 'Copyright', 'OwnerName', 'Creator', 'ImageDescription',
    'UserComment', 'Description', 'Keywords', 'Title', 'Subject'
  ],
  'Optional': [
    'Rating', 'Label', 'CameraOwnerName', 'BodySerialNumber', 'LensSerialNumber'
  ]
};
