'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Message Schema
 */

const MessageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    text: {
        type: String,
        required: true
    }
});

MessageSchema.statics = {
    findAndAttachUsersWithRelationship(messages, user) {
        const promises = [];
        const Relationship = mongoose.model('Relationship');
        for (const message of messages) {
            if (message instanceof mongoose.Document) {
                throw new Error("findAndAttachUsersWithRelationship called with message as a Document; should call message.toObject() before this");
            }
            promises.push(Relationship.findAndAttachToTarget(user, message.user))
        }
        return Promise.all(promises);
    }
};

mongoose.model('Message', MessageSchema);
