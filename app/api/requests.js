'use strict';

const mongoose = require('mongoose');

const io = require('../../config/io');

const Chat = mongoose.model('Chat');
const Message = mongoose.model('Message');
const Relationship = mongoose.model('Relationship');
const Request = mongoose.model('Request');
const User = mongoose.model('User');

module.exports = {

    list: function (req, res, next) {
        Request.find({ user: req.user.id })
            .sort('-createdAt')
            .populate('requester')
            .then(requests => requests.map(request => request.toObject()))
            .then(requests => {
                const promises = [];
                for (const request of requests) {
                    promises.push(Relationship.findAndAttachToTarget(req.user, request.requester));
                }
                return Promise.all(promises)
                    .then(() => res.status(200).json(requests));
            })
            .catch(next);
    },

    create: function (req, res, next) {
        User.findOne({ username: req.body.username })
            .then(target => {
                if (!target) {
                    return res.status(404).json({ message: 'User not found' });
                }
                if (target.id == req.user.id) {
                    return res.status(403).json({ message: 'Cannot request oneself' });
                }
                return new Request({
                    user: target.id,
                    requester: req.user.id,
                    message: req.body.message
                }).save()
                    .then(request => res.status(200).json(request))
                    .then(() => io.to(target.id).emit('requests-updated'));
            })
            .catch(next);
    },

    retrieve: function (req, res, next) {
        Request.findById(req.params.requestId)
            .populate('requester')
            .then(request => {
                if (!request) {
                    return res.status(404).json({ message: 'Request not found' });
                }
                if (request.user !== req.user.id) {
                    return res.status(403).json({ message: 'Request access denied' });
                }
                request = request.toObject();
                return Relationship.findAndAttachToTarget(req.user, request.requester)
                    .then(request => res.status(200).json(request));
            })
            .catch(next);
    },

    update: function (req, res, next) {
        Request.findById(req.params.requestId)
            .then(request => {
                if (!request) {
                    return res.status(404).json({ message: 'Request not found' });
                }
                if (String(request.user) !== req.user.id) {
                    return res.status(403).json({ message: 'Request access denied' });
                }
                if (request.state !== 'pending') {
                    return res.status(403).json({ message: 'Request has been resolved' });
                }
                switch (req.body.state) {
                    case 'accepted':
                        return Relationship.setIsFriend(request.user, request.requester, true)
                            .then(() => {
                                request.state = req.body.state;
                                return request.save();
                            })
                            .then(request => res.status(200).json(request))
                            .then(() => {
                                return Chat.findOne({
                                    private: true,
                                    'members.user': {
                                        $all: [request.user, request.requester]
                                    }
                                })
                            })
                            .then(chat => {
                                if (!chat) {
                                    return new Chat({
                                        members: [{
                                            user: request.user,
                                            lastReadAt: new Date()
                                        }, {
                                            user: request.requester
                                        }],
                                        private: true
                                    }).save();
                                }
                                return chat;
                            })
                            .then(chat => {
                                return new Message({
                                    chat: chat.id,
                                    user: request.user,
                                    text: '我通过了你的好友请求，现在我们可以开始聊天了。'
                                }).save();
                            })
                            .then(chat => {
                                for (const userId of [request.user, request.requester]) {
                                    io.to(userId).emit('chat-updated', chat.id);
                                    io.to(userId).emit('recents-updated');
                                }
                            });
                        break;
                    case 'rejected':
                        request.state = req.body.state;
                        return request.save()
                            .then(request => res.status(200).json(request));
                        break;
                    default:
                        return res.status(422).json({ message: 'Invalid parameter: action' });
                }
            })
            .catch(next);
    },

    delete: function (req, res, next) {
        Request.findByIdAndRemove(req.params.requestId)
            .then(request => {
                if (!request) {
                    return res.status(404).json({ message: 'Request not found' });
                }
                if (request.user !== req.user.id) {
                    return res.status(403).json({ message: 'Request access denied' });
                }
                return request.remove()
                    .then(request => res.status(200).json(request));
            })
            .catch(next);
    }
};
