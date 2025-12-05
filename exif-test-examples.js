// EXIF Editor - Test Examples
// Các ví dụ test để kiểm tra chức năng EXIF Editor

// ============================================
// 1. TEST CLIENT-SIDE EXIF READING
// ============================================
/*
Mở console trong browser (F12) và chạy:

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  const ExifReader = await import('exifreader');
  const tags = await ExifReader.load(file);
  console.log('EXIF Tags:', tags);
};
fileInput.click();
*/

// ============================================
// 2. EXAMPLE EXIF DATA (Valid)
// ============================================
const validExifData = {
  // Device
  Make: 'Canon',
  Model: 'Canon EOS 5D Mark IV',
  Software: 'Firmware Version 1.3.0',
  LensModel: 'EF 24-70mm f/2.8L II USM',
  
  // Camera Settings
  FNumber: 'f/2.8',
  ExposureTime: '1/250',
  ISO: '400',
  FocalLength: '50mm',
  WhiteBalance: 'Auto',
  Flash: 'Flash did not fire',
  
  // DateTime
  DateTime: '2025:11:26 10:30:45',
  DateTimeOriginal: '2025:11:26 10:30:45',
  DateTimeDigitized: '2025:11:26 10:30:45',
  ModifyDate: '2025:11:26 10:30:45',
  
  // GPS (Hanoi, Vietnam)
  GPSLatitude: '21.0285',
  GPSLongitude: '105.8542',
  GPSAltitude: '10',
  GPSDateTime: '2025:11:26 03:30:45', // UTC
  
  // Other
  Copyright: 'Copyright 2025',
  Artist: 'John Doe',
  ImageDescription: 'Beautiful landscape photo',
  UserComment: 'Captured during sunrise'
};

// ============================================
// 3. EXAMPLE EXIF DATA (Invalid - for testing validation)
// ============================================
const invalidExifData = {
  // Mismatched Make/Model
  Make: 'Canon',
  Model: 'Nikon D850', // ❌ Nikon model with Canon make
  
  // Invalid GPS
  GPSLatitude: '999', // ❌ Out of range (-90 to 90)
  GPSLongitude: '-999', // ❌ Out of range (-180 to 180)
  
  // Invalid ISO
  ISO: '999999', // ❌ Too high
  
  // Invalid FNumber
  FNumber: 'f/0.5', // ❌ Too low
};

// ============================================
// 4. COMMON CAMERA BRANDS & MODELS
// ============================================
const cameraBrands = {
  Canon: [
    'Canon EOS 5D Mark IV',
    'Canon EOS R5',
    'Canon EOS 90D',
    'Canon EOS 6D Mark II',
    'Canon EOS 7D Mark II'
  ],
  Nikon: [
    'Nikon D850',
    'Nikon Z7 II',
    'Nikon D780',
    'Nikon Z6',
    'Nikon D500'
  ],
  Sony: [
    'Sony Alpha a7R IV',
    'Sony Alpha a7 III',
    'Sony Alpha a6400',
    'Sony Alpha a9 II',
    'Sony RX100 VII'
  ],
  Fujifilm: [
    'Fujifilm X-T4',
    'Fujifilm X-Pro3',
    'Fujifilm X-E4',
    'Fujifilm X-H1',
    'Fujifilm GFX 100'
  ],
  Olympus: [
    'Olympus OM-D E-M1 Mark III',
    'Olympus PEN-F',
    'Olympus OM-D E-M5 Mark III'
  ],
  Panasonic: [
    'Panasonic Lumix GH5',
    'Panasonic Lumix G9',
    'Panasonic Lumix S1R'
  ]
};

// ============================================
// 5. GPS COORDINATES (Famous locations)
// ============================================
const famousLocations = {
  'Hanoi, Vietnam': {
    GPSLatitude: '21.0285',
    GPSLongitude: '105.8542',
    GPSAltitude: '10'
  },
  'Ho Chi Minh, Vietnam': {
    GPSLatitude: '10.8231',
    GPSLongitude: '106.6297',
    GPSAltitude: '5'
  },
  'Tokyo, Japan': {
    GPSLatitude: '35.6762',
    GPSLongitude: '139.6503',
    GPSAltitude: '40'
  },
  'Paris, France': {
    GPSLatitude: '48.8566',
    GPSLongitude: '2.3522',
    GPSAltitude: '35'
  },
  'New York, USA': {
    GPSLatitude: '40.7128',
    GPSLongitude: '-74.0060',
    GPSAltitude: '10'
  }
};

// ============================================
// 6. TEST VALIDATION RULES
// ============================================
const validationTests = [
  {
    name: 'Valid Canon Setup',
    data: {
      Make: 'Canon',
      Model: 'Canon EOS 5D Mark IV',
      Software: 'Firmware Version 1.3.0'
    },
    expectedResult: true
  },
  {
    name: 'Invalid Make/Model Mismatch',
    data: {
      Make: 'Canon',
      Model: 'Nikon D850'
    },
    expectedResult: false
  },
  {
    name: 'Valid GPS Coordinates',
    data: {
      GPSLatitude: '21.0285',
      GPSLongitude: '105.8542'
    },
    expectedResult: true
  },
  {
    name: 'Invalid GPS (out of range)',
    data: {
      GPSLatitude: '999',
      GPSLongitude: '-999'
    },
    expectedResult: false
  },
  {
    name: 'Valid ISO',
    data: {
      ISO: '400'
    },
    expectedResult: true
  },
  {
    name: 'Invalid ISO (too high)',
    data: {
      ISO: '999999'
    },
    expectedResult: false
  }
];

// ============================================
// 7. API CALL EXAMPLES
// ============================================
/*
// Example: Read EXIF from server
const readExif = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/exif/read', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  console.log('EXIF Data:', data.exifData);
};

// Example: Write EXIF to image
const writeExif = async (file, exifData) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('exifData', JSON.stringify(exifData));
  
  const response = await fetch('/api/exif/write', {
    method: 'POST',
    body: formData
  });
  
  const blob = await response.blob();
  
  // Download the modified image
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'modified_image.jpg';
  a.click();
};

// Example: Validate EXIF
const validateExif = async (exifData) => {
  const response = await fetch('/api/exif/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ exifData })
  });
  
  const data = await response.json();
  console.log('Validation Results:', data.results);
};

// Example: Compare two images
const compareExif = async (file1, file2) => {
  const formData = new FormData();
  formData.append('image1', file1);
  formData.append('image2', file2);
  
  const response = await fetch('/api/exif/compare', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  console.log('Differences:', data.differences);
};

// Example: Remove all EXIF
const removeAllExif = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/exif/remove-all', {
    method: 'POST',
    body: formData
  });
  
  const blob = await response.blob();
  
  // Download the cleaned image
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cleaned_image.jpg';
  a.click();
};
*/

// ============================================
// 8. DATETIME FORMAT EXAMPLES
// ============================================
const dateTimeFormats = {
  EXIF: '2025:11:26 10:30:45',
  ISO: '2025-11-26T10:30:45',
  Readable: 'November 26, 2025 10:30:45 AM',
  Unix: Math.floor(Date.now() / 1000)
};

// Helper: Convert to EXIF DateTime format
const toExifDateTime = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
};

// Example usage:
// console.log(toExifDateTime(new Date())); // "2025:11:26 10:30:45"

// ============================================
// 9. EXPOSURE SETTINGS EXAMPLES
// ============================================
const exposureSettings = {
  Landscape: {
    FNumber: 'f/8',
    ExposureTime: '1/125',
    ISO: '100',
    FocalLength: '24mm'
  },
  Portrait: {
    FNumber: 'f/2.8',
    ExposureTime: '1/250',
    ISO: '400',
    FocalLength: '85mm'
  },
  Sports: {
    FNumber: 'f/4',
    ExposureTime: '1/1000',
    ISO: '800',
    FocalLength: '200mm'
  },
  Night: {
    FNumber: 'f/2.8',
    ExposureTime: '1/30',
    ISO: '3200',
    FocalLength: '35mm'
  },
  Macro: {
    FNumber: 'f/16',
    ExposureTime: '1/60',
    ISO: '200',
    FocalLength: '100mm'
  }
};

// ============================================
// 10. EXPORT FOR USE
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validExifData,
    invalidExifData,
    cameraBrands,
    famousLocations,
    validationTests,
    dateTimeFormats,
    toExifDateTime,
    exposureSettings
  };
}

console.log('✓ EXIF Editor test examples loaded');
console.log('Available exports:', [
  'validExifData',
  'invalidExifData',
  'cameraBrands',
  'famousLocations',
  'validationTests',
  'dateTimeFormats',
  'toExifDateTime',
  'exposureSettings'
]);
