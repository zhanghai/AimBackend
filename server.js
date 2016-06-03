'use strict';

const express = require('express');
const fs = require('fs');
const passport = require('passport');
const path = require('path');

const modelsPath = path.join(__dirname, 'app', 'models');

const app = express();

fs.readdirSync(modelsPath).forEach(function(file) {
    require(path.join(modelsPath, file));
});

require('./config/passport')(passport);
require('./config/express')(app, passport);
require('./config/routes')(app, passport);

module.exports = app;
