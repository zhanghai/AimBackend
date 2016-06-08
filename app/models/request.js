'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Request Schema
 */

const RequestSchema = new Schema({
    user : {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: String,
    state: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

mongoose.model('Request', RequestSchema);
