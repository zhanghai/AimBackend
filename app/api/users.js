'use strict';

import mongoose from 'mongoose';

const Relationship = mongoose.model('Relationship');
const User = mongoose.model('User');

export default {

    retrieve: function (req, res) {
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
                        if (relationship) {
                            relationship.addToUser(user);
                        }
                        return res.status(200).json(user);
                    });
            })
            .catch(function (err) {
                return res.status(500).json(err);
            })
    },

    update: function (req, res) {
        User.findOne({ username: req.params.username })
            .then(function (user) {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                const setOperand = {};
                if (req.body.tags) {
                    setOperand.tags = tags;
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
                        relationship.addToUser(user);
                        return res.status(200).json(user);
                    });
            })
            .catch(function (err) {
                return res.status(500).json(err);
            });
    }
};
