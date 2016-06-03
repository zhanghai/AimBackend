'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const favicon = require('serve-favicon');
const less = require('less-middleware');
const logger = require('morgan');
const passport = require('passport');
const path = require('path');

const root = path.join(__dirname, '..');

module.exports = function (app, passport) {

    app.use(logger('dev'));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(root, 'public', 'favicon.ico')));

    app.set('views', path.join(root, 'app', 'views'));
    app.set('view engine', 'ejs');
    app.use(less(path.join(root, 'public')));
    app.use(express.static(path.join(root, 'public')));

    app.use(passport.initialize());
    app.use(passport.session());
};
