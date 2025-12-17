const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Profile Picture Storage Configuration
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kisaan-connect/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' }
    ]
  }
});

// Crop Image Storage Configuration
const cropStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kisaan-connect/crops',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  }
});

// Create multer upload instances
const uploadProfile = multer({ 
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadCrop = multer({ 
  storage: cropStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex !== -1) {
      // Get everything after 'upload/vX/' (version)
      const pathWithFile = urlParts.slice(uploadIndex + 2).join('/');
      // Remove file extension
      const publicId = pathWithFile.substring(0, pathWithFile.lastIndexOf('.'));
      
      await cloudinary.uploader.destroy(publicId);
      console.log('✅ Deleted image from Cloudinary:', publicId);
    }
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error);
  }
};

module.exports = {
  cloudinary,
  uploadProfile,
  uploadCrop,
  deleteImage
};
