const db = require('_helpers/db');
const MongoClient = require('mongodb');

const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const config = require('config.json');

// connection
const conn = mongoose.createConnection(config.connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

// init gfs
let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });

  console.log("Mongodb database connection established successfully in gridfs !!");
});

// Storage
const storage = new GridFsStorage({
  url: config.connectionString,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        // const filename = buf.toString("hex") + path.extname(file.originalname);
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

module.exports = { deleteFile };

async function deleteFile(id) {
    
    gfs.delete(new mongoose.Types.ObjectId(id), (err, data) => { });
}
