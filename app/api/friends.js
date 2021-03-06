'use strict';

const mongoose = require('mongoose');

const Relationship = mongoose.model('Relationship');
const User = mongoose.model('User');

module.exports = {

    list: function (req, res, next) {
        Relationship.find({
            user: req.user.id,
            isFriend: true
        })
            .populate('target')
            .then(relationships => relationships.map(relationship => Relationship.attachToTarget(relationship.toObject())))
            .then(friends => res.status(200).json(friends))
            .catch(next);
    },

    delete: function (req, res, next) {
        User.findOne({ username: req.params.username })
            .then(target => {
                if (!target) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return Relationship.setIsFriend(req.user.id, target.id, false)
                    .then(function () {
                        return res.sendStatus(204);
                    })
            })
            .catch(next);
    }
};
