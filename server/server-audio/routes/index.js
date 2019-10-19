var express = require("express");
var router = express.Router();
var multer = require("multer");
var songModel = require("../models/song");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/original-songs");
    //Todo song by watermarking
    //Then storing in watermark-songs folder
    cb(null, "./public/watermark-songs");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.(mp3|MP3|mp4|MP4)$/)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

/* POST song */
router.post("/upload", upload.any(), (req, res, next) => {
  const newSong = {
    url: req.files[0].filename,
    name: req.body.name,
    artist: req.body.artist
  };
  new songModel(newSong)
    .save()
    .then(song => res.status(200).json(song))
    .catch(err => res.json(err));
});

/* GET songs */
router.get("/getSongs", (req, res, next) => {
  songModel
    .find({})
    .then(songs => res.status(200).json(songs))
    .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

module.exports = router;
