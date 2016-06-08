'use strict';

const mongoose = require('mongoose');

const User = mongoose.model('User');

module.exports.list = function (req, res) {
    const userIds = req.user.friends.map(friend => friend.userId);
    User.find({ _id: { $in: userIds } })
        .then(function (users) {
            const friends = [];
            for (const friend of req.user.friends) {
                friends.push({
                    user: users.find(user => user.id === friend.userId),
                    tags: friend.tags
                })
            }
            return res.status(200).json(friends);
        })
        .catch(function (err) {
            return res.status(500).json(err);
        });
};

module.exports.retrieve = function (req, res, username) {
    User.findOne({ username: username })
        .then(function (user) {
            if (!user) {
                return res.sendStatus(404);
            }
            const friend = req.user.friends.find(friend => friend.userId === user.id);
            if (friend) {
                return res.status(200).json(friend);
            } else {
                return res.sendStatus(404);
            }
        })
        .catch(function (err) {
            return res.status(500).json(err);
        });
};

module.exports.createOrPatch = function (req, res, username) {
    User.findOne({ username: username })
        .then(function (user) {
            if (!user) {
                return res.sendStatus(404);
            }
            let friend = req.user.friends.find(friend => friend.userId === user.id);
            if (!friend) {
                friend = {
                    userId: user.id
                };
                req.user.friends.push(friend);
            }
            if (req.body.tags) {
                friend.tags = req.body.tags;
            }
            return user.save()
                .then(function (user) {
                    return res.status(200).json(user.friends.find())
                });
        })
        .catch(function (err) {
            return res.status(500).json(err);
        });
};
