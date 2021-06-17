require('console-stamp')(console, {
    format: ':date().blue (->).blue'
});
var express = require('express');
const { readSync } = require('fs');
var app = express();
app.use("/public", express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
var server = require('http').Server(app);
const io = require('socket.io')(server);
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var convert = require('xml-js');
var modifier = require('./scripts/xmlModifier');
var constant = require('./scripts/constants');
var Server = require('simple-websocket/server');
const { default: consoleStamp } = require('console-stamp');

// var server2 = new Server({ port: process.env.WEB_PORT || 5000 }) // see `ws` docs for other options
const WEB_PORT = process.env.PORT || 3000;

// see `ws` docs for other options

var isLogin = false;
var id = 0;
var pi_id = 0
var web_sock_list = {};
var pi_sock_list = {}

try {
    server.listen(WEB_PORT, function () {
        console.log("web_socket listening on port " + WEB_PORT + "...");
    });
    var server2 = new Server({ server: server, path: "/pi" })
    console.log('pi_socket listening on url: ' + server2.opts.path);
    server2.on('connection', function (pi_socket) {
        pi_socket.id = pi_id++;
        pi_socket.userList = {};
        pi_sock_list[pi_socket.id] = pi_socket
        console.log("pi connected, id: " + pi_socket.id)
        io.sockets.emit('reload', {});

        /* Got data from Pi socket */
        pi_socket.on('data', function (bData) {
            data = bData.toString();
            if (data.includes('ping')) {
                i = data.replace(/[^0-9]/g, '');
                sendData = `pong ${i}`
                console.log(sendData)
                pi_socket.write(sendData)
            }
            else {
                console.log("[" + pi_socket.id + "] pi's data: ", data);
                let msg = data.split('.')
                console.log(JSON.stringify(msg))
                modifier.modifyNode(
                    msg[constant.MSG_INDEX['HEADER_SOURCE_ID']],
                    msg[constant.MSG_INDEX['DATA_LOCATION']],
                    msg[constant.MSG_INDEX['DATA_RELAY_STATE']],
                    msg[constant.MSG_INDEX['DATA_ERR_CODE']],
                    function () {
                        for (const i in pi_socket.userList) {
                            console.log('----> emit updateData to userID: ', i);
                            pi_socket.userList[i].emit('updateData', modifier.getDbAsObj());
                        }
                    }
                );
            }
        });

        /* Got close event */
        pi_socket.on('close', function () {
            console.log("pi disconnect, id: " + pi_socket.id);
            for (const i in pi_socket.userList) {
                console.log('----> emit gatewayDisconnect to userID: ', i);
                pi_socket.userList[i].emit('gatewayDisconnect', {});
            }
            console.log('>>>>> delete pi_socket.id: ', pi_socket.id);
            delete pi_sock_list[pi_socket.id];

        });

        /* Got error event */
        pi_socket.on('error', function (err) {
            console.log(err)
        });

        /* Socket for webUI user */
        io.on('connection', function (web_socket) {
            web_socket.id = id++;
            web_socket.login = isLogin;
            web_sock_list[web_socket.id] = web_socket;
            pi_socket.userList[web_socket.id] = web_socket;

            console.log('new user connection, id: ' + web_socket.id);
            web_socket.emit('updateData', modifier.getDbAsObj());
            web_socket.emit('sessionID', web_socket.id);
            console.log('----> emit gatewayConnect');
            web_socket.emit('gatewayConnect', {})


            // web_socket.on('controlAll', function (data) {
            //     if (web_socket.login == true) {
            //         dbAsJson = modifier.getDbAsJson()
            //         console.log(data)
            //         let msg = {}
            // for (let i = 0; i < dbAsJson.data.nodedata.node.length; i++) {
            // msg['nodeID'] = dbAsJson.data.nodedata.node[i].nodeID._text;
            // msg['nodeID'] = "0xBB"; /* Broadcast address */
            // msg['status'] = data['status'];
            // msg['opcode'] = constant.OPCODE['REQUEST_RELAY_CONTROL'];
            // pi_socket.write(JSON.stringify(msg));
            // console.log(msg);
            // }
            //     }
            // });

            web_socket.on('controlSingle', function (data) {
                if (web_socket.login == true) {
                    data['opcode'] = constant.OPCODE['REQUEST_RELAY_CONTROL']
                    console.log(data);
                    pi_socket.write(JSON.stringify(data))
                }
            });

            web_socket.on('disconnect', function () {
                console.log('user disconnect, id: ' + web_socket.id);
                web_socket.login = false;
                console.log('>>>>> delete web_socket.id: ', web_socket.id);
                delete pi_socket.userList[web_socket.id]
                delete web_sock_list[web_socket.id];
            });
        });
    });
} catch (error) {
    console.log('----- ERROR')
    console.log(err)
}


app.get('/', function (req, res) {
    console.log(req.url);
    isLogin = false
    res.render('index');
});

app.get('/control', function (req, res) {
    console.log(req.url);
    if (isLogin == true)
        res.render('control');
    else
        res.sendStatus(404);
});

app.post("/login", urlencodedParser, function (req, res) {
    console.log(req.url);
    if (!req.body) return res.sendStatus(400);
    var ret = modifier.loginParser(req.body.username, req.body.password);
    if (ret == 1) {
        /* login ok */
        console.log('logged in with username: ');
        console.log(req.body.username);

        isLogin = true;
        res.status(200).json({ status: "ok" });
    }
    else {
        console.log("Invalid login");
        res.sendStatus(404);
    }
    res.end();
});
