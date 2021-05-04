var xmlParser = require('xml-js');
var fs = require('fs');
const formatXml = require("xml-formatter");
var options = {
    compact: true,
    trim: true,
    nativeType: true,
    ignoreDeclaration: true,
    ignoreInstruction: true,
    ignoreAttributes: true,
    ignoreComment: true,
    ignoreCdata: true,
    ignoreDoctype: true
};
var xmlPath = __dirname + '/../data/nodeData.xml';

function modifyXml(jsonContent, callback) {
    fs.writeFileSync(xmlPath, formatXml(xmlParser.js2xml(jsonContent, options), { collapseContent: true }), function (err, currentXml) {
        if (err) {
            console.log("err")
        } else {
            console.log("Xml file was successfully updated.")
        }
    })
    if (callback !== null)
        callback()
    // setTimeout(callback, 100);
}

module.exports = {
    modifyNode: function (id, location, status, err, callback) {
        var xml = fs.readFileSync(xmlPath, 'utf8');
        var currentXml = xmlParser.xml2js(xml, options);
        if (!currentXml || !currentXml.data.nodedata || !Array.isArray(currentXml.data.nodedata.node))
            return;
        for (let i = 0; i < 3; i++) {
            if (currentXml.data.nodedata.node[i].nodeID._text == id) {
                /* if node has no error */
                console.log('update node id = ' + id);
                console.log('update node id = ' + id);
                if (currentXml.data.nodedata.node[i].status._text != status && status != null)
                    currentXml.data.nodedata.node[i].status._text = status;
                if (currentXml.data.nodedata.node[i].location._text != location && location != null)
                    currentXml.data.nodedata.node[i].location._text = location;
                if (currentXml.data.nodedata.node[i].error._text != err && err != null)
                    currentXml.data.nodedata.node[i].error._text = err;
            }
        }
        modifyXml(currentXml, function () {
            if (callback !== null)
                callback();
        });
        return 1;
    },

    modifyAll: function (status, callback) {
        var xml = fs.readFileSync(xmlPath, 'utf8');
        var currentXml = xmlParser.xml2js(xml, options);
        if (!currentXml || !currentXml.data.nodedata || !Array.isArray(currentXml.data.nodedata.node))
            return;
        for (let i = 0; i < 3; i++) {
            currentXml.data.nodedata.node[i].status._text = status;
        }
        modifyXml(currentXml, function () {
            if (callback !== null)
                callback();
        });
        return 1;
    },

    getDbAsObj: function () {
        var xml = fs.readFileSync(xmlPath, 'utf8');
        var currentXml = xmlParser.xml2js(xml, options);
        if (!currentXml || !currentXml.data.nodedata || !Array.isArray(currentXml.data.nodedata.node))
            return;
        let nodeData = {};
        for (let i = 0; i < 3; i++) {
            nodeData[`node${i}_id`] = currentXml.data.nodedata.node[i].nodeID._text;
            nodeData[`node${i}_location`] = currentXml.data.nodedata.node[i].location._text;
            nodeData[`node${i}_status`] = currentXml.data.nodedata.node[i].status._text.toUpperCase();
            nodeData[`node${i}_error`] = currentXml.data.nodedata.node[i].error._text;
        }
        console.log('update /control');
        return (nodeData);
    },

    getDbAsJson: function () {
        return xmlParser.xml2js(fs.readFileSync(xmlPath, 'utf8'), options);
    },

    loginParser: function (username, password) {
        var xml = fs.readFileSync(xmlPath, 'utf8');
        var currentXml = xmlParser.xml2js(xml, options);
        if (!currentXml || !currentXml.data.users || !currentXml.data.users.user || !Array.isArray(currentXml.data.users.user))
            return;
        /* Return control page if username and password exist in database */
        for (let i = 0; i < currentXml.data.users.user.length; i++) {
            if (username == currentXml.data.users.user[i].username._text) {
                if (password == currentXml.data.users.user[i].password._text) {
                    return 1;
                }
            }
        }
        return;
    },

}