'use strict';

import mongoose from 'mongoose';

const Relationship = mongoose.model('Relationship');
const User = mongoose.model('User');

export default {

    list: function (req, res) {
        Relationship.find({
            user: req.user.id,
            isFriend: true
        })
            .populate('target')
            .then(function (friendships) {
                const friends = friendships.map(friendship => {
                    friendship.target.isFriend = friendship.isFriend;
                    friendship.target.tags = friendship.tags;
                    return friendship.target;
                });
                return res.status(200).json(friends);
            })
            .catch(function (err) {
                return res.status(500).json(err);
            });
    },

    delete: function (req, res) {
        User.findOne({ username: req.params.username })
            .then(function (target) {
                if (!target) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return Relationship.setIsFriend(req.user.id, target.id, false)
                    .then(function () {
                        return res.sendStatus(204);
                    })
            })
            .catch(function (err) {
                return res.status(500).json(err);
            });
    }
};
