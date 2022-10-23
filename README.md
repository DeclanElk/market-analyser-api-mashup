# Market Analyser
This is a Node.JS API mashup application developed for a cloud computing university class. The goal of the application was to chain multiple APIs together to provide a richer experience than any single API can provide alone.

In this case, the application provides US stock market information in the form of stock pricing and recent company news from the [Finnhub API](https://finnhub.io/). You are able to search for a particular stock based on its ticker code and view its daily price movement along with up to 5 recent relevant news articles, as well as the price and recent news of similar related stocks.

## Running the application
To run this application, clone the repository and install the dependencies using `npm install`, then run the application using `npm start` - you can now access the site on `http://localhost:3000` within your browser. 

**Note:** Please ensure a suitable environment variable named FINNHUB_TOKEN exists containing a production Finnhub.io API token, or the searching functionality of the application will not work. The frequency with which you can search using the application depends on the subscription level of your Finnhub account, with the free tier allowing for 3 searches per minute.
