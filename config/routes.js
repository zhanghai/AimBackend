'use strict';

const api = require('../app/api');
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

    app.post('/api/login', passport.authenticate('local'));

    app.all('/api/*', function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            return res.status(401).json({ message: 'Authentication required' });
        }
    });

    app.get('/api/requests', api.requests.list);
    app.post('/api/requests', api.requests.create);
    app.get('/api/requests/:requestId', api.requests.retrieve);
    app.patch('/api/requests/:requestId', api.requests.update);
    // For compatibility
    app.post('/api/requests/:requestId', api.requests.update);
    app.delete('/api/requests/:requestId', api.requests.delete);

    app.get('/api/friends', api.friends.list);
    app.delete('/api/friends/:username', api.friends.delete);

    app.get('/api/users/:username', api.users.retrieve);
    app.patch('/api/users/:username', api.users.update);
    // For compatibility
    app.post('/api/users/:username', api.users.update);

    app.get('/chat', function (req, res) {
        res.render('chat');
    });

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
    // no stacktrace leaked to userId
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
