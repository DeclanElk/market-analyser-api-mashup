const express = require('express');
const createError = require('http-errors');
const axios = require('axios');
const { DateTime } = require("luxon");
require('dotenv').config();
const createHtml = require('../public/javascripts/createBaseHtml');

const router = express.Router();

/* GET symbol */
router.get('/:symbol', function(req, res, next) {
  let data = {
    symbols: null,
    names: null,
    prices: null,
    news: null
  }
  const peersUrl = peersApiPath(req.params.symbol);
  axios.get(peersUrl)
    .then((response) => { 
      let symbols = response.data.filter(symbol => !symbol.includes('.') && symbol !== req.params.symbol.toUpperCase());
      symbols = symbols.slice(0,4)
      symbols.unshift(req.params.symbol.toUpperCase());
      return symbols
    })
    .then((symbols) => {
      data.symbols = symbols;
      let promises = [];
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        const nameUrl = nameApiPath(symbol);
        promises.push(axios.get(nameUrl));
      }
      return Promise.all(promises);
    })
    .then((names) => {
      data.names = names.map(response => response.data.name);
      if (data.names[0] === undefined) {
        throw new Error('404 Stock not found.');
      }
      let promises = [];
      for (let i = 0; i < data.symbols.length; i++) {
        const symbol = data.symbols[i];
        const priceUrl = priceApiPath(symbol);
        promises.push(axios.get(priceUrl));
      }
      return Promise.all(promises);
    })
    .then((prices) => {
      data.prices = prices.map(response => response.data);
      let promises = [];
      for (let i = 0; i < data.symbols.length; i++) {
        const symbol = data.symbols[i];
        const newsUrl = newsApiPath(symbol);
        promises.push(axios.get(newsUrl));
      }
      return Promise.all(promises);
    })
    .then((news) => {
      data.news = news.map(response => {
        return response.data.slice(0,5)
      });
      for (let i = 0; i < data.news.length; i++) {
        for (let j = 0; j < data.news[i].length; j++) {
          let story = data.news[i][j]
          if (story.headline.length > 50) {
            story.headline = story.headline.substring(0, 50) + "...";
          }
          if (story.summary.length > 250) {
            story.summary = story.summary.substring(0, 250) + "...";
          }
        }
      }
      res.render('analysis', { data })
    })
    .catch((error) => {
      if (error.toString().includes('Stock not found.')) {
        next(createError(404, 'Error! Stock not found.'));
      }
      else if (error.response !== undefined && error.response.data.error.includes('API limit reached')) {
        next(createError(429, 'Error! The search limit has been reached.'))
      }
      else {
        next(createError(500, 'Error! An internal error has occured.'));
      }
    })
});

function peersApiPath(symbol) {
  //Retrieve API key from .env file and return complete URL
  const token = process.env.FINNHUB_TOKEN;
  const url = `https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${token}`;
  return url;
}

function nameApiPath(symbol) {
  //Retrieve API key from .env file and return complete URL
  const token = process.env.FINNHUB_TOKEN;
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${token}`;
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
