var ticketApp = angular.module('myApp');

ticketApp.controller('ticketCtrl', ['$scope', 'ticketApi', '$routeParams', function ($scope, ticketApi, $routeParams) {

    var id = $routeParams.id;

    if (id != undefined) {
        ticketApi.getTicketDetails({
            ticketId: id
        }).then(function (res) {
            var response = res.data;
            console.log(response);
        }, function (error) {
            console.log(error);
        });
    }

}]);


ticketApp.service('ticketApi', ['$http', 'loginService', function ($http, loginService) {

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
