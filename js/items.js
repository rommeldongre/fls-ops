var storeApp = angular.module('indexApp');

storeApp.controller('storeCtrl', ['$scope', '$http', 'modalService', function($scope, $http, modalService){

    // setting the defalut page no as one
    $scope.pageNo = 1;

    // saving the last item ids for page navigation in the ui
    var lastItemId = 0;
    var lastItemIds = [lastItemId];

    // for search data
    $scope.search = {};
    $scope.search.string = "";

    $scope.status = 'InStore';

    $scope.changeStatus = function(s){
        $scope.status = s;
        $scope.items = [];
        $scope.pageNo = 1;
        lastItemIds = [0];
        getItems(0);
    }

    $scope.changeActiveStatus = function(i){
        modalService.showModal({}, {bodyText: "Are you sure you want to put this item on ", itemStatusDropdown: true, actionButtonText: 'Yes'}).then(function(result){
            var req = {
                table: "items",
				operation: "editstat",
				row: {
					title: "",
                    description: "",
					category: "",
					userId: "",
					leaseTerm: "",
					id: $scope.items[i].itemId,
                    leaseValue: 1000,
                    status: result,
                    image: ""
				}
            }
            $.ajax({
                url: '/flsv2/AdminOps',
                type:'get',
                data: {req: JSON.stringify(req)},
                contentType:"application/json",
                dataType: "json",
                success: function(response) {
                    if(response.Code == 0){
                        modalService.showModal({}, {bodyText: response.Message, actionButtonText: 'OK'}).then(
                            function(r){
                                $scope.items[i].status = result;
                            },
                            function(){});
                    }
                },
                error:function() {
                }
            });
        },function(){});
    }

    var getItems = function(token){
        var req = {
            cookie: token,
            userId: null,
            category: null,
            limit: 10,
            lat: 0.0,
            lng: 0.0,
            searchString: $scope.search.string,
            itemStatus: [$scope.status]
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
        lastItemIds = [0];
        getItems(0);
    }

}]);
