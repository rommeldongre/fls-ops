var usersApp = angular.module('myApp');

usersApp.controller('userCtrl', ['$scope', '$http', 'modalService', function($scope, http, modalService){

    var token = 0;
    var tokens = [token];

    var Limit = 10;
    var Verification = -1;
    var LiveStatus = -1;
	var lastLeadId = "";
	var user_id="";
	$("#openBtn_userEngage").hide();

    $scope.verificarionText = 'All';
    $scope.liveStatusText = 'All';

    var initialPopulate = function(){
        $scope.users = [];
        $scope.pageNo = 1;
        token = 0;
        tokens = [token];
        getUsers(token);
    }

    $scope.changeVerificationFilter = function(v, vt){
        Verification = v;
        $scope.verificarionText = vt;
        initialPopulate();
    }

    $scope.changeLiveStatusFilter = function(ls, lst){
        LiveStatus = ls;
        $scope.liveStatusText = lst;
        initialPopulate();
    }

    var getUsers = function(c){
        var req = {
            table: "users",
            operation: "getusers",
            row: {
                verification: Verification,
                liveStatus: LiveStatus
            },
            cookie: c,
            limit: Limit
        }
        displayUsers(req);
    }

    var displayUsers = function(req){
        $.ajax({
            url: '/AdminOps',
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
                url: '/AdminOps',
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
                url: '/AdminOps',
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
	
	var getEngagements = function(id,date){
        var req = {
			userId: id,
			interval: "weekly",
			cookie: 0,
			limit: Limit,
			fromDate: "",
			toDate : date
        }
        displayLeads(req);
    }

    var displayLeads = function(req){
        $.ajax({
            url: '/GetEngagementsByDate',
            type:'post',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.code == 0){
                    if(lastLeadId == ""){
					$scope.$apply(function(){
						$scope.engagementsArray = [response.resList];
					});
                    }else{
						$scope.$apply(function(){
							$scope.engagementsArray.push(response.resList);
						});
                    }
                    lastLeadId = response.lastEngagementId;
                }else{
                    lastLeadId = "";
					$scope.showNext = false;
                }
            },
            error:function() {
				console.log("not able to get user's credit log data");
            }
        });
    }
	
	$scope.showCredits = function(index){
		
		$("#openBtn_userEngage").click();
		$scope.showNext = true;
		
		user_id= $scope.users[index].userId;
		var currentdate = new Date();
		dformat = [ (currentdate.getFullYear()).padLeft(),
                    currentdate.getMonth()+1,
                    currentdate.getDate().padLeft()].join('-')+
                    ' ' +
                  [ currentdate.getHours().padLeft(),
                    currentdate.getMinutes().padLeft(),
                    currentdate.getSeconds().padLeft()].join(':');
		
		ToDate = dformat
		
		getEngagements(user_id,ToDate);
	}
	
	Number.prototype.padLeft = function(base,chr){
		var  len = (String(base || 10).length - String(this).length)+1;
		return len > 0? new Array(len).join(chr || '0')+this : this;
	}
	
	$scope.cancel_credit = function(){
		lastLeadId = "";
		$scope.engagementsArray = [];
	}
	
	$scope.loadNextCredit = function(){
        getEngagements(user_id,lastLeadId);
    }
    
}]);
