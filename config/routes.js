'use strict';

const upload = require('./upload');

const api = require('../app/api');
const users = require('../app/controllers/users');

module.exports = function (app, passport) {

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

    // HACK: Debug.
    app.all('/upload', function (req, res, next) {
        res
            .header('Access-Control-Allow-Origin', 'http://localhost:8080')
            .header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PATCH, PUT, DELETE, OPTIONS')
            .header('Access-Control-Allow-Headers', 'Content-Type')
            .header('Access-Control-Allow-Credentials', true);
        return next();
    });
    app.options('/upload', function (req, res) {
        return res.sendStatus(204);
    });
    app.post('/upload', upload.single('file'), (req, res, next) => {
        return res.status(200).json(req.file);
    });

    // HACK: Debug.
    app.all('/api/*', function (req, res, next) {
        res
            .header('Access-Control-Allow-Origin', 'http://localhost:8080')
            .header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PATCH, PUT, DELETE, OPTIONS')
            .header('Access-Control-Allow-Headers', 'Content-Type')
            .header('Access-Control-Allow-Credentials', true);
        return next();
    });
    app.options('/api/*', function (req, res) {
        return res.sendStatus(204);
    });

    app.post('/api/login', function(req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ message: info.message });
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                return res.status(200).json(user);
            });
        })(req, res, next);
    });

    const requireAuthentication = function (req, res, next) {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        return next();
    };

    app.get('/api/profile', requireAuthentication, api.profile.retrieve);
    app.patch('/api/profile', requireAuthentication, api.profile.update);
    // For compatibility
    app.post('/api/profile', requireAuthentication, api.profile.update);

    app.get('/api/requests', requireAuthentication, api.requests.list);
    app.post('/api/requests', requireAuthentication, api.requests.create);
    app.get('/api/requests/:requestId', requireAuthentication, api.requests.retrieve);
    app.patch('/api/requests/:requestId', requireAuthentication, api.requests.update);
    // For compatibility
    app.post('/api/requests/:requestId', requireAuthentication, api.requests.update);
    app.delete('/api/requests/:requestId', requireAuthentication, api.requests.delete);

    app.get('/api/friends', requireAuthentication, api.friends.list);
    app.delete('/api/friends/:username', requireAuthentication, api.friends.delete);

    app.get('/api/users', requireAuthentication, api.users.search);
    app.get('/api/users/:username', requireAuthentication, api.users.retrieve);
    app.patch('/api/users/:username', requireAuthentication, api.users.update);
    // For compatibility
    app.post('/api/users/:username', requireAuthentication, api.users.update);

    app.get('/api/chats/user/:username', requireAuthentication, api.chats.retrieveByUser);
    app.get('/api/chats/:chatId', requireAuthentication, api.chats.retrieve);
    app.patch('/api/chats/:chatId/name', requireAuthentication, api.chats.updateName);
    // For compatibility
    app.post('/api/chats/:chatId/name', requireAuthentication, api.chats.updateName);
    app.patch('/api/chats/:chatId/messages', requireAuthentication, api.chats.appendMessage);
    // For compatibility
    app.post('/api/chats/:chatId/messages', requireAuthentication, api.chats.appendMessage);

    app.get('/api/recents', requireAuthentication, api.recents.list);
    app.get('/api/recents/:recentId', requireAuthentication, api.recents.retrieve);
    app.patch('/api/recents/:recentId', requireAuthentication, api.recents.update);
    // For compatibility
    app.post('/api/recents/:recentId', requireAuthentication, api.recents.update);
    app.delete('/api/recents/:recentId', requireAuthentication, api.recents.delete);

    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {
        // development error handler
        // will print stacktrace
        app.use((err, req, res) => {
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
    app.use((err, req, res) => {
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
