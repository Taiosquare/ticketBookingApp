// const express = require("express"),
//   router = express.Router(),
//   cors = require("cors"),
//   multer = require("multer"),
//   authenticate = require("../auth/isAuth"),
//   storage = require("../../config/cloudinary").store,
//   uploadController = require("../controllers/upload"),
//   parser = multer({
//     storage: storage,
//   });

// router.route("/documents").post(
//     authenticate.host,
//     cors(),
//     parser.array("document"),
//     uploadController.uploadDocument
// );

// router.route("/images").post(
//     authenticate.host,
//     cors(),
//     parser.array("image"),
//     uploadController.uploadImage
// );

// module.exports = router;
