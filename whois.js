"use strict";
const net = require("net");

function whois(domain, localAddress, callback) {
    let _sock;
    let _data = "";
    let _isTimedout;

    function query() {
        _sock = net.connect({
            host: "whois.verisign-grs.com",
            port: 43,
            localAddress: localAddress
        }, on_connect);
        _sock.setEncoding("ascii");
        _sock.setTimeout(5000);
        _sock.once("error", on_error);
        _sock.once("timeout", on_timeout)
        _sock.once("end", on_end);
        _sock.on("data", on_data);
    }

    function on_connect() {
        _sock.end(`domain ${domain}\r\n`);
    }

    function on_error(err) {
        if (_isTimedout)
            return;
        callback(err);
    }

    function on_timeout(arg) {
        _isTimedout = true;
        _sock.destroy();
        callback(new Error("Timeout."));
    }

    function on_data(data) {
        _data += data;
    }

    function on_end() {
        let isFound = !~_data.indexOf("No match for domain");
        callback(null, isFound);
    }

    query();
}

module.exports = whois;
