'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Recent Schema
 */

const RecentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    }
});

mongoose.model('Recent', RecentSchema);
