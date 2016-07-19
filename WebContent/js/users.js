var usersApp = angular.module('myApp');

usersApp.controller('userCtrl', ['$scope', '$http', 'modalService', function($scope, http, modalService){

    var token = 0;
    var tokens = [token];

    var Limit = 10;
    $scope.verification = -1;
    $scope.verificarionText = 'All';

    var initialPopulate = function(){
        $scope.users = [];
        $scope.pageNo = 1;
        token = 0;
        tokens = [token];
        getUsers(token);
    }

    $scope.changeFilter = function(v, vt){
        $scope.verification = v;
        $scope.verificarionText = vt;
        initialPopulate();
    }

    $scope.changeVerification = function(i){
        modalService.showModal({}, {bodyText: "Are you sure you want change verification to ", userVerificationDropdown: true, actionButtonText: 'Yes'}).then(function(result){
            var req = {
                table: "users",
                operation: "editVerification",
                row: {
                    userId:$scope.users[i].userId,
                    verification:result.status
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
                        modalService.showModal({}, {bodyText: 'Users verification changed!!', actionButtonText: 'OK'}).then(
                            function(r){
                                $scope.users[i].verification = result.status;
                            },
                            function(){});
                    }
                },
                error:function() {
                }
            });
        },function(){});
    }

    $scope.changeLiveStatus = function(i){
        modalService.showModal({}, {bodyText: "Are you sure you want to put this user on ", userLiveStatusDropdown: true, actionButtonText: 'Yes'}).then(function(result){
            var req = {
                table: "users",
                operation: "editlivestatus",
                row: {
                    userId:$scope.users[i].userId,
                    liveStatus:result.status
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
                        modalService.showModal({}, {bodyText: 'Users status changed!!', actionButtonText: 'OK'}).then(
                            function(r){
                                $scope.users[i].liveStatus = result.status;
                            },
                            function(){});
                    }
                },
                error:function() {
                }
            });
        },function(){});
    }

    var getUsers = function(c){
        var req = {
            table: "users",
            operation: "getusers",
            row: {
                verification: $scope.verification
            },
            cookie: c,
            limit: Limit
        }
        displayUsers(req);
    }

    var displayUsers = function(req){
        $.ajax({
            url: '/flsv2/AdminOps',
            type:'get',
            data: {req: JSON.stringify(req)},
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.Code == 0){
                    var obj = JSON.parse(response.Message);
                    $scope.$apply(function(){
                        $scope.users = obj.users;
                    });
                    token = obj.offset;
                }else{
                    token = -1
                }
            },
            error:function() {
            }
        });
    }

    // calling the function initially when the file gets loaded
    initialPopulate();

    $scope.nextUsers = function(){
        if(token != -1){
            $scope.users = [];
            $scope.pageNo++;
            tokens.push(token);
            getUsers(token);
        }
    }

    $scope.prevUsers = function(){
        if($scope.pageNo > 1){
            $scope.users = [];
            $scope.pageNo--;
            getUsers(tokens[$scope.pageNo-1]);
        }
    }
    
}]);
