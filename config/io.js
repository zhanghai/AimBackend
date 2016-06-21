const passportIo = require('passport.socketio');
const io = require('socket.io')();

const config = require('.');
const store = require('./store');

io.use(passportIo.authorize({
    secret: config.secret,
    store,
    success(data, accept) {
        accept();
    },
    fail(data, message, error, accept) {
        if (error) {
            console.error(error);
            accept(new Error(message));
        }
    }
}));

io.on('connection', socket => {
    console.log(socket.request.user);
    socket.join(socket.request.user.id);
});

module.exports = io;
