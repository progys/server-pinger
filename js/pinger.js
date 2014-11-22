var app = angular.module('ServerPing', ['Storage', 'PingProvider', 'xeditable']);
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

    $scope.emptyServer = initEmptyServer();
    $scope.checkInterval = defaultCheckInterval;
    $scope.addServersVisible = false;
    $scope.notificationsEnabled = true;

    init();

    function init() {
        //immediately start checking
        $store.get(storeKey, function(servers) {
            if (angular.isArray(servers)) {
                $scope.servers = servers;
            } else {
                $scope.servers = [];
            }
        });
        start();
        startLastChecked();
    }

    $scope.toggleAddServerVisibility = function() {
        $scope.addServersVisible = !$scope.addServersVisible;
    };

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
        $scope.checkHandler = setInterval(function() {
            getStatus($scope.servers);
        }, $scope.checkInterval * 1000);
    };

    function statusCallback(server) {
        return function(status, e) {
            var oldStatus = server.status;
            server.status = status;
            if ($scope.notificationsEnabled && (oldStatus !== status || $ping.isTimeout(status))) {
                showNotificationServerStatusChanged(server);
            }
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

    function showNotificationServerStatusChanged(server) {
        chrome.notifications.clear(server.name, function() {});
        chrome.notifications.create(server.name, {
            title: "Server Pinger",
            iconUrl: angular.lowercase(server.status) + ".png",
            type: "basic",
            message: "Server: " + server.name + "\nStatus: " + server.status + "\nURL: " + server.url
        }, function() {});
    }
});