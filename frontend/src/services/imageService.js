import axiosInstance from '../lib/axiosInstance';

/**
 * Upload รูปภาพ
 * @param {File} file - ไฟล์รูปภาพ
 * @returns {Promise<Object>} { filename, imageUrl, message }
 */
export const uploadImage = async (file) => {
  try {
    // ตรวจสอบไฟล์
    if (!file) {
      throw new Error('Please select a file to upload');
    }

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // ตรวจสอบขนาดไฟล์ (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    // สร้าง FormData
    const formData = new FormData();
    formData.append('file', file);

    // Upload
    const response = await axiosInstance.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.response?.data?.error || error.message || 'ไม่สามารถอัปโหลดรูปภาพได้');
  }
};

/**
 * ลบรูปภาพ
 * @param {string} filename - ชื่อไฟล์
 * @returns {Promise<Object>}
 */
export const deleteImage = async (filename) => {
  try {
    const response = await axiosInstance.delete(`/images/${filename}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error(error.response?.data?.error || error.message || 'ไม่สามารถลบรูปภาพได้');
  }
};

/**
 * สร้าง URL สำหรับดูรูปภาพ
 * @param {string} filename - ชื่อไฟล์หรือ path
 * @returns {string}
 */
export const getImageUrl = (filename) => {
  if (!filename) return null;
  
  // ถ้ามี full URL อยู่แล้ว return เลย
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // ถ้าเป็น path ที่เริ่มด้วย /images/ ให้ใช้ backend base URL
  if (filename.startsWith('/images/')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const backendBaseUrl = baseURL.replace('/api', '');
    return `${backendBaseUrl}${filename}`;
  }
  
  // ถ้าเป็นแค่ชื่อไฟล์ ให้เพิ่ม path
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  const backendBaseUrl = baseURL.replace('/api', '');
  return `${backendBaseUrl}/images/events/${filename}`;
};

/**
 * ตรวจสอบว่ารูปภาพ load ได้หรือไม่
 * @param {string} url - URL ของรูปภาพ
 * @returns {Promise<boolean>}
 */
export const checkImageExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking image:', error);
    return false;
  }
};

/**
 * Compress รูปภาพก่อน upload
 * @param {File} file - ไฟล์รูปภาพ
 * @param {number} maxWidth - ความกว้างสูงสุด (default: 1920)
 * @param {number} maxHeight - ความสูงสูงสุด (default: 1080)
 * @param {number} quality - คุณภาพ 0-1 (default: 0.8)
 * @returns {Promise<File>}
 */
export const compressImage = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // ถ้าไม่ใช่ไฟล์รูปภาพ
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // คำนวณขนาดใหม่
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // สร้าง canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert เป็น blob
        canvas.toBlob(
          (blob) => {
            // สร้าง File object ใหม่
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Upload รูปภาพพร้อม compress
 * @param {File} file - ไฟล์รูปภาพ
 * @param {Object} options - { maxWidth, maxHeight, quality }
 * @returns {Promise<Object>}
 */
export const uploadImageWithCompression = async (file, options = {}) => {
  try {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8
    } = options;

    // Compress ก่อน
    const compressedFile = await compressImage(file, maxWidth, maxHeight, quality);
    
    console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Upload
    return await uploadImage(compressedFile);
  } catch (error) {
    console.error('Error uploading with compression:', error);
    throw error;
  }
};

/**
 * แสดง preview รูปภาพจากไฟล์
 * @param {File} file - ไฟล์รูปภาพ
 * @returns {Promise<string>} Data URL
 */
export const previewImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Validate ไฟล์รูปภาพ
 * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
 * @param {Object} options - { maxSize, allowedTypes }
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateImage = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  // ตรวจสอบว่ามีไฟล์หรือไม่
  if (!file) {
    return { valid: false, error: 'Please select a file' };
  }

  // ตรวจสอบประเภทไฟล์
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Only ${allowedTypes.join(', ')} files are allowed` 
    };
  }

  // ตรวจสอบขนาดไฟล์
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB` 
    };
  }

  return { valid: true, error: null };
};

/**
 * ดึงขนาดรูปภาพ
 * @param {File} file - ไฟล์รูปภาพ
 * @returns {Promise<Object>} { width, height }
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};
