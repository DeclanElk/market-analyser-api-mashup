const express = require('express');
const router = express.Router();

/* Render home/documentation pug template on site's root directory */
router.get('/', function(req, res, next) {
  res.render('index')
});

module.exports = router;
