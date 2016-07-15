var leasesApp = angular.module('indexApp');

leasesApp.controller('leasesCtrl', ['$scope', '$http', 'modalService', function($scope, $http, modalService){

    // saving the last item ids for page navigation in the ui
    var lastItemId = 0;

    $scope.status = 'Active';

    $scope.statusFilter = '';

    var initialPopulate = function(){
        $scope.leases = [];
        getLeases(0);
    }

    $scope.changeStatus = function(s){
        $scope.status = s;
        initialPopulate();
    }

    $scope.activeStatusFilter = function(s){
        $scope.statusFilter = s;
        initialPopulate();
    }

    $scope.changeActiveStatus = function(index, status){
        if(status == 'LeaseReady')
            changeStatus(index, 'PickedUpOut');
        else if(status == 'PickedUpOut')
            changeStatus(index, 'LeaseStarted');
        else if(status == 'LeaseStarted')
            modalService.showModal({}, {bodyText: "Cannot change the status untill the lease is ended!!",showCancel: false, actionButtonText: 'OK'}).then(function(r){},function(){});
        else if(status == 'LeaseEnded')
            changeStatus(index, 'PickedUpIn');
        else if(status == 'PickedUpIn')
            modalService.showModal({}, {bodyText: "Are you sure you want to close the lease?",showCancel: false, actionButtonText: 'OK'}).then(function(r){closeLease(index);},function(){});
    }

    var changeStatus = function(i, s){
        modalService.showModal({}, {bodyText: "Are you sure you want to change the status of this lease to ", leaseStatusDropdown: true, leaseStatus: s, actionButtonText: 'Yes'}).then(function(result){
            var req = {
                table: "items",
				operation: "editstat",
				row: {
					title: "",
                    description: "",
					category: "",
					userId: "",
					leaseTerm: "",
					id: $scope.leases[i].itemId,
                    leaseValue: 1000,
                    status: s,
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
                                $scope.leases[i].status = s;
                            },
                            function(){});
                    }
                },
                error:function() {
                }
            });
        },function(){});
    }

    var getLeases = function(token){
        var req = {
            cookie: token,
            leaseUserId: "",
            leaseReqUserId: "",
            status: $scope.status
        }
        displayLeases(req);
    }

    var displayLeases = function(req){
        $.ajax({
            url: '/flsv2/GetLeasesByX',
            type:'post',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.code == 0){
                    $scope.$apply(function(){
                        $scope.leases.unshift(response);
                    });
                    lastItemId = response.cookie;
                    getLeases(lastItemId)
                }
            },
            error:function() {
            }
        });
    }

    // calling the function initially when the file gets loaded
    initialPopulate();
    
    var closeLease = function(i){
        var req = {
				table: "leases",
				operation: "closelease",
				row: {
					reqUserId: $scope.leases[i].requestorUserId,
					itemId: $scope.leases[i].itemId+"",
					userId: $scope.leases[i].ownerUserId,
                    status: ""
				},
				token: null
		};

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
                                console.log(response);
                            },
                            function(){});
                    }
                },
                error:function() {
                }
            });
    }
}]);