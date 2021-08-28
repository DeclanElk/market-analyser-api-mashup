const express = require('express');
const axios = require('axios');
require('dotenv').config()

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
      res.writeHead(200, {'content-type': 'text/html'});
      let promises = [];
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        priceUrl = priceApiPath(symbol);
        promises.push(axios.get(priceUrl));
      }
      return Promise.all(promises)
    })
    .then((responses) => {
      data.prices = responses.map(response => response.data.c);
      for (let i = 0; i < data.symbols.length; i++) {
        res.write(`${data.symbols[i]} - $${data.prices[i]}<br>`)
      }
      res.end();
    })
    .catch((e) => {
      console.log(e);
    })
});

//      res.writeHead(200, {'content-type': 'text/html'});

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
  const toDate = new Date();
  const fromDate = new Date(toDate.getDate() - 7);
  const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=2021-08-21&to=2021-08-28&token=${token}`;
  return url;
}

module.exports = router;
