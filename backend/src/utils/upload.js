const path = require('path');
const multer = require('multer');
const { randomUUID } = require('crypto'); // <- use built-in
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`; // <- same behavior as uuid.v4()
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (/^video\//.test(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 1024 } });

module.exports = upload;
