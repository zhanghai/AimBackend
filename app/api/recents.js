'use strict';

const mongoose = require('mongoose');

const Chat = mongoose.model('Chat');
const Recent = mongoose.model('Recent');
const Relationship = mongoose.model('Relationship');
const User = mongoose.model('User');

module.exports = {

    list: function (req, res, next) {
        Recent.find({ user: req.user.id })
            .populate('chat')
            .then(recents => {
                const promises = [];
                for (const recent of recents) {
                    promises.push(recent.chat.populate('members.user').execPopulate());
                }
                return Promise.all(promises)
                    .then(() => recents.map(recent => recent.toObject()))
                    .then(recents => {
                        const promises = [];
                        for (const recent of recents) {
                            for (const member of recent.chat.members) {
                                promises.push(Relationship.findAndAttachToTarget(req.user, member.user));
                            }
                            promises.push(Chat.findAndAttachMessages(recent.chat, req.user));
                        }
                        return Promise.all(promises)
                            .then(() => {
                                recents.sort((recent1, recent2) => -(
                                recent1.chat.messages[recent1.chat.messages.length - 1].createdAt
                                - recent2.chat.messages[recent2.chat.messages.length - 1].createdAt));
                            })
                            .then(() => res.status(200).json(recents));
                    })
            })
            .catch(next);
    },

    retrieve: function (req, res, next) {
        Recent.findById(req.params.recentId)
            .populate('chat')
            .then(recent => {
                if (!recent) {
                    return res.status(404).json({ message: 'Recent not found' });
                }
                return recent.chat.populate('members.user').execPopulate()
                    .then(() => {
                        recent = recent.toObject();
                        const promises = [];
                        for (const member of recent.chat.members) {
                            promises.push(Relationship.findAndAttachToTarget(req.user, member.user));
                        }
                        return Promise.all(promises)
                            .then(() => Chat.findAndAttachMessages(recent.chat, req.user))
                            .then(() => res.status(200).json(recent));
                    });
            })
            .catch(next);
    },

    update: function (req, res, next) {
        Recent.findById(req.params.recentId)
            .then(function (recent) {
                if (!recent) {
                    return res.status(404).json({ message: 'Recent not found' });
                }
                if (String(recent.user) !== req.user.id) {
                    return res.status(403).json({ message: 'Recent access denied' });
                }
                recent.lastReadAt = req.body.lastReadAt;
                return recent.save()
                    .then(recent => res.status(200).json(recent));
            })
            .catch(next);
    },

    delete: function (req, res, next) {
        Recent.findByIdAndRemove(req.params.recentId)
            .then(function (recent) {
                if (!recent) {
                    return res.status(404).json({ message: 'Recent not found' });
                }
                if (recent.user !== req.user.id) {
                    return res.status(403).json({ message: 'Recent access denied' });
                }
                return recent.remove()
                    .then(recent => res.status(200).json(recent));
            })
            .catch(next);
    }
};
