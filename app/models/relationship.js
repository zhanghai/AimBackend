'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Relationship Schema
 */

const RelationshipSchema = new Schema({
    user: {
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
    alias: String,
    tags: [String],
    description: String
});

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
    },

    findAndAttachToTarget(user, target) {
        const Relationship = mongoose.model('Relationship', RelationshipSchema);
        return Relationship.findOne({
            user: user._id,
            target: target._id
        })
            .then(relationship => Relationship.attachToTarget(relationship, target));
    },

    attachToTarget(relationship, target) {
        if (target instanceof mongoose.Document) {
            throw new Error("attachToTarget called with target as a Document; should call target.toObject() before this");
        } else if (typeof target === 'undefined') {
            target = relationship.target;
        }
        target.isFriend = relationship ? relationship.isFriend : false;
        target.alias = relationship ? relationship.alias : null;
        target.tags = relationship ? relationship.tags : [];
        target.description = relationship ? relationship.description : null;
        return target;
    }
};

mongoose.model('Relationship', RelationshipSchema);
