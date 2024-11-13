const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session)
const morgan = require('morgan');
const winston = require('winston');

const fs = require('fs');

const HomeController = require('./controllers/HomeController');
const AdminController = require('./controllers/AdminController');
const SupervisorController = require('./controllers/SupervisorController');
const SamplerController = require('./controllers/SamplerController');
const SecurityController = require('./controllers/SecurityController');

const { APP_NAME, APP_DESCRIPTION, APP_VERSION, DEFAULT_PROFILE_ADMIN, DEFAULT_PROFILE_SUPERVISOR, DEFAULT_PROFILE_SAMPLER } = require('./config/consts');

const app = express();

// view engine setup
app.engine('ejs', require('express-ejs-extend'))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const SESSION_SECRET = process.env.SESSION_SECRET
const age = 48 * 60 * 60 * 1000 // 48 hours
const modactuel = process.env.NODE_ENV || 'development'
console.log('modactuel', modactuel);


if (modactuel !== "development") {
  const client = redis.createClient()
  app.use(session({
    secret: SESSION_SECRET,
    store: new redisStore({
      host: 'localhost',
      port: 6379,
      client: client,
      ttl: 260
    }),
    saveUninitialized: true,
    resave: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: age
    }
  }));
} else {
  app.use(session({
    secret: SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: age
    }
  }));
}

app.use(
  '/admin',
  async (req, res, next) => {
    console.log("__AdminController________________________________")
    let error = ""
    if (req.session.user_data && req.session.user_data.profile.value == DEFAULT_PROFILE_ADMIN) {
      next()

    } else {
      error = "Votre session a expirée."
    }

    if (error) {
      // logger.error("Error while retrieving user data for Build: " + error)
      // logger.error("Redirecting to /security/logout, modactuel: " + modactuel)
      console.log("Error while retrieving user data for Build: " + error)
      res.redirect("/security/logout")
    }
  }, AdminController
)

app.use(
  '/supervisor',
  async (req, res, next) => {
    console.log("__SupervisorController________________________________")
    let error = ""
    if (req.session.user_data && req.session.user_data.profile.value == DEFAULT_PROFILE_SUPERVISOR) {
      next()

    } else {
      error = "Votre session a expirée."
    }

    if (error) {
      // logger.error("Error while retrieving user data for Build: " + error)
      // logger.error("Redirecting to /security/logout, modactuel: " + modactuel)
      console.log("Error while retrieving user data for Build: " + error)
      res.redirect("/security/logout")
    }
  }, SupervisorController
)

app.use(
  '/sampler',
  async (req, res, next) => {
    console.log("__SamplerController________________________________")
    let error = ""
    if (req.session.user_data && req.session.user_data.profile.value == DEFAULT_PROFILE_SAMPLER) {
      next()

    } else {
      error = "Votre session a expirée."
    }

    if (error) {
      // logger.error("Error while retrieving user data for Build: " + error)
      // logger.error("Redirecting to /security/logout, modactuel: " + modactuel)
      console.log("Error while retrieving user data for Build: " + error)
      res.redirect("/security/logout")
    }
  }, SamplerController
)

app.use(
  '/',
  (req, res, next) => {
    console.log("__HomeController________________________________")
    next()
  }, HomeController
)

app.use(
  '/security',
  (req, res, next) => {
    console.log("__SecurityController______________________________")
    next()
  }, SecurityController
)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // next(createError(404));
  res.render('security/notfound', {
    appName: APP_NAME,
    appVersion: APP_VERSION,
    appDescription: APP_DESCRIPTION
  })
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
