var storeApp = angular.module('indexApp');

storeApp.controller('storeCtrl', ['$scope', '$http', function($scope, $http){
    
    // setting the defalut page no as one
    $scope.pageNo = 1;

    var lastItemId = 0;
    var lastItemIds = [lastItemId];
    $scope.search = {};
    $scope.search.string = "";

    var limit = 10;

    var getItems = function(token){
        var req = {
            cookie: token,
            userId: null,
            category: null,
            limit: limit,
            lat: 0.0,
            lng: 0.0,
            searchString: $scope.search.string,
            itemStatus: ['InStore']
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
                }else{
                    lastItemId = -1
                }
            },
            error:function() {
            }
        });	
    }
    
    // calling the function initially when the file gets loaded
    getItems(lastItemId);

    $scope.nextItems = function(){
        if(lastItemId != -1){
            $scope.items = [];
            $scope.pageNo++;
            lastItemIds.push(lastItemId);
            getItems(lastItemId);
        }
    }

    $scope.prevItems = function(){
        if($scope.pageNo > 1){
            $scope.items = [];
            $scope.pageNo--;
            getItems(lastItemIds[$scope.pageNo-1]);
        }
    }

    $scope.searching = function(){
        $scope.items = [];
        $scope.pageNo = 1;
        getItems(0);
    }
    
}]);
