'use strict';

const mongoose = require('mongoose');

const Chat = mongoose.model('Chat');
const Message = mongoose.model('Message');
const Relationship = mongoose.model('Relationship');
const User = mongoose.model('User');

module.exports = {

    retrieve(req, res, next) {
        return Chat.findById(req.params.chatId)
            .populate('members.user')
            .then(chat => {
                if (!chat) {
                    return res.status(404).json({ message: 'Chat not found' });
                }
                chat = chat.toObject();
                const promises = [];
                for (const member of chat.members) {
                    promises.push(Relationship.findAndAttachToTarget(req.user, member.user));
                }
                return Promise.all(promises)
                    .then(() => Message.find({ chat: chat._id }).sort('-createdAt').limit(20).populate('user'))
                    .then((messages) => chat.messages = messages.map(message => message.toObject()))
                    .then(() => Message.findAndAttachRelationship(req.user, chat.messages))
                    .then(() => res.status(200).json(chat));
            })
            .catch(err => next(err));
    },

    retrieveByUser(req, res, next) {
        User.findOne({ username: req.params.username })
            .then(peer => {
                if (!peer) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return Chat.findOne({
                    'members': {
                        $size: 2
                    },
                    'members.user': {
                        $all: [req.user.id, peer.id]
                    }
                }).populate('members.user')
                    .then(chat => {
                        if (!chat) {
                            return new Chat({
                                members: [{
                                    user: req.user.id
                                }, {
                                    user: peer.id
                                }]
                            }).save()
                                .then(chat => chat.populate('members.user'));
                        }
                        return chat;
                    })
                    .then(chat => chat.toObject())
                    .then(chat => {
                        const promises = [];
                        for (const member of chat.members) {
                            promises.push(Relationship.findAndAttachToTarget(req.user, member.user));
                        }
                        return Promise.all(promises)
                            .then(() => Message.find({ chat: chat._id }).sort('-createdAt').limit(20).populate('user'))
                            .then((messages) => chat.messages = messages.map(message => message.toObject()))
                            .then(() => Message.findAndAttachRelationship(req.user, chat.messages))
                            .then(() => res.status(200).json(chat));
                    });
            })
            .catch(err => next(err));
    },

    appendMessage(req, res, next) {
        return Chat.findById(req.params.chatId)
            .then(chat => {
                if (!chat) {
                    return res.status(404).json({ message: 'Chat not found' });
                }
                new Message({
                    user: req.user,
                    text: req.params.text
                }).save()
                    .then((message) => res.status(200).json(message));
            })
            .catch(err => next(err));
    }
};
