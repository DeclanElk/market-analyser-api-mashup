const express = require('express');
const createError = require('http-errors');
const axios = require('axios');
const { DateTime } = require("luxon");
require('dotenv').config();

const router = express.Router();

/* Render stock analysis on /search/(symbol) path */
router.get('/:symbol', function(req, res, next) {
  //Data object that will be progressively filled in the promise chain
  let data = {
    symbols: null,
    names: null,
    prices: null,
    news: null
  }
  /* First, fetch a list of stocks related to the company that was 
  searched for, and store the top 4 + the original stock to the data object */
  const peersUrl = peersApiPath(req.params.symbol);
  axios.get(peersUrl)
    .then((response) => { 
      //Filter out known bad stock symbols
      let symbols = response.data.filter(symbol => {
        return !symbol.includes('.') && symbol !== req.params.symbol.toUpperCase()
      });
      symbols = symbols.slice(0,4)
      symbols.unshift(req.params.symbol.toUpperCase());
      return symbols
    })
    //Then, fetch the actual names of each stock and store this in the data object 
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
    /* Next, fetch the current pricing data of each stock, after confirming
    the searched stock does actually exist. */
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
    /* Handle any errors that may arise with the pricing data, then finally
    fetch a set of recent news stories about each stock. */
    .then((prices) => {
      data.prices = prices.map(response => {
        if (response.data.c === 0 || response.data.d === null ||
          response.data.dp === null || response.data.o === 0) {
          throw new Error('500 Price API failure.');
        }
        return response.data
      });
      let promises = [];
      for (let i = 0; i < data.symbols.length; i++) {
        const symbol = data.symbols[i];
        const newsUrl = newsApiPath(symbol);
        promises.push(axios.get(newsUrl));
      }
      return Promise.all(promises);
    })
    /* Extract the required details of each news story, and crop the
    headlines and summaries to a reasonable length */
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
      //Pass the complete data array through to our pug template and render the page.
      res.render('analysis', { data })
    })
    /* Provide specific error messages & codes for known encounterable errors, 
    otherwise send a generic 500 internal server error message. */
    .catch((error) => {
      if (error.toString().includes('Stock not found.')) {
        next(createError(404, 'Error! Stock not found.'));
      }
      else if (error.toString().includes('Price API failure.')) {
        next(createError(500, 'Error! Service provider API failure.'))
      }
      else if (error.response !== undefined && 
        error.response.data.error.includes('API limit reached')) {
        next(createError(429, 'Error! The search limit has been reached.'))
      }
      else {
        next(createError(500, 'Error! An internal error has occured.'));
      }
    })
});


//API Helper functions - finnhub api token retrieved from .env file.

//Retrieve the API path to fetch a stock's related companies
function peersApiPath(symbol) {
  const token = process.env.FINNHUB_TOKEN;
  const url = `https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${token}`;
  return url;
}

//Retrieve the API path to fetch a stock's name
function nameApiPath(symbol) {
  const token = process.env.FINNHUB_TOKEN;
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${token}`;
  return url;
}

//Retrieve the API path to fetch a stock's price data
function priceApiPath(symbol) {
  const token = process.env.FINNHUB_TOKEN;
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`;
  return url;
}

//Retrieve the API path to fetch recent news about a stock
function newsApiPath(symbol) {
  const token = process.env.FINNHUB_TOKEN;
  //Date range of news articles is hard-coded to the past 7-days.
  const toDate = DateTime.now().toISODate();
  const fromDate = DateTime.now().minus({days: 7}).toISODate();
  const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${token}`;
  return url;
}

module.exports = router;
