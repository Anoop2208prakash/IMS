import multer from 'multer';
import path from 'path';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid overwrites
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Create the multer instance
const upload = multer({ storage: storage });

export default upload;