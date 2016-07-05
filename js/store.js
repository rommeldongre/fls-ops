var storeApp = angular.module('indexApp');

storeApp.controller('storeCtrl', ['$scope', '$http', function($scope, $http){
    
    var getItems = function(){
        var req = {
            cookie: 0,
            userId: null,
            category: null,
            limit: 3,
            lat: 0.0,
            lng: 0.0,
            searchString: ""
        }
        
        displayItems(req);
    }
    
    var displayItems = function(req){
        $.ajax({
            url: 'http://localhost:8080/flsv2/GetItemStoreByX',
            type:'post',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                console.log(response);
            },
            error:function() {
            }
        });	
    }
    
    getItems();
    
}]);