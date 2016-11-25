var eventsApp = angular.module('myApp');

eventsApp.controller('eventsCtrl', ['$scope', '$http', 'modalService', function($scope, $http, modalService){

    // setting the defalut page no as one
    $scope.pageNo = 1;
	$scope.limit = 50;

    // saving the last item ids for page navigation in the ui
    var lastEventId = 0;
    var lastEventIds = [lastEventId];
	
	//setting default from and to date values as null
	var FromDate="";
	var ToDate="";

    $scope.status = 'FLS_ACTIVE';
    
    $('#inputGroupEvents .datepicker').datepicker({
			weekStart:1,
            color: 'blue'
    });

    var initialPopulate = function(){
        $scope.events = [];
        $scope.pageNo = 1;
        lastEventIds = [0];
        getEvents(0);
    }

    $scope.changeStatus = function(s){
        $scope.status = s;
        initialPopulate();
    }

    var getEvents = function(token){
        var req = {
			userId: null,
			status: $scope.status,
			cookie: token,
			limit: $scope.limit,
			fromDate: FromDate,
			toDate : ToDate
        }
        displayEvents(req);
    }

    var displayEvents = function(req){
        $.ajax({
            url: '/GetEventsByX',
            type:'post',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.code == 0){
                    $scope.$apply(function(){
                        $scope.events = response.resList;
                    });
                    lastEventId = response.lastEventId;
                }else{
                    lastEventId = -1
                }
            },
            error:function() {
            }
        });
    }

    // calling the function initially when the file gets loaded
    getEvents(lastEventId);

    $scope.nextEvents = function(){
        if(lastEventId != -1){
            $scope.events = [];
            $scope.pageNo++;
            lastEventIds.push(lastEventId);
            getEvents(lastEventId);
        }
    }

    $scope.prevEvents = function(){
        if($scope.pageNo > 1){
            $scope.events = [];
            $scope.pageNo--;
            getEvents(lastEventIds[$scope.pageNo-1]);
        }
    }
	
	$scope.searchEvents = function(){
		
		var fdate = document.getElementById("fromDate").value;
		var tdate = document.getElementById("toDate").value;
		
		FromDate = formatDate(fdate);
		ToDate = formatDate(tdate);
		
		if(FromDate == "" || FromDate == null|| ToDate == "" || ToDate == null){
			modalService.showModal({}, {bodyText: "Please enter both FROM and TO Dates", actionButtonText: 'OK'}).then(
                function(r){
                },function(){});
		}else{
			if(FromDate> ToDate){
			modalService.showModal({}, {bodyText: "FROM date cannot be more than To Date", actionButtonText: 'OK'}).then(
                function(r){
                },function(){});
			}else{
				initialPopulate();
			}
		}
		
	}
	
	var formatDate = function(usDate){
		var dateParts = usDate.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
		return dateParts[3] + "-" + dateParts[1] + "-" + dateParts[2];
	}
	
}]);
