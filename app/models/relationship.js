'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Relationship Schema
 */

const RelationshipSchema = new Schema({
    user : {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    target: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isFriend: {
        type: Boolean,
        required: true,
        default: false
    },
    tags: [String]
});

RelationshipSchema.methods = {
    addToUser: function (user) {
        user.isFriend = this.isFriend;
        user.tags = this.tags;
    }
};

RelationshipSchema.statics = {
    setIsFriend : function (user1, user2, isFriend) {
        const Relationship = mongoose.model('Relationship');
        return Promise.all([
            Relationship.findOneAndUpdate({
                user: user1,
                target: user2
            }, {
                $set: {
                    isFriend
                }
            }, {
                new: true,
                upsert: true
            }),
            Relationship.findOneAndUpdate({
                user: user2,
                target: user1
            }, {
                $set: {
                    isFriend
                }
            }, {
                new: true,
                upsert: true
            })
        ]);
    }
};

mongoose.model('Relationship', RelationshipSchema);
