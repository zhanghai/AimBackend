'use strict';

import mongoose from 'mongoose';

const User = mongoose.model('User');

export default {
    register: function (req, res) {
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
    }
};
