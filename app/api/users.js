'use strict';

const mongoose = require('mongoose');

const Relationship = mongoose.model('Relationship');
const User = mongoose.model('User');

module.exports = {

    search(req, res, next) {
        if (!req.query.keyword) {
            return res.status(403).json({ message: 'Keyword is empty' });
        }
        const regex = new RegExp(req.query.keyword, 'i');
        User.find({
            $or: [{
                username: {
                    $regex: regex
                }
            }, {
                nickname: {
                    $regex: regex
                }
            }, {
                signature: {
                    $regex: regex
                }
            }]
        })
            .then(users => {
                users = users.map(user => user.toObject());
                const promises = [];
                for (const user of users) {
                    promises.push(User.attachRelationship(user));
                }
                return Promise.all(promises)
                    .then(() => res.status(200).json(users));
            })
            .catch(next);
    },

    retrieve(req, res, next) {
        User.findOne({ username: req.params.username })
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return Relationship.findOne({
                    user: req.user.id,
                    target: user.id
                })
                    .then(relationship => res.status(200).json(Relationship.attachToTarget(relationship, user.toObject())));
            })
            .catch(next);
    },

    update(req, res, next) {
        User.findOne({ username: req.params.username })
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                if (user.id === req.user.id) {
                    return res.status(403).json({ message: 'Cannot update relation with oneself' });
                }
                return Relationship.findOneAndUpdate({
                    user: req.user.id,
                    target: user.id
                }, {
                    alias: req.body.alias,
                    description: req.body.description,
                    // Guard against empty string as array.
                    tags: req.body.tags || []
                }, {
                    new: true,
                    upsert: true
                })
                    .then(relationship => res.status(200).json(Relationship.attachToTarget(relationship, user.toObject())));
            })
            .catch(next);
    }
};
