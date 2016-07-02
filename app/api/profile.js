'use strict';

module.exports = {

    retrieve: function (req, res) {
        return res.status(200).json(req.user);
    },

    update: function (req, res, next) {
        const user = req.user;
        if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }
        if (req.body.nickname) {
            user.nickname = req.body.nickname;
        }
        if (req.body.signature) {
            user.signature = req.body.signature;
        }
        user.save()
            .then(user => res.status(200).json(user))
            .catch(next);
    }
};
