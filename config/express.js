'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const favicon = require('serve-favicon');
const flash = require('connect-flash');
const less = require('less-middleware');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const session = require('express-session');

const MongoStore = require('connect-mongo')(session);

const config = require('.');

const root = path.join(__dirname, '..');

module.exports = function (app, passport) {

    app.use(logger('dev'));

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(root, 'public', 'favicon.ico')));

    app.set('views', path.join(root, 'app', 'views'));
    app.set('view engine', 'ejs');
    app.use(less(path.join(root, 'public')));
    app.use(express.static(path.join(root, 'public')));

    //app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(session({
        resave: false,
        saveUninitializedSession: false,
        secret: config.secret,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());

    app.use(function (req, res, next) {
        res.locals.successes = req.flash('success');
        res.locals.infos = req.flash('info');
        res.locals.warnings = req.flash('warning');
        res.locals.errors = req.flash('error');
        next();
    });
};
