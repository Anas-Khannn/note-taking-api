const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { BadRequestError } = require("../errors/app.error");

const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const EXTENSION_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const uploadDirectory = path.resolve(
  __dirname,
  "../../uploads/profile"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadDirectory);
  },
  filename(req, file, callback) {
    const extension =
      EXTENSION_BY_MIME[file.mimetype] || "";
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const profileUpload = multer({
  storage,
  limits: {
    fileSize: MAX_PROFILE_IMAGE_BYTES,
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      return callback(
        new BadRequestError(
          "Profile image must be a JPG, PNG, or WebP file"
        )
      );
    }
    callback(null, true);
  },
});

module.exports = {
  profileUpload,
  MAX_PROFILE_IMAGE_BYTES,
};
