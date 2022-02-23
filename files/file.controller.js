﻿const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const {connectionString} = require('config');
const sharp = require('sharp');

// connection
const conn = mongoose.createConnection(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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
  url: connectionString,
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

const upload = multer({
  storage
});

// routes
router.get('/', getAll);
router.post("/upload", upload.single("file"), fileUpload);
router.post("/upload_multiple", upload.array("file"), fileUploadMultiple);
router.get("/files", files);
router.get("/files/:filename", fileByName);
router.get("/image/:filename", download);
router.get("/image/:filename/:width/:height", resizingImages);
router.get("/delete/:id", deleteFile);

module.exports = router;

// get / pages
function getAll(req, res, next) {
  if(!gfs) {
    console.log("some error occured, check connection to db");
    res.send("some error occured, check connection to db");
    process.exit(0);
  }
  gfs.find().toArray((err, files) => {
    // check if files
    if (!files || files.length === 0) {
      return res.render("index", {
        files: false
      });
    } else {
      const f = files
        .map(file => {
          if (
            file.contentType === "image/png" ||
            file.contentType === "image/jpeg"
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
          return file;
        })
        .sort((a, b) => {
          return (
            new Date(b["uploadDate"]).getTime() -
            new Date(a["uploadDate"]).getTime()
          );
        });

      return res.render("index", {
        files: f
      });
    }

    // return res.json(files);
  });
}

function fileUpload(req, res) {
    res.json({message : "success", file_id: req.file.id});
}

function fileUploadMultiple(req, res) {
    res.json({message : "success"})
    // res.json({file : req.file})
    // res.redirect("/");
}


function files(req, res, next ) {
  gfs.find().toArray((err, files) => {
    // check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "no files exist"
      });
    }

    return res.json(files);
  });
}

function fileByName(req, res, next ) {
  gfs.find(
    {
      filename: req.params.filename
    },
    (err, file) => {
      if (!file) {
        return res.status(404).json({
          err: "no files exist"
        });
      }

      return res.json(file);
    }
  );
}


function download (req, res, next) {
  // console.log('id', req.params.id)
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray(async (err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      // const s = await sharp().resize(200, 250).webp();
      // gfs.openDownloadStreamByName(req.params.filename).pipe(s).pipe(res);
      gfs.openDownloadStreamByName(req.params.filename).pipe(res)
      .on('error', function(error) { console.log(":::error"); /* assert.ifError(error); */ })
      .on('finish', function() { /*console.log('done!');  process.exit(0); */ }); 

    });
}

function resizingImages (req, res, next) {
  // console.log('id', req.params.id)
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray(async (err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      // gfs.openDownloadStreamByName(req.params.filename).pipe(res);
      const { width, height } = req.params;

      if( width !== '' || height !== '' )  {
        let s;
        if( width !== '' && height !== '' )  s = await sharp().resize(Number(width), Number(height)).webp();
        else if( width !== '' )  s = await sharp().resize({ width: Number(width) }).webp();
        else if( height !== '' ) s = await sharp().resize({ height: Number(width) }).webp();
        gfs.openDownloadStreamByName(req.params.filename).pipe(s).pipe(res)
        .on('error', function(error) { console.log(":::error"); /* assert.ifError(error); */ })
        .on('finish', function() { /*console.log('done!');  process.exit(0); */ }); 

      }
      else gfs.openDownloadStreamByName(req.params.filename).pipe(res)
            .on('error', function(error) { console.log(":::error"); /* assert.ifError(error); */ })
            .on('finish', function() { /*console.log('done!');  process.exit(0); */ }); 

    });
}

// files/del/:id
// Delete chunks from the db
function deleteFile (req, res) {
  gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => { 
    if (err) return res.status(404).json({ err: err.message });
    return res.json({message : "success"});
  });
}

