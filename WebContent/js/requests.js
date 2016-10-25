var requestsApp = angular.module('myApp');

requestsApp.controller('requestsCtrl', ['$scope', '$http', 'modalService', 'loginService', function($scope, $http, modalService, loginService){
	
	// saving the last item ids for page navigation in the ui
    var lastItemId = 0;

    $scope.status = 'Active';

    var initialPopulate = function(){
        $scope.requests = [];
        getRequests(0);
    }

   $scope.changeStatus = function(s){
        $scope.status = s;
        initialPopulate();
    }

    var getRequests = function(token){
        var req = {
            cookie: token,
            userId: "",
            reqUserId: "",
            status: $scope.status
        }
        displayRequests(req);
    }

    var displayRequests = function(req){
        $.ajax({
            url: '/GetRequestsByX',
            type:'post',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.code == 0){
                    $scope.$apply(function(){
                        $scope.requests.unshift(response);
                    });
                    lastItemId = response.cookie;
                    getRequests(lastItemId)
                }
            },
            error:function() {
            }
        });
    }

    // calling the function initially when the file gets loaded
    initialPopulate();
     
	$scope.deleteRequest = function(index){
		if(loginService.user == 'ops@frrndlease.com'){
            modalService.showModal({}, {bodyText: "Only Admin can Delete Request!!",showCancel: false, actionButtonText: 'OK'}).then(function(r){},function(){});
        }else if(loginService.user == 'admin@frrndlease.com'){
			console.log(index);
			modalService.showModal({}, {bodyText: "Are you sure you want to delete this request?",actionButtonText: 'Yes'}).then(
				function(result){
					var requestId = index;
					if(requestId === '')
						requestId = 0;
					
					var req = {
						request_Id: requestId,
						userId: loginService.user,
						accessToken: loginService.userAccessToken
					};
	
					deleteRequest(req);
            },function(){});
        }
    }
    
    var deleteRequest = function(req){
        $.ajax({
            url: '/DeleteRequest',
            type:'POST',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.code == 0){
					modalService.showModal({}, {bodyText: response.message, showCancel:false, actionButtonText: 'Ok'}).then(function(result){
						initialPopulate();
						}, function(){});
                }else{
					modalService.showModal({}, {bodyText: response.message, showCancel:false, actionButtonText: 'Ok'}).then(
                    function(result){
                            initialPopulate();
                    },function(){});
				}
            },
            error: function() {
            }
        });
    }
}]);
