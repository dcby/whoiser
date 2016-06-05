"use strict";

function RandomQueue(queue) {
    var _queue, _backQueue;

    _init(queue.slice());

    function _init(queue) {
        _queue = queue;
        _backQueue = [];
        _queue.sort(function () { return 0.5 - Math.random() });
    }

    this.next = function next() {
        if (!_queue.length)
            _init(_backQueue);
        var ret = _queue.shift();
        _backQueue.push(ret);
        return ret;
    }
}

module.exports = RandomQueue;
