'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Friend Schema
 */

const FriendSchema = new Schema({
    userId : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    friendId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    tag: [String]
});

mongoose.model('Friend', FriendSchema);
