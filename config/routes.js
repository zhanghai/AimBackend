'use strict';

const users = require('../app/controllers/users');

module.exports = function (app, passport) {

    app.get('/', function(req, res) {
        res.render('index', { title: 'Aim' });
    });

    app.get('/register', function (req, res) {
        res.render('users/register');
    });
    app.post('/register', users.register);
    app.get('/login', function (req, res) {
        res.render('users/login');
    });
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));
    app.get('/users/:username', users.show);

    app.use(function(req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {
        // development error handler
        // will print stacktrace
        app.use(function(err, req, res) {
            if (!err.status) {
                err.status = 500;
            }
            res.status(err.status);
            res.render('error', {
                error: err
            });
        });
    }

    // production error handler
    // no stacktrace leaked to user
    app.use(function (err, req, res) {
        if (!err.status) {
            err.status = 500;
        }
        res.status(err.status);
        res.render('error', {
            error: {
                message: err.message
            }
        });
    });
};
