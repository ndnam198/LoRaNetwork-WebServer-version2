var express = require('express');
const { readSync } = require('fs');
var app = express();
app.use("/public", express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var modifier = require('./scripts/xmlModifier');

server.listen(process.env.PORT || 3001, function () {
    console.log("listening...");
}

io.on('connection', function (socket) {
    console.log('new connection ' + socket.id);
    socket.emit('updateData', modifier.updateControlPage());

    socket.on('controlAll', function (data) {
        console.log(data);
        var ret = modifier.modifyAll(data.status, function () {
            io.sockets.emit('updateData', modifier.updateControlPage());
        });
    });

    socket.on('controlSingle', function (data) {
        console.log(data);
        var ret = modifier.modifyNode(data.nodeID, null, data.status, null, function () {
            io.sockets.emit('updateData', modifier.updateControlPage());
        });
    });

    socket.on('disconnect', function () {
        console.log('user disconnect ' + socket.id);
    });

});

app.get('/', function (req, res) {
    res.render('control');
});
