const express = require('express');
const createHtml = require('../public/javascripts/createBaseHtml');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.writeHead(200, {'content-type': 'text/html'});
  res.write(createHtml());
  res.write(`<br><br><br>`);
  res.end();
});

module.exports = router;
