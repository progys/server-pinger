var app = angular.module('ServerPing', ['LocalStorage', 'PingProvider']);

app.controller('ServersController', function ($scope, $store, $ping) {
    var storeKey = "pingServers";
    var emptyServer = { status: "Not checked"};

    $scope.servers = $store.get(storeKey) || [];
    $scope.server = emptyServer;
    $scope.checkInterval = 5;
    start();
    
    $scope.add = function(server){
        $scope.servers.push(angular.copy(server));
        $scope.server = emptyServer;
        serversChanged();
    };
    
    $scope.remove = function(index){
        $scope.servers.splice(index, 1);
        serversChanged();
    };

    $scope.noServers = function(){
        return !$scope.servers || $scope.servers.length === 0;
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
                $ping.ping(server.url.replace("http", "ws"), function(status, e){
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
   function _ping(url, callback) {
      var ws = new WebSocket(url);
      ws.onerror = function(e){
        callback("ALIVE");
        ws = null;
      };
     setTimeout(function() {
        if(ws != null) {
          ws.close();
          ws = null;
          callback("TIMEOUT");
        }
      },2000);
    }
    return {
        ping: _ping
  }
});