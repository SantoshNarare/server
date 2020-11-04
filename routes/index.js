var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res) {
	res.send('cool its working fine...');
});

module.exports = router;
