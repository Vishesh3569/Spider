require("dotenv").config();
const { Storage } = require("@google-cloud/storage");
const path = require("path");

// Initialize Google Cloud Storage with environment variables
const storage = new Storage({
  keyFilename: path.resolve(__dirname, "../config", process.env.GOOGLE_CLOUD_KEYFILE),
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

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
