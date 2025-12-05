import { useState, useEffect } from 'react';
import ExifReader from 'exifreader';
import { toast } from './Toast';
import { 
  DEVICE_PROFILES, 
  DEVICE_CATEGORIES, 
  getDevicesByCategory,
  getDeviceProfile,
  LEGIT_MODE_EDITABLE_FIELDS,
  LEGIT_MODE_FIELD_GROUPS
} from '../data/deviceProfiles';

// US Timezones với các thành phố chính
const US_TIMEZONES = {
  'America/Los_Angeles': {
    name: 'Los Angeles, CA (PST/PDT)',
    offset: -8,
    dstOffset: -7,
    cities: ['Los Angeles', 'San Diego', 'San Francisco', 'Seattle', 'Portland']
  },
  'America/Denver': {
    name: 'Denver, CO (MST/MDT)',
    offset: -7,
    dstOffset: -6,
    cities: ['Denver', 'Phoenix', 'Salt Lake City', 'Albuquerque']
  },
  'America/Chicago': {
    name: 'Chicago, IL (CST/CDT)',
    offset: -6,
    dstOffset: -5,
    cities: ['Chicago', 'Houston', 'Dallas', 'San Antonio', 'Austin']
  },
  'America/New_York': {
    name: 'New York, NY (EST/EDT)',
    offset: -5,
    dstOffset: -4,
    cities: ['New York', 'Boston', 'Philadelphia', 'Miami', 'Atlanta', 'Washington DC']
  },
  'Pacific/Honolulu': {
    name: 'Honolulu, HI (HST)',
    offset: -10,
    dstOffset: -10, // Hawaii không có DST
    cities: ['Honolulu']
  },
  'America/Anchorage': {
    name: 'Anchorage, AK (AKST/AKDT)',
    offset: -9,
    dstOffset: -8,
    cities: ['Anchorage']
  }
};

// EXIF Template đầy đủ - TẤT CẢ các trường chuẩn (rỗng ban đầu)
const EXIF_TEMPLATE = {
  // Device Info
  'Make': '',
  'Model': '',
  'Software': '',
  'LensModel': '',
  'LensMake': '',
  'SerialNumber': '',
  
  // Camera Settings
  'FNumber': '',
  'ExposureTime': '',
  'ISO': '',
  'ISOSpeedRatings': '',
  'FocalLength': '',
  'FocalLengthIn35mmFormat': '',
  'WhiteBalance': '',
  'Flash': '',
  'MeteringMode': '',
  'ExposureProgram': '',
  'ExposureMode': '',
  'ExposureBiasValue': '',
  'MaxApertureValue': '',
  'SubjectDistance': '',
  'LightSource': '',
  'FlashEnergy': '',
  'FocalPlaneXResolution': '',
  'FocalPlaneYResolution': '',
  'SensingMethod': '',
  'SceneType': '',
  'CustomRendered': '',
  'DigitalZoomRatio': '',
  'SceneCaptureType': '',
  'GainControl': '',
  'Contrast': '',
  'Saturation': '',
  'Sharpness': '',
  'SubjectDistanceRange': '',
  
  // DateTime
  'DateTime': '',
  'DateTimeOriginal': '',
  'DateTimeDigitized': '',
  'ModifyDate': '',
  'CreateDate': '',
  'OffsetTime': '',
  'OffsetTimeOriginal': '',
  'OffsetTimeDigitized': '',
  'SubSecTime': '',
  'SubSecTimeOriginal': '',
  'SubSecTimeDigitized': '',
  
  // GPS
  'GPSLatitude': '',
  'GPSLongitude': '',
  'GPSAltitude': '',
  'GPSLatitudeRef': '',
  'GPSLongitudeRef': '',
  'GPSAltitudeRef': '',
  'GPSDateTime': '',
  'GPSDateStamp': '',
  'GPSTimeStamp': '',
  'GPSSpeed': '',
  'GPSSpeedRef': '',
  'GPSTrack': '',
  'GPSTrackRef': '',
  'GPSImgDirection': '',
  'GPSImgDirectionRef': '',
  'GPSDestBearing': '',
  'GPSDestBearingRef': '',
  'GPSMapDatum': '',
  'GPSProcessingMethod': '',
  'GPSAreaInformation': '',
  
  // Image Info
  'ImageWidth': '',
  'ImageHeight': '',
  'BitsPerSample': '',
  'Compression': '',
  'PhotometricInterpretation': '',
  'Orientation': '',
  'SamplesPerPixel': '',
  'PlanarConfiguration': '',
  'YCbCrSubSampling': '',
  'YCbCrPositioning': '',
  'XResolution': '',
  'YResolution': '',
  'ResolutionUnit': '',
  'TransferFunction': '',
  'ColorSpace': '',
  'PixelXDimension': '',
  'PixelYDimension': '',
  
  // Other Metadata
  'Copyright': '',
  'Artist': '',
  'ImageDescription': '',
  'UserComment': '',
  'ExifVersion': '',
  'FlashpixVersion': '',
  'ComponentsConfiguration': '',
  'CompressedBitsPerPixel': '',
  'MakerNote': '',
  'RelatedSoundFile': '',
  'ImageUniqueID': '',
  'CameraOwnerName': '',
  'BodySerialNumber': '',
  'LensSpecification': '',
  'LensSerialNumber': '',
  'Gamma': '',
  'PrintImageMatching': '',
  'DNGVersion': '',
  'UniqueCameraModel': '',
};

const EXIFEditor = ({ imageFile, imageUrl, onClose, onSave }) => {
  const [exifData, setExifData] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeGroup, setActiveGroup] = useState('all'); // Mặc định hiển thị tất cả
  const [validationResults, setValidationResults] = useState([]);
  const [showValidation, setShowValidation] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Filter EXIF fields
  
  // EXIF Profiles
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [jsonViewerData, setJsonViewerData] = useState(null);
  const [importMode, setImportMode] = useState('merge'); // 'merge' or 'replace'

  // Legit Mode & Device Selector
  const [legitMode, setLegitMode] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  // Timezone Calculator
  const [showTimezoneCalc, setShowTimezoneCalc] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState('America/New_York');
  const [baseDateTime, setBaseDateTime] = useState(new Date().toISOString().slice(0, 16));
  
  // MakerNote Preservation
  const [originalMakerNote, setOriginalMakerNote] = useState(null);
  const [preserveMakerNote, setPreserveMakerNote] = useState(true);

  // Load saved profiles từ localStorage khi component mount
  useEffect(() => {
    const stored = localStorage.getItem('exifProfiles');
    if (stored) {
      try {
        setSavedProfiles(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading profiles:', e);
      }
    }
  }, []);

  // Nhóm EXIF theo category - HIỂN THỊ TẤT CẢ các trường trong template
  const exifGroups = {
    all: {
      title: 'Tất cả EXIF',
      icon: '📋',
      fields: [] // Sẽ được populate động từ editedData
    },
    device: {
      title: 'Thông tin thiết bị',
      icon: '📱',
      fields: ['Make', 'Model', 'Software', 'LensModel', 'LensMake', 'SerialNumber', 'BodySerialNumber', 'LensSerialNumber', 'CameraOwnerName']
    },
    camera: {
      title: 'Cài đặt Camera',
      icon: '📷',
      fields: [
        'FNumber', 'ExposureTime', 'ISO', 'ISOSpeedRatings', 'FocalLength', 'FocalLengthIn35mmFormat',
        'WhiteBalance', 'Flash', 'FlashEnergy', 'MeteringMode', 'ExposureProgram', 'ExposureMode',
        'ExposureBiasValue', 'MaxApertureValue', 'SubjectDistance', 'LightSource',
        'FocalPlaneXResolution', 'FocalPlaneYResolution', 'SensingMethod', 'SceneType',
        'CustomRendered', 'DigitalZoomRatio', 'SceneCaptureType', 'GainControl',
        'Contrast', 'Saturation', 'Sharpness', 'SubjectDistanceRange'
      ]
    },
    datetime: {
      title: 'Ngày giờ',
      icon: '🕐',
      fields: [
        'DateTime', 'DateTimeOriginal', 'DateTimeDigitized', 'ModifyDate', 'CreateDate',
        'OffsetTime', 'OffsetTimeOriginal', 'OffsetTimeDigitized',
        'SubSecTime', 'SubSecTimeOriginal', 'SubSecTimeDigitized'
      ]
    },
    gps: {
      title: 'Vị trí GPS',
      icon: '📍',
      fields: [
        'GPSLatitude', 'GPSLongitude', 'GPSAltitude',
        'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSAltitudeRef',
        'GPSDateTime', 'GPSDateStamp', 'GPSTimeStamp',
        'GPSSpeed', 'GPSSpeedRef', 'GPSTrack', 'GPSTrackRef',
        'GPSImgDirection', 'GPSImgDirectionRef', 'GPSDestBearing', 'GPSDestBearingRef',
        'GPSMapDatum', 'GPSProcessingMethod', 'GPSAreaInformation'
      ]
    },
    other: {
      title: 'Thông tin khác',
      icon: '📋',
      fields: [
        'Copyright', 'Artist', 'ImageDescription', 'UserComment', 'ColorSpace', 'Orientation',
        'ImageWidth', 'ImageHeight', 'BitsPerSample', 'Compression', 'XResolution', 'YResolution',
        'ResolutionUnit', 'PixelXDimension', 'PixelYDimension', 'ExifVersion', 'FlashpixVersion'
      ]
    }
  };

  // Các trường có thể chỉnh sửa - EXPAND để cover các trường quan trọng
  const editableFields = [
    // Device
    'Make', 'Model', 'Software', 'LensModel', 'LensMake', 'SerialNumber', 'BodySerialNumber', 'LensSerialNumber', 'CameraOwnerName',
    // DateTime
    'DateTime', 'DateTimeOriginal', 'DateTimeDigitized', 'ModifyDate', 'CreateDate',
    'OffsetTime', 'OffsetTimeOriginal', 'OffsetTimeDigitized',
    // GPS
    'GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSAltitudeRef',
    'GPSDateTime', 'GPSDateStamp', 'GPSTimeStamp',
    // Camera
    'FNumber', 'ExposureTime', 'ISO', 'ISOSpeedRatings', 'FocalLength', 'WhiteBalance', 'Flash',
    'MeteringMode', 'ExposureProgram', 'ExposureMode', 'ExposureBiasValue',
    // Other
    'Copyright', 'Artist', 'ImageDescription', 'UserComment', 'Orientation'
  ];

  useEffect(() => {
    if (imageFile) {
      readExifData(imageFile);
    }
  }, [imageFile]);

  const readExifData = async (file) => {
    try {
      setLoading(true);
      const tags = await ExifReader.load(file);
      
      // **PRESERVE MakerNote** - Lưu MakerNote gốc để không bị mất khi export
      if (tags.MakerNote) {
        setOriginalMakerNote(tags.MakerNote);
        console.log('✓ MakerNote preserved:', tags.MakerNote.description?.slice(0, 100) + '...');
      }
      
      // Chuyển đổi tags sang format dễ đọc
      const formattedData = {};
      Object.keys(tags).forEach(key => {
        const tag = tags[key];
        if (tag && tag.description !== undefined) {
          formattedData[key] = {
            value: tag.description,
            raw: tag.value
          };
        }
      });

      setExifData(formattedData);
      
      // Khởi tạo editedData = TEMPLATE + data từ file
      const initialEditData = { ...EXIF_TEMPLATE }; // Start với template đầy đủ
      
      // Merge data từ file vào template
      Object.keys(formattedData).forEach(field => {
        let value = formattedData[field].value;
        
        // NORMALIZE các giá trị về format chuẩn
        // GPSLatitudeRef: "North latitude" → "N"
        if (field === 'GPSLatitudeRef') {
          const v = String(value).toUpperCase();
          if (v.includes('N') || v.includes('NORTH')) value = 'N';
          else if (v.includes('S') || v.includes('SOUTH')) value = 'S';
        }
        
        // GPSLongitudeRef: "West longitude" → "W"
        if (field === 'GPSLongitudeRef') {
          const v = String(value).toUpperCase();
          if (v.includes('W') || v.includes('WEST')) value = 'W';
          else if (v.includes('E') || v.includes('EAST')) value = 'E';
        }
        
        // GPSAltitudeRef: "Sea level" → "0"
        if (field === 'GPSAltitudeRef') {
          const v = String(value).toLowerCase();
          if (v.includes('above') || v.includes('sea level') || v === '0') value = '0';
          else if (v.includes('below') || v === '1') value = '1';
        }
        
        // Orientation: "Horizontal (normal)" → "1"
        if (field === 'Orientation') {
          const v = String(value).toLowerCase();
          if (v.includes('horizontal') || v.includes('top-left') || v === '1') value = '1';
          else if (v.includes('180') || v === '3') value = '3';
          else if (v.includes('90') || v === '6') value = '6';
          else if (v.includes('270') || v === '8') value = '8';
        }
        
        initialEditData[field] = value;
      });
      
      // AUTO-CONVERT GPS: Nếu có Ref = W hoặc S, thêm dấu âm
      if (initialEditData.GPSLatitude && initialEditData.GPSLatitudeRef) {
        const lat = parseFloat(initialEditData.GPSLatitude);
        if (!isNaN(lat)) {
          // Normalize Ref trước
          const ref = String(initialEditData.GPSLatitudeRef).toUpperCase();
          initialEditData.GPSLatitudeRef = ref.includes('S') ? 'S' : 'N';
          
          // Convert số âm nếu South
          if (initialEditData.GPSLatitudeRef === 'S' && lat > 0) {
            initialEditData.GPSLatitude = String(-lat);
            console.log('GPS Latitude converted: S → negative', initialEditData.GPSLatitude);
          } else if (initialEditData.GPSLatitudeRef === 'N' && lat < 0) {
            initialEditData.GPSLatitude = String(Math.abs(lat));
            console.log('GPS Latitude converted: N → positive', initialEditData.GPSLatitude);
          }
        }
      }
      
      if (initialEditData.GPSLongitude && initialEditData.GPSLongitudeRef) {
        const lon = parseFloat(initialEditData.GPSLongitude);
        if (!isNaN(lon)) {
          // Normalize Ref trước
          const ref = String(initialEditData.GPSLongitudeRef).toUpperCase();
          initialEditData.GPSLongitudeRef = ref.includes('W') ? 'W' : 'E';
          
          // Convert số âm nếu West
          if (initialEditData.GPSLongitudeRef === 'W' && lon > 0) {
            initialEditData.GPSLongitude = String(-lon);
            console.log('GPS Longitude converted: W → negative', initialEditData.GPSLongitude);
          } else if (initialEditData.GPSLongitudeRef === 'E' && lon < 0) {
            initialEditData.GPSLongitude = String(Math.abs(lon));
            console.log('GPS Longitude converted: E → positive', initialEditData.GPSLongitude);
          }
        }
      }
      
      setEditedData(initialEditData);
      
      console.log('Total EXIF fields in template:', Object.keys(EXIF_TEMPLATE).length);
      console.log('Fields read from file:', Object.keys(formattedData).length);
      console.log('Total editedData fields:', Object.keys(initialEditData).length);
    } catch (error) {
      console.error('Error reading EXIF:', error);
      toast.error('Lỗi khi đọc EXIF data. File có thể không chứa EXIF hoặc định dạng không hỗ trợ.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    // XỬ LÝ ĐẶC BIỆT CHO GPS COORDINATES
    if (field === 'GPSLongitude') {
      const lon = parseFloat(value);
      if (!isNaN(lon)) {
        // Tự động set Ref dựa trên dấu
        const newRef = lon < 0 ? 'W' : 'E';
        setEditedData(prev => ({
          ...prev,
          [field]: value, // Giữ nguyên giá trị user nhập (bao gồm cả âm)
          'GPSLongitudeRef': newRef
        }));
        setShowValidation(false);
        return;
      }
    }

    if (field === 'GPSLatitude') {
      const lat = parseFloat(value);
      if (!isNaN(lat)) {
        // Tự động set Ref dựa trên dấu
        const newRef = lat < 0 ? 'S' : 'N';
        setEditedData(prev => ({
          ...prev,
          [field]: value, // Giữ nguyên giá trị user nhập (bao gồm cả âm)
          'GPSLatitudeRef': newRef
        }));
        setShowValidation(false);
        return;
      }
    }

    // Nếu user thay đổi Ref, tự động điều chỉnh dấu của số
    if (field === 'GPSLongitudeRef') {
      const currentLon = parseFloat(editedData.GPSLongitude);
      if (!isNaN(currentLon)) {
        let newLon = currentLon;
        // value = 'W' → lon phải âm
        // value = 'E' → lon phải dương
        if (value === 'W' && currentLon > 0) {
          newLon = -Math.abs(currentLon);
        } else if (value === 'E' && currentLon < 0) {
          newLon = Math.abs(currentLon);
        }
        setEditedData(prev => ({
          ...prev,
          [field]: value,
          'GPSLongitude': String(newLon)
        }));
        setShowValidation(false);
        return;
      }
    }

    if (field === 'GPSLatitudeRef') {
      const currentLat = parseFloat(editedData.GPSLatitude);
      if (!isNaN(currentLat)) {
        let newLat = currentLat;
        // value = 'S' → lat phải âm
        // value = 'N' → lat phải dương
        if (value === 'S' && currentLat > 0) {
          newLat = -Math.abs(currentLat);
        } else if (value === 'N' && currentLat < 0) {
          newLat = Math.abs(currentLat);
        }
        setEditedData(prev => ({
          ...prev,
          [field]: value,
          'GPSLatitude': String(newLat)
        }));
        setShowValidation(false);
        return;
      }
    }

    // Default: chỉ set field được thay đổi
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
    setShowValidation(false); // Reset validation khi có thay đổi
  };

  // ========== LEGIT MODE HANDLERS ==========
  
  const handleDeviceSelect = (deviceName) => {
    const profile = getDeviceProfile(deviceName);
    if (!profile) {
      toast.error('Không tìm thấy profile thiết bị!');
      return;
    }

    // Apply device metadata (overwrite all fields)
    const newData = { ...profile.metadata };
    
    // Preserve GPS and DateTime if already set
    const preserveFields = [
      'GPSLatitude', 'GPSLongitude', 'GPSAltitude',
      'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSAltitudeRef',
      'DateTime', 'DateTimeOriginal', 'DateTimeDigitized'
    ];

    preserveFields.forEach(field => {
      if (editedData[field]) {
        newData[field] = editedData[field];
      }
    });

    setEditedData(newData);
    setSelectedDevice(deviceName);
    setShowDeviceSelector(false);
    setLegitMode(true); // Auto enable Legit Mode
    
    toast.success(`✓ Đã load metadata từ ${deviceName}!`);
  };

  const toggleLegitMode = () => {
    if (!legitMode && !selectedDevice) {
      toast.error('Vui lòng chọn thiết bị trước!');
      setShowDeviceSelector(true);
      return;
    }
    setLegitMode(!legitMode);
    
    if (!legitMode) {
      toast.success('🔒 Legit Mode: ON - Chỉ có thể sửa GPS và Thời gian');
    } else {
      toast.info('🔓 Legit Mode: OFF - Có thể sửa tất cả');
    }
  };

  const isFieldEditable = (field) => {
    if (!legitMode) return true;
    return LEGIT_MODE_EDITABLE_FIELDS.includes(field);
  };

  const clearDeviceProfile = () => {
    setSelectedDevice(null);
    setLegitMode(false);
    toast.info('Đã xóa device profile');
  };

  // ===========================================
  // TIMEZONE CALCULATOR
  // ===========================================
  
  const isDST = (date) => {
    // Check if date is in Daylight Saving Time (March - November)
    const month = date.getMonth();
    return month >= 2 && month <= 10; // March (2) to November (10)
  };

  const applyTimezone = () => {
    if (!baseDateTime) {
      toast.error('Vui lòng chọn ngày giờ!');
      return;
    }

    const tz = US_TIMEZONES[selectedTimezone];
    if (!tz) {
      toast.error('Timezone không hợp lệ!');
      return;
    }

    try {
      // Parse base datetime (user input in LOCAL time)
      const baseDate = new Date(baseDateTime);
      
      // Calculate offset (DST aware)
      const offset = isDST(baseDate) ? tz.dstOffset : tz.offset;
      const offsetString = offset >= 0 ? `+${String(offset).padStart(2, '0')}:00` : `${offset}:00`;
      
      // Format datetime cho EXIF: "YYYY:MM:DD HH:MM:SS"
      const year = baseDate.getFullYear();
      const month = String(baseDate.getMonth() + 1).padStart(2, '0');
      const day = String(baseDate.getDate()).padStart(2, '0');
      const hours = String(baseDate.getHours()).padStart(2, '0');
      const minutes = String(baseDate.getMinutes()).padStart(2, '0');
      const seconds = String(baseDate.getSeconds()).padStart(2, '0');
      
      const exifDateTime = `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
      const subsec = String(Math.floor(Math.random() * 1000)).padStart(3, '0'); // Random subseconds
      
      // Update tất cả datetime fields
      setEditedData(prev => ({
        ...prev,
        'DateTime': exifDateTime,
        'DateTimeOriginal': exifDateTime,
        'DateTimeDigitized': exifDateTime,
        'ModifyDate': exifDateTime,
        'CreateDate': exifDateTime,
        'OffsetTime': offsetString,
        'OffsetTimeOriginal': offsetString,
        'OffsetTimeDigitized': offsetString,
        'SubSecTime': subsec,
        'SubSecTimeOriginal': subsec,
        'SubSecTimeDigitized': subsec,
        'GPSDateStamp': `${year}:${month}:${day}`,
        'GPSTimeStamp': `${hours}:${minutes}:${seconds}`
      }));
      
      setShowTimezoneCalc(false);
      toast.success(`✓ Đã áp dụng thời gian ${tz.name} (${offsetString})`);
    } catch (error) {
      console.error('Timezone calculation error:', error);
      toast.error('Lỗi khi tính toán thời gian!');
    }
  };

  // ===========================================

  const validateExifData = () => {
    const results = [];

    // Kiểm tra Make và Model
    if (editedData.Make && editedData.Model) {
      const make = editedData.Make.toLowerCase();
      const model = editedData.Model.toLowerCase();
      
      const brandModels = {
        'canon': ['eos', '5d', '6d', '7d', '80d', '90d', 'r5', 'r6'],
        'nikon': ['d', 'z'],
        'sony': ['alpha', 'a7', 'a6', 'rx'],
        'fujifilm': ['x-t', 'x-pro', 'x-e', 'x-h'],
        'olympus': ['om-d', 'pen'],
        'panasonic': ['lumix', 'gh', 'g']
      };

      let isValidBrand = false;
      for (const [brand, models] of Object.entries(brandModels)) {
        if (make.includes(brand)) {
          isValidBrand = models.some(m => model.includes(m));
          break;
        }
      }

      results.push({
        field: 'Make/Model',
        status: isValidBrand,
        message: isValidBrand 
          ? `✓ Model ${editedData.Model} phù hợp với hãng ${editedData.Make}`
          : `⚠️ Model ${editedData.Model} có thể không phù hợp với hãng ${editedData.Make}`
      });
    }

    // Kiểm tra Software
    if (editedData.Software && editedData.Model) {
      const software = editedData.Software.toLowerCase();
      const validSoftware = ['firmware', 'ver', 'v', editedData.Make?.toLowerCase()];
      const isValidSoftware = validSoftware.some(s => software.includes(s));
      
      results.push({
        field: 'Software',
        status: isValidSoftware,
        message: isValidSoftware
          ? `✓ Software phù hợp`
          : `⚠️ Software có thể không chính xác`
      });
    }

    // Kiểm tra GPS coordinates
    if (editedData.GPSLatitude || editedData.GPSLongitude) {
      const lat = parseFloat(editedData.GPSLatitude);
      const lon = parseFloat(editedData.GPSLongitude);
      
      const isValidGPS = !isNaN(lat) && !isNaN(lon) && 
                        lat >= -90 && lat <= 90 && 
                        lon >= -180 && lon <= 180;
      
      results.push({
        field: 'GPS Coordinates',
        status: isValidGPS,
        message: isValidGPS
          ? `✓ Tọa độ GPS hợp lệ (${lat}, ${lon})`
          : `❌ Tọa độ GPS không hợp lệ`
      });
    }

    // Kiểm tra FNumber
    if (editedData.FNumber) {
      const fNumber = parseFloat(editedData.FNumber.toString().replace('f/', ''));
      const isValidFNumber = !isNaN(fNumber) && fNumber >= 1.0 && fNumber <= 32;
      
      results.push({
        field: 'FNumber',
        status: isValidFNumber,
        message: isValidFNumber
          ? `✓ F-number hợp lệ (f/${fNumber})`
          : `❌ F-number ngoài phạm vi thông thường (1.0-32)`
      });
    }

    // Kiểm tra ISO
    if (editedData.ISO) {
      const iso = parseInt(editedData.ISO);
      const isValidISO = !isNaN(iso) && iso >= 50 && iso <= 102400;
      
      results.push({
        field: 'ISO',
        status: isValidISO,
        message: isValidISO
          ? `✓ ISO hợp lệ (${iso})`
          : `❌ ISO ngoài phạm vi thông thường (50-102400)`
      });
    }

    // Kiểm tra DateTime consistency
    if (editedData.DateTime && editedData.DateTimeOriginal) {
      const dateTime = new Date(editedData.DateTime);
      const dateTimeOrig = new Date(editedData.DateTimeOriginal);
      
      const timeDiff = Math.abs(dateTime - dateTimeOrig) / 1000 / 60; // phút
      const isConsistent = timeDiff < 1440; // trong vòng 1 ngày
      
      results.push({
        field: 'DateTime Consistency',
        status: isConsistent,
        message: isConsistent
          ? `✓ Thời gian nhất quán`
          : `⚠️ Chênh lệch thời gian giữa DateTime và DateTimeOriginal > 1 ngày`
      });
    }

    // ==================== CRITICAL FIELDS - QUAN TRỌNG ĐỂ CHỨNG MINH ẢNH THẬT ====================
    
    // 1. MakerNote - TUYỆT ĐỐI QUAN TRỌNG
    if (exifData?.MakerNote) {
      const hasMakerNote = editedData.MakerNote && editedData.MakerNote !== '';
      results.push({
        field: '⚠️ MakerNote (CRITICAL)',
        status: hasMakerNote,
        message: hasMakerNote
          ? `✓ MakerNote CÓ - Ảnh có dữ liệu RAW từ nhà sản xuất`
          : `❌ CẢNH BÁO: MakerNote BỊ XÓA - Ảnh đã bị chỉnh sửa bởi phần mềm!`
      });
    }

    // 2. LensModel - Quan trọng để chứng minh phần cứng
    if (editedData.Make && editedData.Model) {
      const hasLensModel = editedData.LensModel && editedData.LensModel !== '';
      const make = editedData.Make.toLowerCase();
      
      // iPhone luôn có LensModel chi tiết
      if (make.includes('apple') || make.includes('iphone')) {
        const isValidLens = hasLensModel && editedData.LensModel.toLowerCase().includes('iphone');
        results.push({
          field: '⚠️ LensModel (iPhone)',
          status: isValidLens,
          message: isValidLens
            ? `✓ LensModel iPhone hợp lệ: ${editedData.LensModel}`
            : `❌ CẢNH BÁO: iPhone PHẢI có LensModel chi tiết!`
        });
      } else if (hasLensModel) {
        results.push({
          field: 'LensModel',
          status: true,
          message: `✓ LensModel: ${editedData.LensModel}`
        });
      }
    }

    // 3. SceneType - Cần giữ nguyên
    if (editedData.SceneType) {
      results.push({
        field: 'SceneType',
        status: true,
        message: `✓ SceneType: ${editedData.SceneType} (Giữ nguyên)`
      });
    }

    // 4. SensingMethod - Cần giữ nguyên
    if (editedData.SensingMethod) {
      results.push({
        field: 'SensingMethod',
        status: true,
        message: `✓ SensingMethod: ${editedData.SensingMethod} (Giữ nguyên)`
      });
    }

    // 5. Optical Parameters - FocalLength, FNumber phải hợp lý
    if (editedData.FocalLength && editedData.FNumber) {
      const focal = parseFloat(editedData.FocalLength);
      const fnum = parseFloat(editedData.FNumber.toString().replace('f/', ''));
      
      if (!isNaN(focal) && !isNaN(fnum)) {
        results.push({
          field: 'Optical Parameters',
          status: true,
          message: `✓ Thông số quang học: ${focal}mm f/${fnum} (Chứng minh ống kính vật lý)`
        });
      }
    }

    setValidationResults(results);
    setShowValidation(true);
  };

  const handleApplyChanges = async () => {
    // Validate trước khi apply
    validateExifData();
    
    // Show loading state
    setLoading(true);
    
    try {
      // Gọi callback để lưu
      if (onSave) {
        await onSave(editedData);
      }
    } catch (error) {
      toast.error('Lỗi khi lưu EXIF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // === EXIF Profile Management ===
  
  const clearAllExif = async () => {
    if (!window.confirm('⚠️ XÓA TRẮNG TẤT CẢ EXIF?\n\nThao tác này sẽ xóa TOÀN BỘ metadata, ảnh sẽ không còn thông tin gì!\n\nBạn có chắc chắn?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Reset về template rỗng hoàn toàn
      const emptyData = { ...EXIF_TEMPLATE };
      setEditedData(emptyData);
      
      // TỰ ĐỘNG APPLY VÀO ẢNH
      if (onSave) {
        await onSave(emptyData);
      }
      
      toast.success('✓ Đã xóa trắng TẤT CẢ EXIF và lưu vào ảnh!', 3000);
      console.log('EXIF cleared and saved - all 120 fields empty');
    } catch (error) {
      toast.error('Lỗi khi xóa EXIF: ' + error.message);
      console.error('Clear EXIF error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const saveCurrentAsProfile = () => {
    if (!profileName.trim()) {
      toast.warning('Vui lòng nhập tên profile!');
      return;
    }

    const newProfile = {
      id: Date.now(),
      name: profileName.trim(),
      data: { ...editedData },
      createdAt: new Date().toISOString(),
      imageFileName: imageFile?.name || 'Unknown'
    };

    const updated = [...savedProfiles, newProfile];
    setSavedProfiles(updated);
    localStorage.setItem('exifProfiles', JSON.stringify(updated));
    
    setProfileName('');
    toast.success(`✓ Đã lưu profile "${newProfile.name}"`);
  };

  const loadProfile = (profile) => {
    if (!window.confirm(`Áp dụng profile "${profile.name}"?\n\nThao tác này sẽ ghi đè các thay đổi hiện tại.`)) {
      return;
    }

    // Load profile = RESET về template + apply profile data
    const freshData = { ...EXIF_TEMPLATE };
    Object.keys(profile.data).forEach(key => {
      freshData[key] = profile.data[key];
    });
    
    setEditedData(freshData);
    setShowProfileManager(false);
    toast.success(`✓ Đã load profile "${profile.name}" (${Object.keys(freshData).length} fields)`, 3000);
  };

  const deleteProfile = (profileId) => {
    if (!window.confirm('Xóa profile này?')) return;

    const updated = savedProfiles.filter(p => p.id !== profileId);
    setSavedProfiles(updated);
    localStorage.setItem('exifProfiles', JSON.stringify(updated));
    toast.success('✓ Đã xóa profile');
  };

  const exportProfileToJson = (profile) => {
    try {
      const json = JSON.stringify(profile.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exif-profile-${profile.name.replace(/\s+/g, '-')}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`✓ Đã export profile: ${profile.name}`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Lỗi khi export: ' + err.message);
    }
  };

  const exportCurrentToJson = () => {
    try {
      const json = JSON.stringify(editedData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exif-data-${Date.now()}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('✓ Đã export EXIF data (ALL fields)');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Lỗi khi export: ' + err.message);
    }
  };

  const exportCurrentToJsonNonEmpty = () => {
    try {
      // Filter CHỈ fields có data (không rỗng)
      const nonEmpty = {};
      Object.keys(editedData).forEach(key => {
        if (editedData[key] && editedData[key] !== '') {
          nonEmpty[key] = editedData[key];
        }
      });
      
      const json = JSON.stringify(nonEmpty, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exif-data-non-empty-${Date.now()}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`✓ Đã export ${Object.keys(nonEmpty).length} fields có dữ liệu`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Lỗi khi export: ' + err.message);
    }
  };

  const importFromJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Validate: phải là object
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('JSON phải là object với key-value pairs');
      }

      // Convert tất cả values sang string và normalize
      const normalized = {};
      Object.keys(parsed).forEach(key => {
        const value = parsed[key];
        
        // Convert sang string, giữ nguyên format
        if (value === null || value === undefined) {
          normalized[key] = '';
        } else if (typeof value === 'object') {
          normalized[key] = JSON.stringify(value);
        } else {
          // Giữ nguyên format số, không làm tròn
          // ⚠️ QUAN TRỌNG: String(value) giữ nguyên dấu âm!
          normalized[key] = String(value);
        }
      });

      console.log('=== NORMALIZE DEBUG ===');
      console.log('GPSLongitude từ JSON:', parsed.GPSLongitude, 'type:', typeof parsed.GPSLongitude);
      console.log('GPSLongitude sau normalize:', normalized.GPSLongitude, 'type:', typeof normalized.GPSLongitude);
      console.log('Artist từ JSON:', parsed.Artist, 'type:', typeof parsed.Artist, 'length:', parsed.Artist?.length);
      console.log('Artist sau normalize:', normalized.Artist, 'type:', typeof normalized.Artist, 'length:', normalized.Artist?.length);

      // Merge với editedData hiện tại (KHÔNG overwrite, chỉ add new)
      if (importMode === 'replace') {
        // Replace mode: RESET về template trống, sau đó apply JSON
        // Đảm bảo TẤT CẢ các trường được ghi đè (có trong JSON = giá trị mới, không có = rỗng)
        const freshData = { ...EXIF_TEMPLATE }; // Start từ template sạch (120 fields = '')
        
        // Apply JSON data vào template
        Object.keys(normalized).forEach(key => {
          freshData[key] = normalized[key]; // GHI ĐÈ HOÀN TOÀN
        });
        
        // Debug log
        console.log('=== REPLACE MODE ===');
        console.log('Template fields:', Object.keys(EXIF_TEMPLATE).length);
        console.log('JSON fields:', Object.keys(normalized).length);
        console.log('Fresh data fields:', Object.keys(freshData).length);
        console.log('Artist in JSON:', normalized.Artist);
        console.log('Artist in freshData:', freshData.Artist);
        console.log('UserComment in JSON:', normalized.UserComment);
        console.log('UserComment in freshData:', freshData.UserComment);
        console.log('GPSLongitude in JSON:', normalized.GPSLongitude);
        console.log('GPSLongitude in freshData:', freshData.GPSLongitude);
        
        // Force complete state reset - tạo object hoàn toàn mới
        setEditedData(() => ({ ...freshData })); // Function form để đảm bảo reset
        
        toast.success(`✓ Đã THAY THẾ toàn bộ với ${Object.keys(normalized).length} fields từ JSON (${Object.keys(freshData).length} total fields)`, 4000);
      } else {
        // Merge mode: giữ data cũ, CHỈ update fields có trong JSON
        setEditedData(prev => ({
          ...prev,
          ...normalized
        }));
        toast.success(`✓ Đã MERGE ${Object.keys(normalized).length} fields từ JSON`, 3000);
      }

      setJsonInput('');
      setShowJsonImport(false);
      setImportMode('merge'); // Reset về default
      
      // Log để debug
      console.log('Import mode:', importMode);
      console.log('Imported fields:', Object.keys(normalized));
      console.log('Total editedData fields after import:', Object.keys(normalized).length);
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Lỗi khi parse JSON: ${error.message}`);
    }
  };

  const viewProfileJson = (profile) => {
    // Hiển thị FULL profile info, không chỉ data
    setJsonViewerData({
      title: `Profile: ${profile.name}`,
      data: {
        profileInfo: {
          id: profile.id,
          name: profile.name,
          createdAt: profile.createdAt,
          imageFileName: profile.imageFileName,
          totalFields: Object.keys(profile.data).length
        },
        exifData: profile.data
      },
      isFullProfile: true
    });
    setShowJsonViewer(true);
  };

  const viewCurrentJson = () => {
    setJsonViewerData({
      title: 'EXIF Data hiện tại',
      data: editedData,
      isFullProfile: false
    });
    setShowJsonViewer(true);
  };

  const copyJsonToClipboard = () => {
    const json = JSON.stringify(jsonViewerData.data, null, 2);
    navigator.clipboard.writeText(json);
    toast.success('✓ Đã copy JSON', 2000);
  };

  const renderFieldsByGroup = (group) => {
    let fieldsToRender;
    
    // Nếu là tab "all", hiển thị TẤT CẢ fields trong editedData (bao gồm cả rỗng)
    if (group === 'all') {
      if (!editedData) return null;
      fieldsToRender = Object.keys(editedData).sort(); // Hiển thị TẤT CẢ, sort alphabetically
    } else {
      fieldsToRender = exifGroups[group].fields;
    }
    
    // Filter theo search term
    if (searchTerm) {
      fieldsToRender = fieldsToRender.filter(field => {
        const fieldName = field.toLowerCase();
        const fieldValue = String(editedData[field] || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return fieldName.includes(searchLower) || fieldValue.includes(searchLower);
      });
    }
    
    if (fieldsToRender.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>Không tìm thấy field nào phù hợp</p>
        </div>
      );
    }
    
    return fieldsToRender.map(field => {
      const isEditable = editableFields.includes(field);
      const currentValue = editedData[field] !== undefined ? editedData[field] : '';
      const isEmpty = !currentValue || currentValue === '';
      
      // Để debug, hiển thị cả raw value nếu có
      const rawValue = exifData?.[field]?.raw;
      const hasRawValue = rawValue !== undefined && rawValue !== currentValue;

      // Xác định nếu field cần dropdown thay vì input text
      const needsDropdown = ['GPSLatitudeRef', 'GPSLongitudeRef', 'GPSAltitudeRef', 'Orientation'].includes(field);
      
      let dropdownOptions = [];
      if (field === 'GPSLatitudeRef') dropdownOptions = ['', 'N', 'S'];
      if (field === 'GPSLongitudeRef') dropdownOptions = ['', 'E', 'W'];
      if (field === 'GPSAltitudeRef') dropdownOptions = ['', '0', '1'];
      if (field === 'Orientation') dropdownOptions = ['', '1', '3', '6', '8'];

      // Check if field is editable in Legit Mode
      const fieldIsEditable = isFieldEditable(field);
      const isLocked = !fieldIsEditable;

      return (
        <div key={field} className={`grid grid-cols-3 gap-4 py-2 border-b border-gray-100 ${isEmpty ? 'bg-gray-50' : ''} ${isLocked ? 'bg-amber-50/30' : ''}`}>
          <div className="font-medium text-gray-700 text-sm break-words flex items-center">
            {field}
            {isEmpty && <span className="ml-2 text-xs text-gray-400">(rỗng)</span>}
            {isLocked && <span className="ml-2 text-xs text-amber-600" title="Khóa trong Legit Mode">🔒</span>}
          </div>
          <div className="col-span-2">
            {isEditable ? (
              needsDropdown ? (
                <select
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  disabled={isLocked}
                  className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLocked 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' 
                      : isEmpty ? 'border-gray-300 bg-white' : 'border-blue-300'
                  }`}
                >
                  {dropdownOptions.map(opt => (
                    <option key={opt} value={opt}>
                      {opt === '' ? '(Chọn...)' : 
                       field === 'Orientation' ? 
                         (opt === '1' ? '1 - Normal' : 
                          opt === '3' ? '3 - Rotate 180°' : 
                          opt === '6' ? '6 - Rotate 90° CW' : 
                          opt === '8' ? '8 - Rotate 270° CW' : opt) :
                       field === 'GPSAltitudeRef' ?
                         (opt === '0' ? '0 - Above sea level' : '1 - Below sea level') :
                       field === 'GPSLatitudeRef' ?
                         (opt === 'N' ? 'N - North' : 'S - South') :
                       field === 'GPSLongitudeRef' ?
                         (opt === 'E' ? 'E - East' : 'W - West') :
                       opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  disabled={isLocked}
                  className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLocked 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' 
                      : isEmpty ? 'border-gray-300 bg-white' : 'border-blue-300'
                  }`}
                  placeholder={isLocked ? '🔒 Khóa trong Legit Mode' : `Nhập ${field}...`}
                />
              )
            ) : (
              <div>
                <div className={`text-sm px-3 py-1 rounded break-words ${
                  isEmpty ? 'text-gray-400 bg-gray-100 italic' : 'text-gray-600 bg-gray-50'
                }`}>
                  {currentValue || '(Không có dữ liệu)'}
                </div>
                {hasRawValue && (
                  <div className="text-xs text-gray-400 mt-1 px-3">
                    Raw: {String(rawValue)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <div className="text-xl font-semibold mb-2">Đang đọc EXIF data...</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📸</span>
            <div>
              <h2 className="text-2xl font-bold">EXIF Editor</h2>
              <p className="text-sm text-blue-100">Quản lý metadata hình ảnh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold transition"
          >
            ×
          </button>
        </div>

        {/* Legit Mode & Device Selector Bar */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-green-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Device Quick Selector */}
              <button
                onClick={() => setShowDeviceSelector(!showDeviceSelector)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition font-medium"
              >
                <span className="text-xl">📱</span>
                <span>{selectedDevice || 'Chọn thiết bị'}</span>
                <span className="text-xs">▼</span>
              </button>

              {/* Legit Mode Toggle */}
              {selectedDevice && (
                <button
                  onClick={toggleLegitMode}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                    legitMode
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span>{legitMode ? '🔒' : '🔓'}</span>
                  <span>Legit Mode</span>
                  <span className="text-xs">{legitMode ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {selectedDevice && (
                <button
                  onClick={clearDeviceProfile}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                  title="Xóa device profile"
                >
                  ✕ Xóa
                </button>
              )}
            </div>

            {legitMode && (
              <div className="flex flex-col space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-700 font-semibold">🔒 Legit Mode:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">📍 GPS</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">🕐 Thời gian</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">👤 Thông tin</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">⭐ Tùy chọn</span>
                </div>
                <div className="text-xs text-gray-600 italic">
                  🔐 Metadata hệ thống (Make, Model, Lens, ISO, v.v.) đã bị khóa để đảm bảo độ chân thật
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device Selector Dropdown */}
        {showDeviceSelector && (
          <div className="absolute top-32 left-6 z-50 bg-white rounded-lg shadow-2xl border-2 border-green-600 w-[600px] max-h-[500px] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-lg">📱 Chọn thiết bị</h3>
              <button
                onClick={() => setShowDeviceSelector(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {DEVICE_CATEGORIES.map(category => {
                const devices = getDevicesByCategory(category);
                if (devices.length === 0) return null;

                return (
                  <div key={category} className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center space-x-2">
                      <span>{devices[0].icon}</span>
                      <span>{category}</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {devices.map(device => (
                        <button
                          key={device.name}
                          onClick={() => handleDeviceSelect(device.name)}
                          className={`text-left px-3 py-2 rounded border-2 transition ${
                            selectedDevice === device.name
                              ? 'border-green-600 bg-green-50 text-green-700'
                              : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                          }`}
                        >
                          <div className="font-medium text-sm">{device.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {device.metadata.Model || device.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 px-4 py-3 text-sm">
              <div className="font-semibold text-blue-900 mb-2">💡 Legit Mode - Chế độ chân thực 100%</div>
              <div className="text-xs text-gray-700 space-y-1">
                <div>✅ <strong>Có thể sửa:</strong> GPS Location, Date/Time, Thông tin cá nhân (Artist, Copyright, Description, v.v.)</div>
                <div>🔒 <strong>Bị khóa:</strong> Make, Model, Lens, ISO, Aperture, Exposure, Resolution... (metadata hệ thống)</div>
                <div>🎯 <strong>Mục đích:</strong> Đảm bảo ảnh có metadata trông như chụp thật từ thiết bị đó, chỉ thay đổi vị trí/thời gian</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto flex">
          {/* Left: Image Preview */}
          <div className="w-1/3 bg-gray-100 p-6 flex flex-col">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Preview</h3>
            <div className="flex-1 flex items-center justify-center bg-white rounded-lg overflow-hidden shadow-md">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 text-6xl">🖼️</div>
              )}
            </div>
            
            {/* Validation Results */}
            {showValidation && validationResults.length > 0 && (
              <div className="mt-4 bg-white rounded-lg p-4 shadow-md max-h-64 overflow-y-auto">
                <h4 className="font-bold text-sm mb-3 text-gray-800">Kết quả kiểm tra</h4>
                <div className="space-y-2">
                  {validationResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2 rounded ${
                        result.status
                          ? 'bg-green-50 text-green-800'
                          : 'bg-yellow-50 text-yellow-800'
                      }`}
                    >
                      <div className="font-semibold">{result.field}</div>
                      <div>{result.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: EXIF Data */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-6 overflow-x-auto">
              {Object.keys(exifGroups).map(group => {
                const count = group === 'all' && exifData 
                  ? Object.keys(exifData).length 
                  : null;
                
                return (
                  <button
                    key={group}
                    onClick={() => setActiveGroup(group)}
                    className={`px-4 py-3 font-medium text-sm transition whitespace-nowrap ${
                      activeGroup === group
                        ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="mr-2">{exifGroups[group].icon}</span>
                    {exifGroups[group].title}
                    {count && <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">({count})</span>}
                  </button>
                );
              })}
            </div>

            {/* Search Box - chỉ hiển thị khi tab "all" */}
            {activeGroup === 'all' && editedData && (
              <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                {/* Stats */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-gray-700">Tổng fields:</span>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
                      {Object.keys(editedData).length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-gray-700">Có dữ liệu:</span>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                      {Object.keys(editedData).filter(k => editedData[k] && editedData[k] !== '').length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-gray-700">Rỗng:</span>
                    <span className="bg-gray-400 text-white px-3 py-1 rounded-full font-bold">
                      {Object.keys(editedData).filter(k => !editedData[k] || editedData[k] === '').length}
                    </span>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Tìm kiếm field hoặc value..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="text-xs text-gray-500 mt-1">
                    Đang lọc: "{searchTerm}"
                  </div>
                )}
              </div>
            )}

            {/* Fields */}
            <div className="flex-1 overflow-y-auto p-6">
              {exifData ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  {renderFieldsByGroup(activeGroup)}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📋</div>
                  <p>Không có EXIF data</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              {/* Profile Quick Actions */}
              <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200">
                <button
                  onClick={() => setShowProfileManager(!showProfileManager)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition font-medium text-sm"
                >
                  💾 Profiles ({savedProfiles.length})
                </button>
                <button
                  onClick={() => setShowJsonImport(!showJsonImport)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium text-sm"
                >
                  📥 Import JSON
                </button>
                <button
                  onClick={viewCurrentJson}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium text-sm"
                >
                  👁️ Xem JSON
                </button>
                <div className="relative group">
                  <button
                    onClick={() => setShowTimezoneCalc(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium text-sm"
                  >
                    🕐 Timezone Calculator
                  </button>
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Tự động tính DateTime theo múi giờ
                  </div>
                </div>
                <div className="relative group">
                  <button
                    onClick={exportCurrentToJson}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition font-medium text-sm"
                  >
                    📤 Export ALL
                  </button>
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Export tất cả 120 fields
                  </div>
                </div>
                <div className="relative group">
                  <button
                    onClick={exportCurrentToJsonNonEmpty}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition font-medium text-sm"
                  >
                    📤 Export Non-Empty
                  </button>
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Chỉ export fields có dữ liệu
                  </div>
                </div>
                <div className="relative group">
                  <button
                    onClick={clearAllExif}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium text-sm"
                  >
                    🗑️ Xóa trắng EXIF
                  </button>
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Xóa TẤT CẢ metadata (120 fields)
                  </div>
                </div>
              </div>

              {/* Main Actions */}
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    ⚠️ Lưu ý: Thay đổi GPS và DateTime có thể ảnh hưởng đến tính xác thực của ảnh
                  </div>
                  {originalMakerNote && preserveMakerNote && (
                    <div className="text-xs text-green-700 font-semibold">
                      ✓ MakerNote được bảo toàn - Ảnh sẽ giữ metadata gốc từ camera
                    </div>
                  )}
                  {!originalMakerNote && (
                    <div className="text-xs text-red-600 font-semibold">
                      ⚠️ CẢNH BÁO: Ảnh không có MakerNote - Có thể đã bị chỉnh sửa trước đó!
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={validateExifData}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition font-medium"
                  >
                    🔍 Kiểm tra tính nhất quán
                  </button>
                  <button
                    onClick={handleApplyChanges}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                  >
                    ✓ Áp dụng thay đổi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Manager Modal */}
        {showProfileManager && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="bg-purple-600 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">💾 EXIF Profiles Manager</h3>
                <button
                  onClick={() => setShowProfileManager(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {/* Save current as profile */}
                <div className="bg-purple-50 p-4 rounded-lg mb-6">
                  <h4 className="font-bold mb-3 text-gray-800">Lưu cấu hình hiện tại</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Nhập tên profile (ví dụ: Canon 5D Mark IV)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => e.key === 'Enter' && saveCurrentAsProfile()}
                    />
                    <button
                      onClick={saveCurrentAsProfile}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                    >
                      💾 Lưu
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Lưu tất cả {Object.keys(editedData).length} trường đã chỉnh sửa vào profile
                  </p>
                </div>

                {/* Saved profiles list */}
                <h4 className="font-bold mb-3 text-gray-800">Profiles đã lưu ({savedProfiles.length})</h4>
                {savedProfiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p>Chưa có profile nào</p>
                    <p className="text-sm mt-1">Chỉnh sửa EXIF và lưu lại để sử dụng sau</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedProfiles.map(profile => (
                      <div key={profile.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800">{profile.name}</h5>
                            <p className="text-xs text-gray-500">
                              {Object.keys(profile.data).length} fields • 
                              Từ: {profile.imageFileName} • 
                              {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => loadProfile(profile)}
                            className="flex-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
                          >
                            ✓ Áp dụng
                          </button>
                          <button
                            onClick={() => exportProfileToJson(profile)}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm"
                          >
                            📤 Export
                          </button>
                          <button
                            onClick={() => viewProfileJson(profile)}
                            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition text-sm"
                          >
                            👁️ Xem
                          </button>
                          <button
                            onClick={() => deleteProfile(profile.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* JSON Import Modal */}
        {showJsonImport && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">📥 Import EXIF từ JSON</h3>
                <button
                  onClick={() => setShowJsonImport(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 mb-3">
                  Paste JSON object với EXIF fields. Ví dụ:
                </p>
                <pre className="text-xs bg-gray-100 p-3 rounded mb-3 text-gray-700">
{`{
  "Make": "Canon",
  "Model": "Canon EOS 5D Mark IV",
  "ISO": "400",
  "FNumber": "f/2.8"
}`}
                </pre>
                
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste JSON here..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                />

                {/* Import Mode Selection */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Chế độ Import:</p>
                  <div className="flex space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="merge"
                        checked={importMode === 'merge'}
                        onChange={(e) => setImportMode(e.target.value)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        <span className="font-medium">Merge</span> - Giữ data cũ + thêm mới
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={(e) => setImportMode(e.target.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        <span className="font-medium">Replace</span> - Xóa hết, chỉ giữ JSON mới
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => setShowJsonImport(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={importFromJson}
                    disabled={!jsonInput.trim()}
                    className={`flex-1 px-4 py-2 rounded-md transition ${
                      jsonInput.trim()
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    📥 Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* JSON Viewer Modal */}
        {showJsonViewer && jsonViewerData && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📄</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{jsonViewerData.title}</h3>
                    <p className="text-sm text-indigo-100">
                      {jsonViewerData.isFullProfile 
                        ? `${jsonViewerData.data.profileInfo.totalFields} EXIF fields`
                        : `${Object.keys(jsonViewerData.data).length} fields`
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJsonViewer(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Profile Info (nếu là full profile) */}
              {jsonViewerData.isFullProfile && jsonViewerData.data.profileInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">📝 Tên Profile:</span>
                      <span className="ml-2 text-gray-900">{jsonViewerData.data.profileInfo.name}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">🆔 ID:</span>
                      <span className="ml-2 text-gray-600 font-mono text-xs">{jsonViewerData.data.profileInfo.id}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">📅 Ngày tạo:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(jsonViewerData.data.profileInfo.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">🖼️ File gốc:</span>
                      <span className="ml-2 text-gray-900">{jsonViewerData.data.profileInfo.imageFileName}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-semibold text-gray-700">📊 Số EXIF fields:</span>
                      <span className="ml-2 text-blue-600 font-bold">{jsonViewerData.data.profileInfo.totalFields}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* JSON Content */}
              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm font-mono leading-relaxed">
                  {JSON.stringify(jsonViewerData.data, null, 2)}
                </pre>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 px-6 py-4 bg-white rounded-b-lg flex space-x-3">
                <button
                  onClick={copyJsonToClipboard}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                >
                  📋 Copy Full JSON
                </button>
                <button
                  onClick={() => {
                    const json = JSON.stringify(jsonViewerData.data, null, 2);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${jsonViewerData.title.replace(/[^a-z0-9]/gi, '-')}.json`;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }, 100);
                    toast.success('✓ Đã download JSON');
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                >
                  📥 Download JSON
                </button>
                <button
                  onClick={() => setShowJsonViewer(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timezone Calculator Modal */}
        {showTimezoneCalc && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">🕐 Timezone Calculator</h3>
                  <p className="text-sm text-indigo-100">Tự động tính DateTime theo múi giờ US</p>
                </div>
                <button
                  onClick={() => setShowTimezoneCalc(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Current Time Display */}
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="text-sm font-semibold text-blue-900 mb-2">⏰ Thời gian hiện tại:</div>
                  <div className="text-2xl font-bold text-blue-700 font-mono">
                    {new Date().toLocaleString('en-US', { 
                      dateStyle: 'full', 
                      timeStyle: 'long',
                      timeZone: selectedTimezone 
                    })}
                  </div>
                </div>

                {/* DateTime Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Chọn ngày giờ (local time):
                  </label>
                  <input
                    type="datetime-local"
                    value={baseDateTime}
                    onChange={(e) => setBaseDateTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-mono"
                  />
                </div>

                {/* Timezone Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🌎 Chọn múi giờ US:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(US_TIMEZONES).map(([key, tz]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTimezone(key)}
                        className={`p-4 rounded-lg border-2 transition text-left ${
                          selectedTimezone === key
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="font-bold text-gray-800">{tz.name.split('(')[0].trim()}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          UTC{tz.offset >= 0 ? '+' : ''}{tz.offset} / DST: UTC{tz.dstOffset >= 0 ? '+' : ''}{tz.dstOffset}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {tz.cities.join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {baseDateTime && (
                  <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                    <div className="text-sm font-semibold text-green-900 mb-2">✓ Preview DateTime sẽ được set:</div>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-600">DateTime:</span>
                        <span className="font-bold text-gray-800">
                          {new Date(baseDateTime).toISOString().slice(0, 19).replace('T', ' ').replace(/-/g, ':')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timezone Offset:</span>
                        <span className="font-bold text-gray-800">
                          {(() => {
                            const tz = US_TIMEZONES[selectedTimezone];
                            const offset = isDST(new Date(baseDateTime)) ? tz.dstOffset : tz.offset;
                            return offset >= 0 ? `+${String(offset).padStart(2, '0')}:00` : `${offset}:00`;
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GPS DateStamp:</span>
                        <span className="font-bold text-gray-800">
                          {new Date(baseDateTime).toISOString().slice(0, 10).replace(/-/g, ':')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTimezoneCalc(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={applyTimezone}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
                >
                  ✓ Áp dụng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EXIFEditor;
