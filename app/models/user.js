'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        match: /^[0-9A-Za-z]{1,16}$/
    },
    passwordSalt: {
        type: String,
        required: true,
        select: false
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        type: String,
        required: true,
        default: '/images/default-avatar.svg'
    },
    nickname: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 16
    },
    signature: String
});

UserSchema.virtual('password')
    .set(function (password) {
        this._password = password;
        this.passwordSalt = this.makeSalt();
        this.passwordHash = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

UserSchema.path('username').validate(function (username, respond) {
    if (this.isNew || this.isModified('username')) {
        // Check only when it is a new userId or when username field is modified
        const User = mongoose.model('User');
        User.find({ username: username }).exec(function (err, users) {
            return respond(!err && users.length === 0);
        });
    } else {
        return respond(true);
    }
}, 'Username already exists');

UserSchema.pre('save', function (next) {
    if (!this.isNew) {
        return next();
    } else if (!(this.password && this.password.length)) {
        return next(new Error('Invalid password'));
    } else if (this.password.length < 6) {
        return next(new Error('Password length must be greater than 6'));
    } else {
        return next();
    }
});

UserSchema.methods = {

    authenticate(password) {
        return this.encryptPassword(password) === this.passwordHash;
    },

    makeSalt() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    encryptPassword(password) {
        if (!password) {
            return '';
        }
        try {
            return crypto
                .createHmac('sha1', this.passwordSalt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    }
};

UserSchema.statics = {
    attachRelationship(user) {
        const Relationship = mongoose.model('Relationship');
        return Relationship.findOne({ user: user.id })
            .then(relationship => {
                Relationship.attachToTarget(relationship, user);
                return this;
            })
    }
};

mongoose.model('User', UserSchema);
