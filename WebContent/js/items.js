var storeApp = angular.module('myApp');

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

    var initialPopulate = function(){
        $scope.items = [];
        $scope.pageNo = 1;
        lastItemIds = [0];
        getItems(0);
    }

    $scope.changeStatus = function(s){
        $scope.status = s;
        initialPopulate();
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
                    status: result.status,
                    image: ""
				}
            }
            $.ajax({
                url: '/AdminOps',
                type:'get',
                data: {req: JSON.stringify(req)},
                contentType:"application/json",
                dataType: "json",
                success: function(response) {
                    if(response.Code == 0){
                        modalService.showModal({}, {bodyText: response.Message, actionButtonText: 'OK'}).then(
                            function(r){
                                $scope.items[i].status = result.status;
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
            url: '/GetItemStoreByX',
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
        initialPopulate();
    }

    $scope.editItem = function(i){
        modalService.showModal({}, {editingItem: true, headerText: "Edit Item", actionButtonText: 'Update', item: $scope.items[i]}).then(function(response){
            var req = {
                title: response.title,
                description: response.desc,
                category: response.category,
                userId: $scope.items[i].userId,
                leaseTerm: response.leaseTerm,
                id: $scope.items[i].itemId,
                leaseValue: response.leaseValue
            }
            editItemSend(req);
        }, function(){});
    }

    var editItemSend = function(req){
        $.ajax({ url: '/EditPosting',
            type: 'post',
            data: {req : JSON.stringify(req)},
			contentType: "application/x-www-form-urlencoded",
			dataType: "json",
            success: function(response) {
                if(response.Code == "FLS_SUCCESS"){
                    modalService.showModal({}, {bodyText: response.Message, actionButtonText: 'OK'}).then(
                        function(r){
                            initialPopulate();
                        },
                        function(){});
                }
            },
            error:function() {
            }
        });
    }

    $scope.deleteItem = function(i){
        modalService.showModal({}, {bodyText: "Are you sure you want to delete this item?", actionButtonText: 'Yes'}).then(
            function(result){
                var req = {
                    table: "items",
                    operation: "delete",
                    row: {
                        title: $scope.items[i].title,
                        description: "",
                        category: "",
                        userId: $scope.items[i].userId,
                        leaseTerm: "",
                        id: $scope.items[i].itemId,
                        leaseValue: 1000,
                        status: "",
                        image: ""
                    }
                }
                deleteItemSend(req, i);
            },function(error){});
    }

    var deleteItemSend = function(req, i){
        $.ajax({
            url: '/AdminOps',
            type:'get',
            data: {req: JSON.stringify(req)},
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                modalService.showModal({}, {bodyText: response.Message, actionButtonText: 'OK'}).then(
                    function(r){
                        if(response.Code == 0)
                            $scope.items.splice(i,1);
                    },
                    function(){}
                );
            },
            error:function() {
            }
        });
    }

}]);
