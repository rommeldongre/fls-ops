var storeApp = angular.module('indexApp');

storeApp.controller('storeCtrl', ['$scope', '$http', function($scope, $http){
    
    // setting the defalut page no as one
    $scope.pageNo = 1;

    var lastItemId = 0;

    var getItems = function(token){
        var req = {
            cookie: token,
            userId: null,
            category: null,
            limit: 10,
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
                    lastItemId = response.lastItemId;
                }
            },
            error:function() {
            }
        });	
    }
    
    // calling the function initially when the file get loaded
    getItems(lastItemId);

    $scope.nextItems = function(){
        $scope.items = [];
        $scope.pageNo++;
        getItems(lastItemId);
    }

    $scope.prevItems = function(){

    }
    
}]);
