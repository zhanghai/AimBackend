'use strict';

const mongoose = require('mongoose');

const config = require('.');

mongoose.connect(config.db, {
    server: {
        socketOptions: {
            keepAlive: 1
        }
    }
});
