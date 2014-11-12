var app = angular.module('ServerPing', ['LocalStorage', 'PingProvider']);

app.controller('ServersController', function ($scope, $store, $ping) {
    var storeKey = "pingServers";
    var emptyServer = { status: "Not checked"};

    $scope.servers = $store.get(storeKey) || [];
    $scope.server = emptyServer;
    $scope.checkInterval = 5;
    
    $scope.add = function(server){
        $scope.servers.push(angular.copy(server));
        $scope.server = emptyServer;
        serversChanged();
    };
    
    $scope.delete = function(server){
        $scope.servers.splice(server, 1);
        serversChanged();
    };
    
    $scope.startCheck = function(){
        start();
    };
    
    $scope.isStarted = function(){
        return !!$scope.checkHandler;
    };
    
    $scope.stopCheck = function(){
       if ($scope.isStarted()){
            clearInterval($scope.checkHandler);
            $scope.checkHandler = null;
       }
    };
    
    function start(){
        var servers = $scope.servers;
        $scope.checkHandler = setInterval(function(){
            $scope.$apply(getStatus(servers, servers.length - 1));
        }, $scope.checkInterval * 1000);
    };
    
    function getStatus(servers, length){
        var recurse = getStatus;
        if(length >= 0){
            var server = servers[length];
            if (server){
                $ping.ping(server.url, function(status, e){
                    server.status = status;
                    recurse(servers, length-1);
                });
            }
        }
    }
    
    function serversChanged(){
       $store.set(storeKey, $scope.servers); 
    }
});



var ls = angular.module('LocalStorage',[]);
ls.factory("$store",function($parse){
    var storage = window.localStorage;
    return {
        set: function(key, value) {
            var normalizedValue = JSON.stringify(value);
            storage.setItem(key, normalizedValue);
        },
        
        get: function(key){
            var value = storage.getItem(key);
            return JSON.parse(value);
        },
    
        remove: function(key){
            storage.removeItem(key);
        }
  }
});

var ls = angular.module('PingProvider',[]);
ls.factory("$ping", function($parse, $q, $timeout){
   function _ping(ip, callback) {
    if (!this.inUse) {
        this.status = 'unchecked';
        this.inUse = true;
        this.callback = callback;
        this.ip = ip;
        var _that = this;
        this.img = new Image();
        this.img.onload = function () {
            _that.inUse = false;
            _that.callback('responded');
        };
        this.img.onerror = function (e) {
            if (_that.inUse) {
                _that.inUse = false;
                _that.callback('responded', e);
            }

        };
        this.img.src = ip;
        this.timer = setTimeout(function () {
            if (_that.inUse) {
                _that.inUse = false;
                _that.callback('timeout');
            }
        }, 1500);
    }
   }
    return {
        ping: _ping
  }
});