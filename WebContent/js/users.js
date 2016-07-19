var usersApp = angular.module('myApp');

usersApp.controller('userCtrl', ['$scope', '$http', 'modalService', function($scope, http, modalService){

    var token = 0;
    var tokens = [token];

    var Limit = 10;
    $scope.verification = -1;
    $scope.verificarionText = 'All';

    $scope.changeStatus = function(v, vt){
        $scope.verification = v;
        $scope.verificarionText = vt;
        initialPopulate();
    }

    var initialPopulate = function(){
        $scope.users = [];
        $scope.pageNo = 1;
        token = 0;
        tokens = [token];
        getUsers(token);
    }

    var getUsers = function(c){
        var req = {
            table: "users",
            operation: "getusers",
            row: {

            },
            cookie: c,
            limit: Limit,
            verification: $scope.verification
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
