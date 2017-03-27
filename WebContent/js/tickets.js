var ticketsApp = angular.module('myApp');

ticketsApp.controller('ticketsCtrl', ['$scope', 'ticketsApi', function ($scope, ticketsApi) {

    var limit = 5;
    var offset = 0;

    $scope.tab = {
        status: 'DONE'
    };

    var initPopulate = function () {
        offset = 0;
        $scope.tickets = [];
        getTickets();
    }

    var getTickets = function () {
        ticketsApi.getTicketsByX({
            ticketUserId: null,
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

    $scope.loadMore = function() {
        getTickets();
    }

    $scope.$watch('tab.status', function(){
        initPopulate();
    });

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

    $scope.addTicket = function () {
        ticketsApi.addTicket({
            ticketUserId: "ankit@greylabs.org",
            dueDate: null,
            ticketType: "USER_CONTACT"
        }).then(
            function (res) {
                var response = res.data;
                console.log(response);
            },
            function (response) {
                console.log(response);
            }
        );
    }

    $scope.addNote = function () {
        ticketsApi.addNote({
            note: "This is a note",
            ticketId: 1
        }).then(
            function (res) {
                var response = res.data;
                console.log(response);
            },
            function (response) {
                console.log(response);
            }
        );
    }

    $scope.getTicketDetails = function () {
        ticketsApi.getTicketDetails({
            ticketId: 1
        }).then(
            function (res) {
                var response = res.data;
                console.log(response);
            },
            function (response) {
                console.log(response);
            }
        );
    }

}]);

ticketsApp.service('ticketsApi', ['$http', 'loginService', function ($http, loginService) {

    var req = {
        userId: loginService.user,
        accessToken: loginService.userAccessToken
    }

    this.addTicketType = function (params) {
        angular.extend(req, params);
        return $http.post('/AddTicketType', JSON.stringify(req));
    }

    this.addTicket = function (params) {
        angular.extend(req, params);
        return $http.post('/AddTicket', JSON.stringify(req));
    }

    this.addNote = function (params) {
        angular.extend(req, params);
        return $http.post('/AddNote', JSON.stringify(req));
    }

    this.getTicketsByX = function (params) {
        angular.extend(req, params);
        return $http.post('/GetTicketsByX', JSON.stringify(req));
    }

    this.getTicketDetails = function (params) {
        angular.extend(req, params);
        return $http.post('/GetTicketDetails', JSON.stringify(req));
    }

}]);
