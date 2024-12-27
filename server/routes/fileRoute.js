const express = require("express");
const multer = require("multer");
const { uploadFileToBucket } = require("../config/googleStorage");

const router = express.Router();

// Multer configuration to parse file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route for uploading files
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).send("No file uploaded");
  
      const fileUrl = await uploadFileToBucket(file);

  
      // Save the URL in the database (if needed)
      // Example: saveFileToDatabase(fileUrl);
  
      res.status(200).json({ fileUrl, message: "File uploaded successfully" });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Error uploading file" });
    }
  });
  

module.exports = router;
