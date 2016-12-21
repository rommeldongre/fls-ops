var engagementsApp = angular.module('myApp');

engagementsApp.controller('engagementsCtrl', ['$scope', '$http', '$routeParams', 'modalService', function($scope, $http, $routeParams, modalService){

    // setting the defalut page no as one
    $scope.pageNo = 1;
	$scope.limit = 10;

    // saving the last item ids for page navigation in the ui
    var lastEngagementId = "";
    var lastEngagementIds = [];
	var lastOffset = 0
	
	//setting default from and to date values as null
	var FromDate="";
	var ToDate="";
	
	var userFromDate="";
	var userToDate="";
	
	//getting parameters
	var user_Id = null;
	$scope.userName = "";
	if($routeParams.id!="''"){
		user_Id = $routeParams.id;
		$scope.userName = $routeParams.name;
	}
	
	
	

	$scope.duration='weekly';
	$scope.interval= 35;

    $('#inputGroup .datepicker').datepicker({
             color: 'blue',
			 format: 'yyyy-mm-dd',
    });

	$("#openBtn_engage").hide();
	
    var initialPopulate = function(){
        $scope.lastEngagements = [];
        $scope.pageNo = 1;
        lastEngagementIds = [0];
        getEngagements(0);
		
    }

    $scope.changeStatus = function(s){
		if(s == "weekly"){
			$scope.duration = s;
		}else if(s == "monthly"){
			$scope.duration = s;
		}else if(s == "daily"){
			$scope.duration = s;
		}
    }
			
	var setInitDates = function(){
		var currentdate = new Date();
		var time = " 00:00:00";
		
		ToDate = currentdate.getFullYear()+'-' + (currentdate.getMonth()+1) + '-'+currentdate.getDate();
		$scope.toDate = ToDate;
		ToDate = ToDate + time;
		lastEngagementIds = [ToDate];
		getEngagements(0);
	}
	
	Number.prototype.padLeft = function(base,chr){
		var  len = (String(base || 10).length - String(this).length)+1;
		return len > 0? new Array(len).join(chr || '0')+this : this;
	}
	
    var getEngagements = function(token){
        var req = {
			userId: user_Id,
			interval: $scope.duration,
			cookie: token,
			limit: $scope.limit,
			fromDate: FromDate,
			toDate : ToDate
        }
        displayEngagements(req);
    }
	
	var getEngagementsCont = function(token){
        var req = {
			userId: user_Id,
			interval: $scope.duration,
			cookie: 0,
			limit: $scope.limit,
			fromDate: FromDate,
			toDate : token
        }
        displayEngagements(req);
    }

    var displayEngagements = function(req){
        $.ajax({
            url: '/GetEngagementsByX',
            type:'post',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.code == 0){
                    $scope.$apply(function(){
                        $scope.lastEngagements = response.resList;
                    });
                    lastEngagementId = response.lastEngagementId;
                }else{
                    lastEngagementId = -1
                }
            },
            error:function() {
            }
        });
    }

    // calling the function initially when the file gets loaded
	setInitDates();
	
	
    $scope.nextEngagements = function(){
        if(lastEngagementId != -1){
            $scope.lastEngagements = [];
            $scope.pageNo++;
            lastEngagementIds.push(lastEngagementId);
            getEngagementsCont(lastEngagementId);
        }
    }

    $scope.prevEngagements = function(){
        if($scope.pageNo > 1){
            $scope.lastEngagements = [];
            $scope.pageNo--;
            getEngagementsCont(lastEngagementIds[$scope.pageNo-1]);
        }
    }
	
	$scope.searchEngagements = function(){
		
		var tdate = document.getElementById("toDate").value;
		var time = " 00:00:00";
		ToDate = tdate+time;
		
		if(ToDate == "" || ToDate == null){
			modalService.showModal({}, {bodyText: "Please enter TO Date", actionButtonText: 'OK'}).then(
                function(r){
                },function(){});
		}else{
			initialPopulate();
		}
		
	}
	
	$scope.showCredits = function(index){
		$("#openBtn_engage").click();
		$scope.showNext = true;
		userFromDate = $scope.lastEngagements[index].startDate;
		userToDate = $scope.lastEngagements[index].endDate;
		getCredit(lastOffset,userFromDate,userToDate);
	}
	
	var getCredit = function(Offset,FromDate,ToDate){
		var req = {
			userId : user_Id,
			cookie: Offset,
			limit: $scope.limit,
			fromDate: FromDate,
			toDate : ToDate
		}
		getCreditSend(req);
	}
	
	var getCreditSend = function(req){
		$.ajax({
            url: '/GetCreditsLogByX',
            type: 'post',
            data: JSON.stringify(req),
			contentType:"application/json",
			dataType:"json",
            success: function(response){
				if(response.code == 0){
                if(lastOffset == 0){
					$scope.$apply(function(){
						$scope.engagementsArray = [response.resList];
					});
                    }else{
						$scope.$apply(function(){
						$scope.engagementsArray.push(response.resList);
						});
						$scope.showNext = false;
                    }
                    lastOffset = response.lastEngagementId;
				}else{
					$scope.showNext = false;
					console.log("ReturnCode not Zero");
                }
            },
            error: function(){
                console.log("not able to get credit log data");
            }
	
        });
	}
	
	$scope.cancel_credit = function(){
		lastOffset = 0;
		userFromDate = "";
		userToDate = "";
		$scope.engagementsArray = [];
	}
	
	// called when Show More Credits button is clicked
    $scope.loadNextCredit = function(){
        getCredit(lastOffset,userFromDate,userToDate);
    }
	
}]);
