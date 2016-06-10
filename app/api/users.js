'use strict';

const mongoose = require('mongoose');

const Relationship = mongoose.model('Relationship');
const User = mongoose.model('User');

module.exports = {

    retrieve: function (req, res, next) {
        User.findOne({ username: req.params.username })
            .then(function (user) {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return Relationship.findOne({
                    user: req.user.id,
                    target: user.id
                })
                    .then(function (relationship) {
                        return res.status(200).json(Relationship.addToUser(user, relationship));
                    });
            })
            .catch(function (err) {
                return next(err);
            })
    },

    update: function (req, res, next) {
        User.findOne({ username: req.params.username })
            .then(function (user) {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
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
                    .then(function (relationship) {
                        return res.status(200).json(Relationship.addToUser(user, relationship));
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }
};
