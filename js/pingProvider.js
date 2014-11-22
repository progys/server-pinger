var ls = angular.module('PingProvider', []);
ls.factory("$ping", function($parse) {
    var states = {
        ALIVE: "ALIVE",
        TIMEOUT: "TIMEOUT"
    };

    function _isTimeout(state) {
        return states.TIMEOUT === state;
    }

    function _ping(url, callback) {
        var ws = new WebSocket(url);
        ws.onerror = function(e) {
            callback(states.ALIVE);
            ws = null;
        };
        setTimeout(function() {
            if (ws != null) {
                try {
                    ws.onerror = function() {};
                    ws.close();
                } catch (e) {
                    //ignore the error if thrown
                } finally {
                    callback(states.TIMEOUT);
                    ws = null;
                }
            }
        }, 2000);
    }
    return {
        ping: _ping,
        isTimeout: _isTimeout
    }
});