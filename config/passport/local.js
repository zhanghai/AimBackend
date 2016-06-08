'use strict';

const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const User = mongoose.model('User');

module.exports = new LocalStrategy(function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) {
                return done(err);
            } else if (!user) {
                return done(null, false, { message: '账户不存在' });
            } else if (!user.authenticate(password)) {
                return done(null, false, { message: '密码错误' });
            } else {
                return done(null, user);
            }
        });
    }
);
