var ticketsApp = angular.module('myApp');

ticketsApp.controller('ticketsCtrl', ['$scope', 'ticketsApi', function ($scope, ticketsApi) {
    $scope.ticket = "Hello World!!";

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
//        ticketsApi.addTicket({
//            ticketUserId: "ankit@greylabs.org",
//            dueDate: null,
//            ticketType: "GENERAL"
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

    $scope.addNote = function () {
//        ticketsApi.addNote({
//            note: "This is a note",
//            ticketId: 3
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

}]);
