// Initialize Google Cloud Storage

const { Storage } = require("@google-cloud/storage");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const storage = new Storage({
  keyFilename: path.join(__dirname, process.env.GOOGLE_CREDENTIALS_FILE),
  projectId: process.env.GOOGLE_PROJECT_ID,
});

const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME);

const uploadFileToBucket = async (file) => {
  const { originalname, buffer } = file;

  const blob = bucket.file(originalname);
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
  });

  return new Promise((resolve, reject) => {
    blobStream
      .on("finish", async () => {
        // Generate the public URL after the file is uploaded successfully
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      })
      .on("error", (err) => {
        reject(err);
      })
      .end(buffer);
  });
};

module.exports = { uploadFileToBucket };
