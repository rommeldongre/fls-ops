var leasesApp = angular.module('myApp');

leasesApp.controller('leasesCtrl', ['$scope', '$http', 'modalService', 'loginService', function($scope, $http, modalService, loginService){

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
        if(loginService.user == 'ops@frrndlease.com'){
            if(status == 'LeaseReady')
                changeStatusOps(index, 'PickedUpOut');
            else if(status == 'PickedUpOut')
                changeStatusOps(index, 'LeaseStarted');
            else if(status == 'LeaseStarted')
                modalService.showModal({}, {bodyText: "Cannot change the status untill the lease is ended!!",showCancel: false, actionButtonText: 'OK'}).then(function(r){},function(){});
            else if(status == 'LeaseEnded')
                changeStatusOps(index, 'PickedUpIn');
            else if(status == 'PickedUpIn')
                modalService.showModal({}, {bodyText: "Are you sure you want to close the lease?",showCancel: false, actionButtonText: 'OK'}).then(function(r){closeLease(index);},function(){});
        }else if(loginService.user == 'admin@frrndlease.com'){
            changeStatusAdmin(index);
        }
    }

    var changeStatusAdmin = function(i){
        modalService.showModal({}, {bodyText: "Are you sure you want to change the status of this lease to ", leaseStatusDropdownAdmin:true, actionButtonText: 'Yes'}).then(function(result){
            var req = {
                title: "",
                description: "",
				category: "",
				userId: "",
				leaseTerm: "",
                image: result.image,
				id: $scope.leases[i].itemId,
				leaseId: $scope.leases[i].leaseId,
                leaseValue: 1000,
                status: result.status
            }
            $.ajax({ url: '/flsv2/EditItemStatus',
                type: 'post',
                data: {req : JSON.stringify(req)},
                contentType: "application/x-www-form-urlencoded",
                dataType: "json",
                success: function(response) {
                    if(response.Code == "FLS_SUCCESS"){
                         modalService.showModal({}, {bodyText: response.Message, actionButtonText: 'OK'}).then(
                            function(r){
                                $scope.leases[i].status = result.status;
                            },
                            function(){});
                    }
                },
                error:function() {
                }
            });
        },function(){});
    }

    var changeStatusOps = function(i, s){
        modalService.showModal({}, {bodyText: "Are you sure you want to change the status of this lease to ", leaseStatusDropdownOps:true, leaseStatusOps: s, actionButtonText: 'Yes'}).then(function(result){
            var req = {
                title: "",
                description: "",
				category: "",
				userId: "",
				leaseTerm: "",
                image: result.image,
				id: $scope.leases[i].itemId,
				leaseId: $scope.leases[i].leaseId,
                leaseValue: 1000,
                status: s
            }
            $.ajax({ url: '/flsv2/EditItemStatus',
                type: 'post',
                data: {req : JSON.stringify(req)},
                contentType: "application/x-www-form-urlencoded",
                dataType: "json",
                success: function(response) {
                    if(response.Code == "FLS_SUCCESS"){
                         modalService.showModal({}, {bodyText: response.Message, actionButtonText: 'OK'}).then(
                            function(r){
                                $scope.leases[i].status = s;
                                if(s == 'PickedUpIn'){
                                    if(result.rating != -1)
                                        saveRating(result.rating, result.feedback, $scope.leases[i].itemId, $scope.leases[i].requestorUserId);
                                }
                            },
                            function(){});
                    }
                },
                error:function() {
                }
            });
        },function(){});
    }

    var saveRating = function(Rating, Feedback, ItemId, LeaseeId){
        var req = {
            userId: loginService.user,
            accessToken: loginService.userAccessToken,
            itemId: ItemId,
            leaseeId: LeaseeId,
            rating: Rating,
            feedback: Feedback
        }
        $.ajax({
            url: '/flsv2/AddItemRating',
            type: 'post',
            data: JSON.stringify(req),
            contentType: "application/json",
            dataType: "json",
            success: function(response) {
                if(response.code == 0){
                    modalService.showModal({}, {actionButtonText: 'ok', bodyText: 'Thanks for rating'});
                }
            },
            error:function() {
            }
        });
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
