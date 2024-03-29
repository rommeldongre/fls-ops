var ticketApp = angular.module('myApp');

ticketApp.controller('ticketCtrl', ['$scope', 'ticketApi', '$routeParams', 'modalService', '$filter', function ($scope, ticketApi, $routeParams, modalService, $filter) {

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
                $scope.ticket.dueDate = new Date(Date.parse($scope.ticket.dueDate));
                $scope.ticket.script = $scope.ticket.script.replace(/(?:\r\n|\r|\n)/g, '<br />');
            }
        }, function (error) {
            console.log(error);
        });
    }

    $scope.toggleStatus = function () {
        var status = 'CLOSED',
            message = "Are you sure you want to close this ticket?";
        if ($scope.ticket.status == 'CLOSED') {
            status = 'OPEN';
            message = "Are you sure you want to open this ticket?";
        }
        modalService.showModal({}, {
            bodyText: message,
            actionButtonText: 'OK'
        }).then(
            function (r) {
                ticketApi.toggleStatus({
                    ticketId: $scope.ticket.ticketId,
                    ticketStatus: status
                }).then(
                    function (res) {
                        var response = res.data;
                        if (response.code == 0) {
                            $scope.ticket.status = status;
                        }
                    },
                    function (error) {
                        console.log(error);
                    }
                );
            },
            function (e) {
                console.log(e);
            }
        );
    }

    $scope.saveDueDate = function () {
        ticketApi.updateDueDate({
            ticketId: $scope.ticket.ticketId,
            dueDate: $filter('date')(new Date(Date.parse($scope.ticket.dueDate)), 'yyyy-MM-dd')
        }).then(
            function (res) {
                var response = res.data;
                if (response.code == 0) {
                    modalService.showModal({}, {
                        bodyText: "Updated due date successfully!!",
                        actionButtonText: 'OK'
                    }).then(
                        function (res) {},
                        function (e) {}
                    );
                }
            },
            function (error) {
                console.log(error);
            }
        );
    }

    $scope.saveNote = function (note) {
        if (note) {
            ticketApi.addNote({
                ticketId: $scope.ticket.ticketId,
                note: note
            }).then(
                function (res) {
                    var response = res.data;
                    if (response.code == 0) {
                        window.location.reload();
                    }
                },
                function (error) {
                    console.log(error);
                }
            );
        } else {
            modalService.showModal({}, {
                bodyText: "Please enter a valid note!!",
                actionButtonText: 'OK'
            }).then(function (r) {}, function (e) {});
        }
    }

}]);

ticketApp.service('ticketApi', ['$http', 'loginService', function ($http, loginService) {

    var req = {
        userId: loginService.user,
        accessToken: loginService.userAccessToken
    }

    this.addNote = function (params) {
        angular.extend(params, req);
        return $http.post('/AddNote', JSON.stringify(params));
    }

    this.getTicketDetails = function (params) {
        angular.extend(params, req);
        return $http.post('/GetTicketDetails', JSON.stringify(params));
    }

    this.toggleStatus = function (params) {
        angular.extend(params, req);
        return $http.post('/ToggleTicketStatus', JSON.stringify(params));
    }

    this.updateDueDate = function (params) {
        angular.extend(params, req);
        return $http.post('/ChangeTicketDueDate', JSON.stringify(params));
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
