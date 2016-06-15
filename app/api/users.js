'use strict';

const mongoose = require('mongoose');

const Relationship = mongoose.model('Relationship');
const User = mongoose.model('User');

module.exports = {

    retrieve: function (req, res, next) {
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

    update: function (req, res, next) {
        User.findOne({ username: req.params.username })
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                if (user.id === req.user.id()) {
                    return res.status(403).json({ message: 'Cannot update relation with oneself' });
                }
                const setOperand = {};
                if (req.body.alias) {
                    setOperand.alias = req.body.alias;
                }
                if (req.body.tags) {
                    setOperand.tags = req.body.tags;
                }
                if (req.body.description) {
                    setOperand.description = req.body.description;
                }
                return Relationship.findOneAndUpdate({
                    user: req.user.id,
                    target: user.id
                }, {
                    $set: setOperand
                }, {
                    new: true,
                    upsert: true
                })
                    .then(relationship => res.status(200).json(Relationship.attachToTarget(relationship, user.toObject())));
            })
            .catch(next);
    }
};
