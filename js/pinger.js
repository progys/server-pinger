var app = angular.module('ServerPing', ['LocalStorage', 'PingProvider', 'xeditable']);
app.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});

app.controller('ServersController', function($scope, $store, $ping) {
    var storeKey = "pingServers";
    var emptyServer = {};
    var messages = {
        now: "now",
        notChecked: "not checked"
    }
    defaultCheckInterval = 5;
    lastCheckedInterval = 2000;

    $scope.servers = $store.get(storeKey) || [];
    $scope.emptyServer = initEmptyServer();
    $scope.checkInterval = defaultCheckInterval;

    init();

    function init() {
        //immediately start checking
        start();
        startLastChecked();
    }

    $scope.intervalChanged = function() {
        $scope.stopCheck();
        $scope.startCheck();
    };

    $scope.serverNameChanged = function() {
        serversChanged();
    };

    $scope.add = function(server) {
        $scope.servers.push(angular.copy(angular.extend(server, {
            index: $scope.servers.length
        })));
        $scope.emptyServer = initEmptyServer();
        serversChanged();
    };

    $scope.remove = function(index) {
        $scope.servers.splice(index, 1);
        serversChanged();
    };

    $scope.noServers = function() {
        return !$scope.servers || $scope.servers.length === 0;
    };

    $scope.startCheck = function() {
        start();
    };

    $scope.isStarted = function() {
        return !!$scope.checkHandler;
    };

    $scope.stopCheck = function() {
        if ($scope.isStarted()) {
            clearInterval($scope.checkHandler);
            $scope.checkHandler = null;
        }
    };

    function start() {
        var servers = $scope.servers;
        $scope.checkHandler = setInterval(function() {
            getStatus(servers);
        }, $scope.checkInterval * 1000);
    };

    function statusCallback(server) {
        return function(status, e) {
            server.status = status;
            server.checked = new Date();
            server.lastChecked = messages.now;
            $scope.$apply();
        }
    }

    function getStatus(servers) {
        for (var i = 0; i < servers.length; i++) {
            var server = servers[i];
            if (server) {
                $ping.ping(server.url.replace(/https|http/, "ws"), statusCallback(server));
            }
        }
    }

    function serversChanged() {
        saveServers();
    }

    function saveServers() {
        var servers = angular.copy($scope.servers);
        for (var i = 0; i < servers.length; i++) {
            delete servers[i].lastChecked;
            delete servers[i].checked;
            delete servers[i].status;
        }
        $store.set(storeKey, servers);
    }

    function initEmptyServer() {
        $scope.emptyServer = angular.copy(emptyServer);
    }

    function startLastChecked() {
        setInterval(function() {
            $scope.$apply(lastChecked($scope.servers));
        }, lastCheckedInterval);
    }

    function lastChecked(servers) {
        for (var i = 0; i < servers.length; i++) {
            var server = servers[i];
            if (server.checked) {
                server.lastChecked = moment(server.checked).fromNow();
            } else {
                server.lastChecked = messages.notChecked;
            }
        }
    }
});



var ls = angular.module('LocalStorage', []);
ls.factory("$store", function($parse) {
    var storage = window.localStorage;
    return {
        set: function(key, value) {
            var normalizedValue = JSON.stringify(value);
            storage.setItem(key, normalizedValue);
        },

        get: function(key) {
            var value = storage.getItem(key);
            return JSON.parse(value);
        },

        remove: function(key) {
            storage.removeItem(key);
        }
    }
});

var ls = angular.module('PingProvider', []);
ls.factory("$ping", function($parse) {
    var status = {
        ALIVE: "ALIVE",
        TIMEOUT: "TIMEOUT"
    };

    function _ping(url, callback) {
        var ws = new WebSocket(url);
        ws.onerror = function(e) {
            callback(status.ALIVE);
            ws = null;
        };
        setTimeout(function() {
            if (ws != null) {
                ws.close();
                ws = null;
                callback(status.TIMEOUT);
            }
        }, 2000);
    }
    return {
        ping: _ping
    }
});