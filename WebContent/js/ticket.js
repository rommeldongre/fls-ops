var ticketApp = angular.module('myApp');

ticketApp.controller('ticketCtrl', ['$scope', 'ticketApi', '$routeParams', function ($scope, ticketApi, $routeParams) {

    var id = $routeParams.id;

    $scope.ticket = {};

    if (id != undefined) {
        ticketApi.getTicketDetails({
            ticketId: id
        }).then(function (res) {
            var response = res.data;
            if (response.code == 0) {
                $scope.ticket = response;
                $scope.ticket.ticketId = id;
                console.log($scope.ticket);
            }
        }, function (error) {
            console.log(error);
        });
    }

}]);

ticketApp.directive('userBadges', function () {
    return {
        restrict: 'EA',
        scope: {
            userId: '='
        },
        controller: function ($scope) {

            $scope.badge = {};

            $scope.$watch('userId', function () {
                var userId = $scope.userId;

                if (userId != undefined && userId != null && userId != "") {
                    $.ajax({
                        url: '/GetUserBadges',
                        type: 'post',
                        data: JSON.stringify({
                            userId: userId
                        }),
                        contentType: "application/x-www-form-urlencoded",
                        dataType: "json",
                        success: function (response) {
                            if (response.code == 0) {
                                $scope.$apply(function () {
                                    $scope.badge = response;
                                });
                            }
                        },

                        error: function () {
                            console.log("Not able to get user badges");
                        }
                    });
                }
            });
        },
        replace: true,
        template: '<div>\
                    <div style="margin:5px;">\
                        <div class="social-badges" style="text-align:center;font-size:large;">\
                            <span>Verified:</span>\
                            <div style="display:inline-block;">\
                                <span style="cursor:help;" class="no-padding btn-tooltip ng-class:{\'text-gray\':!badge.userVerifiedFlag,\'orange\':badge.userVeifiedFlag}" data-toggle="tooltip" title="You get Address Verified when you upload your Photo Id" data-placement="top" tooltip>\
                                    <i class="fa fa-address-card" aria-hidden="true"></i>\
                                </span>\
                                <span style="cursor:help;" class="no-padding btn-tooltip ng-class:{\'text-gray\':badge.userStatus!=\'facebook\', \'text-facebook\':badge.userStatus==\'facebook\'}" data-toggle="tooltip" title="You get Facebook verified if you signed up using Facebook" data-placement="top" tooltip>\
                                    <i class="fa fa-facebook-square" aria-hidden="true"></i>\
                                </span>\
                                <span style="cursor:help;" class="no-padding btn-tooltip ng-class:{\'text-gray\':badge.userStatus!=\'google\',\'text-google\':badge.userStatus==\'google\'}" data-toggle="tooltip" title="You get Google verified if you signed up using Google" data-placement="top" tooltip>\
                                    <i class="fa fa-google-plus-square" aria-hidden="true"></i>\
                                </span>\
                            </div>\
                        </div>\
                    </div>\
                    <div style="margin:5px;">\
                        <div style="text-align:center;display:inline-flex;">\
                            <span class="btn-tooltip" style="cursor:help;padding:5px;" data-toggle="tooltip" data-placement="top" title="Number of Items Posted by this User" tooltip>\
                                <span style="font-size:22px;"><strong>{{badge.userItems}}</strong></span> <span class="text-gray"><i class="fa fa-cubes" aria-hidden="true"></i></span>\
                            </span>\
                            <span class="btn-tooltip" style="cursor:help;padding:5px;" data-toggle="tooltip" data-placement="top" title="Number of Leases this User has got and also has given out" tooltip>\
                                <span style="font-size:22px;"><strong>{{badge.userLeases}}</strong></span> <span class="text-gray"><i class="fa fa-file-text-o" aria-hidden="true"></i></span>\
                            </span>\
                            <span class="btn-tooltip" style="cursor:help;padding:5px;" data-toggle="tooltip" data-placement="top" title="Average number of Days this user takes to respond to a request" tooltip>\
                                <span style="font-size:22px;"><strong>{{(badge.responseTime==0) ? \'NA\' : (badge.responseTime/badge.responseCount | number:0)}} </strong></span> <span class="text-gray"><i class="fa fa-hand-paper-o" aria-hidden="true"></i></span>\
                            </span>\
                            <span class="btn-tooltip" style="cursor:help;padding:5px;" data-toggle="tooltip" data-placement="top" title="Total credits owned by this user" tooltip>\
                                <span style="font-size:22px;"><strong>{{badge.userCredit}} </strong></span> <span class="text-gray"><i class="fa fa-diamond"></i></li></span>\
                            </span>\
                        </div>\
                    </div>\
                    <div style="margin:5px;">\
                        <div style="text-align:center;">\
                            Member Since - <strong>{{badge.userSignupDate | date:\'MMMM yyyy\'}}</strong>\
                        </div>\
                    </div>\
                </div>'

    };
});

ticketApp.service('ticketApi', ['$http', 'loginService', '$q', function ($http, loginService, $q) {

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

    this.getUserId = function (userUid) {
        var deferred = $q.defer();
        if(userUid != undefined){
            var req = {
                table: "users",
                operation: "userfromuid",
                row: {
                    userUid: userUid
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
                        deferred.resolve(obj.userId);
                    } else {
                        deferred.reject(null);
                    }
                },
                error:function() {
                    deferred.reject(null);
                }
            });
        } else {
            deferred.reject(null);
        }

        return deferred.promise;
    }

}]);
