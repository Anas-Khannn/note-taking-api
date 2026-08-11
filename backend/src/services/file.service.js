const PROFILE_IMAGE_URL_PREFIX = "/uploads/profile";

class FileService {
  static getProfileImageUrl(uploadedFile) {
    if (
      !uploadedFile ||
      typeof uploadedFile.filename !== "string"
    ) {
      return undefined;
    }

    return `${PROFILE_IMAGE_URL_PREFIX}/${uploadedFile.filename}`;
  }
}

module.exports = FileService;
