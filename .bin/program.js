#!/usr/bin/env node
"use strict";
const fs = require("fs"),
    os = require("os"),
    whoiser = require("../index");

process
    .on("SIGHUP", function () {
    })
    .on('uncaughtException', err => {
        console.error(err.stack);
        process.exit(1);
    });

// enumerate IPs
let ifaces = os.networkInterfaces();
let ips = Object.keys(ifaces)
    .map(key => ifaces[key])
    .reduce((ret, arr) => {
        arr = arr
            .filter(ip => ip.family === "IPv4")
            .map(ip => ip.address)
            .filter(ip => {
                let raw = ip.split(".").map(e => parseInt(e));
                if (raw[0] === 127
                    || raw[0] === 10
                    || raw[0] === 192 && raw[1] === 168
                    || raw[0] === 172 && raw[1] >= 16 && raw[1] <= 31)
                    return false;
                return true;
            });
        ret = ret.concat(arr);
        return ret;
    }, []);


let config = {
    //stdin: fs.createReadStream(String.raw`D:\!w\whoiser\names-rnd.txt`),
    ipAddresses: ips
};
whoiser(config);
