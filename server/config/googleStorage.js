

// Initialize Google Cloud Storage


const { Storage } = require("@google-cloud/storage");
const path = require("path");

const storage = new Storage({
  keyFilename: path.join(__dirname, "/service-account-key.json"),
  projectId: "dogwood-terra-446009-m7",
});

const bucket = storage.bucket("my-spider-project");

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

  