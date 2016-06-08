'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * User Schema
 */

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        match: /^[0-9A-Za-z]{1,16}$/
    },
    passwordSalt: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 16
    },
    friends: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        tag: [String]
    }]
});

/**
 * Virtuals
 */

UserSchema.virtual('password')
    .set(function (password) {
        this._password = password;
        this.passwordSalt = this.makeSalt();
        this.passwordHash = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

/**
 * Validations
 */

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

/**
 * Pre-save hook
 */

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

/**
 * Methods
 */

UserSchema.methods = {

    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */

    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.passwordHash;
    },

    /**
     * Make passwordSalt
     *
     * @return {String}
     * @api public
     */

    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */

    encryptPassword: function (password) {
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

mongoose.model('User', UserSchema);
