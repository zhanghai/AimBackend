'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Chat Schema
 */

const ChatSchema = new Schema({
    members: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        lastReadAt: Date
    }]
});

mongoose.model('Chat', ChatSchema);
