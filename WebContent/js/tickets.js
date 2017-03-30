var ticketsApp = angular.module('myApp');

ticketsApp.controller('ticketsCtrl', ['$scope', 'ticketsApi', '$routeParams', function ($scope, ticketsApi, $routeParams) {

    var uid = $routeParams.uid;
    var userId = null;

    var limit = 5;
    var offset = 0;
    $scope.tickets = [];
    $scope.userName = null;

    $scope.tab = {
        status: 'DUE'
    };

    var getTickets = function () {
        ticketsApi.getTicketsByX({
            ticketUserId: userId,
            filterStatus: $scope.tab.status,
            cookie: offset,
            limit: limit
        }).then(
            function (res) {
                var response = res.data;
                if (response.code == 0) {
                    $scope.tickets.push.apply($scope.tickets, response.tickets);
                    offset = response.offset;
                }
            },
            function (response) {
                console.log(response);
            }
        );
    }

    var getUserId = function () {
        if(uid != undefined){
            var req = {
                table: "users",
                operation: "userfromuid",
                row: {
                    userUid: uid
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
                        var obj = JSON.parse(response.Message);
                        userId = obj.userId;
                        $scope.$apply(function(){
                            $scope.userName = obj.userName;
                        });
                        getTickets();
                    }
                },
                error:function() {
                }
            });
        } else {
            getTickets();
        }
    }

    var initPopulate = function () {
        offset = 0;
        $scope.tickets = [];
        getUserId();
    }

    $scope.loadMore = function() {
        getTickets();
    }

    $scope.addTicketType = function () {
        //        ticketsApi.addTicketType({
        //            ticketType: "NORMAL",
        //            script: "This is cool!!"
        //        }).then(
        //            function (res) {
        //                var response = res.data;
        //                console.log(response);
        //            },
        //            function (response) {
        //                console.log(response);
        //            }
        //        );
    }

    $scope.$watch('tab.status', function(){
        initPopulate();
    });

}]);

ticketsApp.service('ticketsApi', ['$http', 'loginService', function ($http, loginService) {

    var req = {
        userId: loginService.user,
        accessToken: loginService.userAccessToken
    }

    this.getTicketsByX = function (params) {
        angular.extend(req, params);
        return $http.post('/GetTicketsByX', JSON.stringify(req));
    }

}]);
