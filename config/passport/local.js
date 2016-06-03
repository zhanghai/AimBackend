'use strict';

const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const User = mongoose.model('User');

module.exports = new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {
        const options = {
            criteria: { username: username },
            select: 'username passwordSalt passwordHash nickname'
        };
        User.load(options, function (err, user) {
            if (err) {
                return done(err);
            } else if (!user) {
                return done(null, false, { message: 'Unknown user' });
            } else if (!user.authenticate(password)) {
                return done(null, false, { message: 'Invalid password' });
            } else {
                return done(null, user);
            }
        });
    }
);
