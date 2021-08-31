const express = require('express');
const axios = require('axios');
const { DateTime } = require("luxon");
require('dotenv').config();
const createHtml = require('../public/javascripts/createBaseHtml');

const router = express.Router();

/* GET symbol */
router.get('/:symbol', function(req, res, next) {
  let data = {
    symbols: null,
    prices: null,
    news: null
  }
  const peersUrl = peersApiPath(req.params.symbol);
  axios.get(peersUrl)
    .then((response) => { 
      let symbols = response.data.filter(symbol => !symbol.includes('.') && symbol !== req.params.symbol.toUpperCase());
      symbols = symbols.slice(0,4)
      symbols.unshift(req.params.symbol.toUpperCase());
      data.symbols = symbols;
      return symbols
    })
    .then((symbols) => {
      let promises = [];
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        const priceUrl = priceApiPath(symbol);
        promises.push(axios.get(priceUrl));
      }
      return Promise.all(promises);
    })
    .then((responses) => {
      data.prices = responses.map(response => response.data.c);
      let promises = [];
      for (let i = 0; i < data.symbols.length; i++) {
        const symbol = data.symbols[i];
        const newsUrl = newsApiPath(symbol);
        promises.push(axios.get(newsUrl));
      }
      return Promise.all(promises);
    })
    .then((responses) => {
      data.news = responses.map(response => {
        return response.data.slice(0,5)
      });
      res.writeHead(200, {'content-type': 'text/html'});
      res.write(createHtml());
      for (let i = 0; i < data.symbols.length; i++) {
        res.write(`${data.symbols[i]} - $${data.prices[i]}<br><strong>NEWS</strong><br>`)
        for (let j = 0; j < data.news[i].length; j++) {
          res.write(`${data.news[i][j].headline}<br>`)
        }
        res.write(`<br><br><br>`);
      }
      res.write(`</div></main></body></html>`)
      res.end();
    })
    .catch((e) => {
      console.log(e);
    })
});

function peersApiPath(symbol) {
  //Retrieve API key from .env file and return complete URL
  const token = process.env.FINNHUB_TOKEN;
  const url = `https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${token}`;
  return url;
}

function priceApiPath(symbol) {
  //Retrieve API key from .env file and return complete URL
  const token = process.env.FINNHUB_TOKEN;
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`;
  return url;
}

function newsApiPath(symbol) {
  //Retrieve API key from .env file and return complete URL
  const token = process.env.FINNHUB_TOKEN;
  //TODO come back and fix these dates lol
  const toDate = DateTime.now().toISODate();
  const fromDate = DateTime.now().minus({days: 7}).toISODate();
  const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${token}`;
  return url;
}

module.exports = router;
