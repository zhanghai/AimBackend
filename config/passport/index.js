'use strict';

const mongoose = require('mongoose');

const local = require('./local');

const User = mongoose.model('User');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, done);
    });

    passport.use(local);
};
