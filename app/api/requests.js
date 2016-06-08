'use strict';

const mongoose = require('mongoose');

const Relationship = mongoose.model('Relationship');
const Request = mongoose.model('Request');
const User = mongoose.model('User');

module.exports = {

    list: function (req, res) {
        Request.find({ user: req.user.id })
            .sort('-createdAt')
            .populate('requester')
            .then(function (requests) {
                return res.status(200).json(requests);
            })
            .catch(function (err) {
                return res.status(500).json(err);
            });
    },

    create: function (req, res) {
        User.findById({ username: req.body.username })
            .then(function (target) {
                if (!target) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return new Request({
                    user: target.id,
                    requester: req.user.id,
                    message: req.body.message
                }).save()
                    .then(function (request) {
                        return res.status(200).json(request);
                    })
            })
            .catch(function (err) {
                return res.status(500).json(err);
            })
    },

    retrieve: function (req, res) {
        Request.findById(req.params.requestId)
            .populate('requester')
            .then(function (request) {
                if (!request) {
                    return res.status(404).json({ message: 'Request not found' });
                }
                if (request.user !== req.user.id) {
                    return res.status(403).json({ message: 'Request access denied' });
                }
                return res.status(200).json(request);
            })
            .catch(function (err) {
                return res.status(500).json(err);
            });
    },

    update: function (req, res) {
        Request.findById(req.params.requestId)
            .then(function (request) {
                if (!request) {
                    return res.status(404).json({ message: 'Request not found' });
                }
                if (request.user !== req.user.id) {
                    return res.status(403).json({ message: 'Request access denied' });
                }
                if (request.state !== 'pending') {
                    return res.status(403).json({ message: 'Request has been resolved' });
                }
                switch (req.body.state) {
                    case 'accepted':
                        return Relationship.setIsFriend(request.user, request.requester, true)
                            .then(function () {
                                request.state = req.body.state;
                                return request.save();
                            })
                            .then(function (request) {
                                return res.status(200).json(request);
                            });
                        break;
                    case 'rejected':
                        request.state = req.body.state;
                        return request.save()
                            .then(function (request) {
                                return res.status(200).json(request);
                            });
                        break;
                    default:
                        return res.status(422).json({ message: 'Invalid parameter: action' });
                }
            })
            .catch(function (err) {
                return res.status(500).json(err);
            });
    },

    delete: function (req, res) {
        Request.findByIdAndRemove(req.params.requestId)
            .then(function (request) {
                if (!request) {
                    return res.status(404).json({ message: 'Request not found' });
                }
                if (request.user !== req.user.id) {
                    return res.status(403).json({ message: 'Request access denied' });
                }
                return request.remove()
                    .then(function (request) {
                        return res.status(200).json(request);
                    });
            })
            .catch(function (err) {
                return res.status(500).json(err);
            });
    }
}
