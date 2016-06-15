'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Chat Schema
 */

const ChatSchema = new Schema({
    name: String,
    members: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        lastReadAt: Date
    }]
});

ChatSchema.statics = {
    findAndAttachMessages(chat, user) {
        if (chat instanceof mongoose.Document) {
            throw new Error("findAndAttachMessages called with chat as a Document; should call chat.toObject() before this");
        }
        const Message = mongoose.model('Message');
        return Message.find({ chat: chat._id }).sort('createdAt').limit(20).populate('user')
            .then((messages) => chat.messages = messages.map(message => message.toObject()))
            .then(() => Message.findAndAttachUsersWithRelationship(chat.messages, user))
    }
};

mongoose.model('Chat', ChatSchema);
