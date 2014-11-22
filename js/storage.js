var ls = angular.module('Storage', []);
ls.factory("$store", function($parse) {
    var storage = chrome.storage.sync;

    return {
        set: function(key, value) {
            var insertValue = {};
            insertValue[key] = angular.toJson(value);
            storage.set(insertValue, function(e) {
                console.log(e);
            });
        },

        get: function(key, callback) {
            storage.get(key, function(value) {
                var parsedValue = null;
                if (value && value[key]) {
                    parsedValue = angular.fromJson(value[key]);
                }
                callback(parsedValue);
            });
        },

        remove: function(key) {
            storage.remove(key, function() {});
        }
    }
});