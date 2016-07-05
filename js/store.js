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
            url: '/flsv2/GetItemStoreByX',
            type:'post',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.returnCode == 0){
                    $scope.$apply(function(){
                        $scope.items = response.resList;
                    });
                }
            },
            error:function() {
            }
        });	
    }
    
    getItems();
    
}]);
