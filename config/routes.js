'use strict';

module.exports = function (app, passport) {

    /* GET home page. */
    app.get('/', function(req, res, next) {
        res.render('index', { title: 'Express' });
    });

    /* GET users listing. */
    app.get('/', function(req, res, next) {
        res.send('respond with a resource');
    });

    app.use(function(req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {
        // development error handler
        // will print stacktrace
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
};
