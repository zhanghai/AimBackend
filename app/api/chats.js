'use strict';

const mongoose = require('mongoose');

const io = require('../../config/io');

const Chat = mongoose.model('Chat');
const Message = mongoose.model('Message');
const Recent = mongoose.model('Recent');
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
                chat.members.find(member => member.user.id === req.user.id).lastReadAt = new Date();
                return chat.save()
                    .then(chat => {
                        chat = chat.toObject();
                        const promises = [];
                        for (const member of chat.members) {
                            promises.push(Relationship.findAndAttachToTarget(req.user, member.user));
                        }
                        return Promise.all(promises)
                            .then(() => Chat.findAndAttachMessages(chat, req.user))
                            .then(() => res.status(200).json(chat))
                            .then(() => io.to(req.user.id).emit('recents-updated'));
                    });
            })
            .catch(next);
    },

    // TODO: Should use a private flag to distinguish with group chat.
    retrieveByUser(req, res, next) {
        User.findOne({ username: req.params.username })
            .then(peer => {
                if (!peer) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return Chat.findOne({
                    private: true,
                    'members.user': {
                        $all: [req.user.id, peer.id]
                    }
                }).populate('members.user')
                    .then(chat => {
                        if (!chat) {
                            return Relationship.findOne({
                                user: req.user.id,
                                target: peer.id,
                                isFriend: true
                            })
                                .then(relationship => {
                                    if (!relationship) {
                                        res.status(403).json({ message: 'Not friends' });
                                        return null;
                                    }
                                    return new Chat({
                                        members: [{
                                            user: req.user.id,
                                            lastReadAt: new Date()
                                        }, {
                                            user: peer.id
                                        }],
                                        private: true
                                    }).save()
                                        .then(chat => chat.populate('members.user').execPopulate());
                                });
                        }
                        chat.members.find(member => member.user.id === req.user.id).lastReadAt = new Date();
                        return chat.save();
                    })
                    .then(chat => {
                        if (!chat) {
                            return;
                        }
                        chat = chat.toObject();
                        const promises = [];
                        for (const member of chat.members) {
                            promises.push(Relationship.findAndAttachToTarget(req.user, member.user));
                        }
                        return Promise.all(promises)
                            .then(() => Chat.findAndAttachMessages(chat, req.user))
                            .then(() => res.status(200).json(chat));
                    })
            })
            .catch(next);
    },

    updateName(req, res, next) {
        return Chat.findById(req.params.chatId)
            .then(chat => {
                if (!chat) {
                    return res.status(404).json({ message: 'Chat not found' });
                }
                chat.name = req.body.name;
                chat.save()
                    .then(message => res.status(200).json(message));
            })
            .catch(next);
    },

    appendMessage(req, res, next) {
        return Chat.findById(req.params.chatId)
            .then(chat => {
                if (!chat) {
                    return res.status(404).json({message: 'Chat not found'});
                }
                if (chat.private) {
                    const peerId = chat.members.map(member => String(member.user)).filter(user => user !== req.user.id)[0];
                    return Relationship.findOne({
                        user: req.user.id,
                        target: peerId,
                        isFriend: true
                    })
                        .then(relationship => {
                            if (!relationship) {
                                res.status(403).json({ message: 'Not friends' });
                                return null;
                            }
                            return chat;
                        });
                }
                return chat;
            })
            .then(chat => {
                if (!chat) {
                    return;
                }
                return new Message({
                    chat: chat.id,
                    user: req.user,
                    text: req.body.text
                }).save()
                    .then(message => {
                        chat.members.find(member => String(member.user) === req.user.id).lastReadAt = new Date();
                        return chat.save()
                            .then(() => {
                                const promises = [];
                                for (const member of chat.members) {
                                    promises.push(Recent.findOneAndUpdate({
                                        user: member.user,
                                        chat: chat.id
                                    }, {}, {
                                        new: true,
                                        upsert: true
                                    }));
                                }
                                return Promise.all(promises);
                            })
                            .then(() => res.status(200).json(message))
                            .then(() => {
                                for (const member of chat.members) {
                                    io.to(member.user).emit('chat-updated', chat.id).emit('recents-updated');
                                }
                            });
                    })
            })
            .catch(next);
    }
};
