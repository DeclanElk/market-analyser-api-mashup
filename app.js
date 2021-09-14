const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const searchRouter = require('./routes/search');

const app = express();

// Set up Pug view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Stock express-generator middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Link our index router and search router to their respective paths
app.use('/', indexRouter);
app.use('/search', searchRouter);

//Catch 404 errors
app.use(function(req, res, next) {
  next(createError(404, 'Error! Page not found.'));
});

//Handle errors created by https-errors' createError function
app.use(function(err, req, res, next) {
  //Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //Render the error page
  res.status(err.status || 500);
  res.render('error', {code: err.status || 500, message: err.message || "Unknown Error."});
});

module.exports = app;
