var express = require("express");
const BlogController = require("../controllers/BlogController");

var router = express.Router();

router.get("/", BlogController.blogList);
router.get("/:id", BlogController.blogDetail);
router.post("/", BlogController.createBlog);
router.put("/:id", BlogController.blogUpdate);
router.delete("/:id", BlogController.blogDelete);

module.exports = router;