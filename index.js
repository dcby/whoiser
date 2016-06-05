"use strict";
const os = require("os"),
    RandomQueue = require("./RandomQueue"),
    whois = require("./whois");

function whoiser(config) {
    config = config || {};
    let _in = config.stdin || process.stdin;
    let _out = config.stdout || process.stdout;
    let _err = config.stderr || process.stderr;
    let _data = [];
    let _lastQueryTime;
    let _timeout = 0;
    let _ipQueue, _ip;

    if (config.ipAddresses)
        _ipQueue = new RandomQueue(config.ipAddresses);

    function run() {
        let data = "";
        _in.setEncoding("ascii");
        _in.on("data", d => data += d);
        _in.once("end", () => {
            _data = data.split(/\r?\n/).filter(l => l);
            _data.$index = -1;
            next();
        });
    }

    function next() {
        if (++_data.$index >= _data.length)
            return;

        if (_ipQueue)
            _ip = _ipQueue.next();

        query();
    }

    function query() {
        // pause
        if (_lastQueryTime) {
            let to = _timeout || getRandomInt(500, 1000);
            let now = new Date().getTime();
            let waitFor = _lastQueryTime + to - now;
            if (waitFor > 0) {
                setTimeout(query, waitFor);
                return;
            }
        }

        let domain = _data[_data.$index] + ".com";
        _lastQueryTime = new Date().getTime();
        whois(domain, _ip, (err, found) => {
            if (err) {
                _err.write(`${err.stack}${os.EOL}`);
                _timeout = _timeout ? _timeout * 1.5 : 10000;
                process.nextTick(query);
                return;
            }

            // reset any error state
            _timeout = 0;

            if (!found)
                _out.write(`${domain}\r\n`, "ascii", next);
            else
                process.nextTick(next);
        });
    }

    run();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = whoiser;
