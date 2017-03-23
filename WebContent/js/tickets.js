var ticketsApp = angular.module('myApp');

ticketsApp.controller('ticketsCtrl', ['$scope', 'ticketsApi', function ($scope, ticketsApi) {
    $scope.ticket = "Hello World!!";

    $scope.addTicketType = function () {
        ticketsApi.addTicketType({
            ticketType: "NORMAL",
            script: "This is cool!!"
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

}]);
