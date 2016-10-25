var notifications = angular.module('myApp');

notifications.controller('notificationsCtrl', ['$scope','$timeout','loginService','modalService','eventsCount', function($scope,$timeout,loginService,modalService,eventsCount){

    var offset = 0;
    var Limit = 5;

    var initialPopulate = function(){
        offset = 0;

        getNotifications();

        $scope.events = [];

        $scope.loadMore = true;
    }

    var getNotifications = function(){

        req = {
            userId: loginService.user,
            limit: Limit,
            offset: offset
        }

        getNotificationsSend(req);

    }

    getNotificationsSend = function(req) {
		$.ajax({
			url: '/GetNotifications',
			type: 'post',
			data: JSON.stringify(req),
			contentType:"application/json",
			dataType:"json",

			success: function(response) {
                if(response.code == 0){
                    $scope.$apply(function(){
                        $scope.events.push.apply($scope.events, response.resList);
                        if(response.resList.length < Limit)
                            $scope.loadMore = false;
                    });
                    offset = response.offset;

                }else{
                    $scope.$apply(function(){
                        $scope.loadMore = false;
                    });
                }
			},

			error: function() {
			}
		});
	};

    $scope.loadmore = function(){
        getNotifications();
    }

    $scope.readEvent = function(index, s){
        $.ajax({
                url: '/EventReadStatus',
                type: 'post',
                data: JSON.stringify({
                    eventId: $scope.events[index].eventId,
                    readStatus: s,
                    userId:loginService.user,
                    accessToken: loginService.userAccessToken
                }),
                contentType:"application/json",
                dataType:"json",

                success: function(response) {
                    if(response.code == 0){
                        eventsCount.updateEventsCount();
                        $scope.$apply(function(){
                            if($scope.events[index].readStatus == 'FLS_READ'){
                                $scope.events[index].readStatus = 'FLS_UNREAD';
                            }else{
                                $scope.events[index].readStatus = 'FLS_READ';
                            }
                        });
                    }
                },

                error: function() {
                }
            });
    }

	$scope.deleteNotification = function(id,index){
		modalService.showModal({}, {bodyText: "Are you sure you want to delete this Notification?",actionButtonText: 'Yes'}).then(
			function(result){
				var EventId = id;
				if(EventId === '')
					EventId = 0;

				var req = {
					eventId: EventId,
					userId: loginService.user,
					accessToken: loginService.userAccessToken
				};
				deleteNotificationSend(req,index);
        },function(){});
	}

	var deleteNotificationSend = function(req,index){
		$.ajax({
			url: '/DeleteEvent',
			type: 'post',
			data: JSON.stringify(req),
			contentType: "application/x-www-form-urlencoded",
			dataType: "json",
			success: function(response) {
				if(response.code==0){
					bannerService.updatebannerMessage(response.message,"");
                    $("html, body").animate({ scrollTop: 0 }, "slow");
					$timeout(function () {
						$scope.events.splice(index, 1);
					});
				}else{
					modalService.showModal({}, {bodyText: response.message ,showCancel: false,actionButtonText: 'Ok'}).then(function(result){eventsCount.updateEventsCount();
						if(response.code == 400){
							logoutService.logout();
						}
					}, function(){});
				}
			},

			error: function() {
				console.log("Not able to send message");
			}
		});
	}

    initialPopulate();

}]);
