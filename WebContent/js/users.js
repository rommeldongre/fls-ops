var usersApp = angular.module('myApp');

usersApp.controller('userCtrl', ['$scope', '$http', 'modalService', 'ticketCreateApi', '$filter', function ($scope, http, modalService, ticketCreateApi, $filter) {

    var token = 0;
    var tokens = [token];

    var Limit = 10;
    var Verification = -1;
    var LiveStatus = -1;
    var UserStatus = -1;
    var lastLeadId = "";
    var user_id = "";

    $scope.verificarionText = 'All';
    $scope.liveStatusText = 'All';
    $scope.userStatusText = 'All';

    var initialPopulate = function () {
        $scope.users = [];
        $scope.pageNo = 1;
        token = 0;
        tokens = [token];
        getUsers(token);
    }

    $scope.changeVerificationFilter = function (v, vt) {
        Verification = v;
        $scope.verificarionText = vt;
        initialPopulate();
    }

    $scope.changeLiveStatusFilter = function (ls, lst) {
        LiveStatus = ls;
        $scope.liveStatusText = lst;
        initialPopulate();
    }

    $scope.changeUserStatusFilter = function (us, ust) {
        UserStatus = us;
        $scope.userStatusText = ust;
        initialPopulate();
    }

    var getUsers = function (c) {
        var req = {
            table: "users",
            operation: "getusers",
            row: {
                verification: Verification,
                liveStatus: LiveStatus,
                userStatus: UserStatus
            },
            cookie: c,
            limit: Limit
        }
        displayUsers(req);
    }

    var displayUsers = function (req) {
        $.ajax({
            url: '/AdminOps',
            type: 'get',
            data: {
                req: JSON.stringify(req)
            },
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                if (response.Code == 0) {
                    var obj = JSON.parse(response.Message);
                    $scope.$apply(function () {
                        $scope.users = obj.users;
                    });
                    token = obj.offset;
                } else {
                    token = -1
                }
            },
            error: function () {}
        });
    }


    // calling the function initially when the file gets loaded
    initialPopulate();

    $scope.changeVerification = function (i) {
        modalService.showModal({}, {
            bodyText: "Are you sure you want change verification to ",
            userVerificationDropdown: true,
            actionButtonText: 'Yes'
        }).then(function (result) {
            var req = {
                table: "users",
                operation: "editVerification",
                row: {
                    userId: $scope.users[i].userId,
                    verification: result.status
                }
            }
            $.ajax({
                url: '/AdminOps',
                type: 'get',
                data: {
                    req: JSON.stringify(req)
                },
                contentType: "application/json",
                dataType: "json",
                success: function (response) {
                    if (response.Code == 0) {
                        modalService.showModal({}, {
                            bodyText: 'Users verification changed!!',
                            actionButtonText: 'OK'
                        }).then(
                            function (r) {
                                $scope.users[i].verification = result.status;
                            },
                            function () {});
                    }
                },
                error: function () {}
            });
        }, function () {});
    }

    $scope.changeLiveStatus = function (i) {
        modalService.showModal({}, {
            bodyText: "Are you sure you want to put this user on ",
            userLiveStatusDropdown: true,
            actionButtonText: 'Yes'
        }).then(function (result) {
            var req = {
                table: "users",
                operation: "editlivestatus",
                row: {
                    userId: $scope.users[i].userId,
                    liveStatus: result.status
                }
            }
            $.ajax({
                url: '/AdminOps',
                type: 'get',
                data: {
                    req: JSON.stringify(req)
                },
                contentType: "application/json",
                dataType: "json",
                success: function (response) {
                    if (response.Code == 0) {
                        modalService.showModal({}, {
                            bodyText: 'Users status changed!!',
                            actionButtonText: 'OK'
                        }).then(
                            function (r) {
                                $scope.users[i].liveStatus = result.status;
                            },
                            function () {});
                    }
                },
                error: function () {}
            });
        }, function () {});
    }
	
	$scope.changeStatus = function (i) {
        modalService.showModal({}, {
            bodyText: "Are you sure you want to change Status of the user ",
            showCancel: false, 
			actionButtonText: 'OK'
        }).then(function (result) {
		var userStatus = $scope.users[i].status
		var fields = userStatus.split('_');
		if(fields[1]=="pending"){
			userStatus = fields[0]+"_"+"activated";
		}else{
			userStatus = fields[0]+"_"+"pending";
		}
            var req = {
                table: "users",
                operation: "editstatus",
                row: {
                    userId: $scope.users[i].userId,
                    status: userStatus
                }
            }
            $.ajax({
                url: '/AdminOps',
                type: 'get',
                data: {
                    req: JSON.stringify(req)
                },
                contentType: "application/json",
                dataType: "json",
                success: function (response) {
                    if (response.Code == 0) {
						$scope.$apply(function(){  
							$scope.users[i].status = userStatus;
						});
                    }
                },
                error: function () {}
            });
        }, function () {});
    }

    $scope.nextUsers = function () {
        if (token != -1) {
            $scope.users = [];
            $scope.pageNo++;
            tokens.push(token);
            getUsers(token);
        }
    }

    $scope.prevUsers = function () {
        if ($scope.pageNo > 1) {
            $scope.users = [];
            $scope.pageNo--;
            getUsers(tokens[$scope.pageNo - 1]);
        }
    }

    $scope.showCredits = function (index) {
        var win = window.open("myapp.html#/engagements/" + $scope.users[index].userUid, '_blank');
        win.focus();
    }

    $scope.cancel_credit = function () {
        lastLeadId = "";
        $scope.engagementsArray = [];
    }

    $scope.loadNextCredit = function () {
        getEngagements(user_id, lastLeadId);
    }

    $scope.exportUsers = function () {

        var verification = document.createElement("input");
        verification.type = "hidden";
        verification.name = "verification";
        verification.value = Verification;

        var liveStatus = document.createElement("input");
        liveStatus.type = "hidden";
        liveStatus.name = "liveStatus";
        liveStatus.value = LiveStatus;

        var userStatus = document.createElement("input");
        userStatus.type = "hidden";
        userStatus.name = "userStatus";
        userStatus.value = UserStatus;

        var f = document.getElementById("exportUsers");
        f.appendChild(verification);
        f.appendChild(liveStatus);
        f.appendChild(userStatus);
        f.submit();
    }

    $scope.createTicket = function (userId) {
        modalService.showModal({}, {
            bodyText: "Create a ticket - ",
            ticketCreation: true,
            ticketTypes: types,
            actionButtonText: 'ok'
        }).then(function (r) {
            var dueDate = new Date(Date.parse(r.dueDate));
            dueDate = $filter('date')(dueDate, 'yyyy-MM-dd');
            ticketCreateApi.addTicket({
                ticketUserId: userId,
                dueDate: dueDate,
                ticketType: r.type
            }).then(
                function (res) {
                    var response = res.data;
                    if(response.code == 0) {
                        window.location.replace('myapp.html#/ticket/'+response.ticketId);
                    }
                },
                function (response) {
                    console.log(response);
                }
            );
        }, function (e) {});
    }

    var types = [];

    var getTypes = function () {
        ticketCreateApi.getTicketTypes().then(
            function (res) {
                var response = res.data;
                response.types.forEach(function (t, index) {
                    var dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + response.dues[index]);
                    var type = {
                        type: t,
                        due: dueDate,
                        script: response.scripts[index]
                    };
                    types.push(type);
                });
            },
            function (e) {
                console.log(e);
            }
        );
    }

    getTypes();

}]);

usersApp.service('ticketCreateApi', ['$http', 'loginService', function ($http, loginService) {

    var req = {
        userId: loginService.user,
        accessToken: loginService.userAccessToken
    }

    this.addTicket = function (params) {
        angular.extend(params, req);
        return $http.post('/AddTicket', JSON.stringify(params));
    }

    this.getTicketTypes = function () {
        return $http.post('/GetTicketTypes', JSON.stringify(req));
    }

}]);
