'use strict';

const express = require('express')();
const fs = require('fs');
const io = require('./config/io');
const passport = require('passport');
const path = require('path');

require('./config/mongoose');

const modelsPath = path.join(__dirname, 'app', 'models');

fs.readdirSync(modelsPath).forEach(function(file) {
    require(path.join(modelsPath, file));
});
require('./config/passport')(passport);
require('./config/express')(express, passport);
require('./config/routes')(express, passport);

module.exports = {
    express,
    io
};
