var storeApp = angular.module('indexApp');

storeApp.controller('storeCtrl', ['$scope', '$http', function($scope, $http){
    
    // setting the defalut page no as one
    $scope.pageNo = 1;

    var lastItemId = 0;
    $scope.search = {};
    $scope.search.string = "";

    var getItems = function(token){
        var req = {
            cookie: token,
            userId: null,
            category: null,
            limit: 10,
            lat: 0.0,
            lng: 0.0,
            searchString: $scope.search.string
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
                    console.log(lastItemId);
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
        var i = lastItemId - 20;
        if(i >= 0){
            $scope.items = [];
            $scope.pageNo--;
            getItems(i);
        }
    }

    $scope.searching = function(){
        $scope.items = [];
        $scope.pageNo = 1;
        getItems(0);
    }
    
}]);
