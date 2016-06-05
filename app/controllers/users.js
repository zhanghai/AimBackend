'use strict';

const mongoose = require('mongoose');

const User = mongoose.model('User');

module.exports.load = function (req, res, next, username) {
    const criteria = { username: username };
    try {
        req.user = User.load({ criteria: criteria });
        if (!req.user) {
            return next(new Error('User not found'));
        }
    } catch (err) {
        return next(err);
    }
    return next();
};

module.exports.register = function (req, res, next) {
    const user = new User(req.body);
    user.save(function (err) {
        if (err) {
            if (err.errors) {
                Object.keys(err.errors).forEach(function (path) {
                    req.flash('error', err.errors[path].message);
                });
            } else {
                req.flash('error', err.message);
            }
            return res.redirect('/register');
        } else {
            req.login(user, function (err) {
                if (err) {
                    req.flash('error', err);
                }
                return res.redirect('/');
            })
        }
    });
};

module.exports.show = function (req, res) {

};
