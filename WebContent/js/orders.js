var ordersApp = angular.module('myApp');

ordersApp.controller('ordersCtrl', ['$scope', '$http', 'modalService', function($scope, $http, modalService){

    // setting the defalut page no as one
    $scope.pageNo = 1;
	$scope.limit = 10;

    // saving the last item ids for page navigation in the ui
    var lastOrderId = 0;
    var lastOrderIds = [lastOrderId];
	var lastOffset = 0
	
	//setting default from and to date values as null
	var FromDate="";
	var ToDate="";
	
	var userToDate="";
	var orderId = 0;
	
    $scope.userId = null;
    $scope.userName = "";
	$scope.type='FLS_ALL';
	$scope.searchString = "";

    var getOrders = function(token){
        var req = {
			type: $scope.type,
			userId: "",
			cookie: token,
			limit: $scope.limit,
			searchString: $scope.searchString,
			fromDate: FromDate,
			toDate: ToDate
        }
        displayOrders(req);
    }

    var displayOrders = function(req){
        $.ajax({
            url: '/GetOrdersByX',
            type:'post',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.code == 0){
                    $scope.$apply(function(){
                        $scope.orders = response.resList;
                    });
                    lastOrderId = response.lastOrderId;
                }else{
                    lastOrderId = -1
                }
            },
            error:function() {
            }
        });
    }

	var setInitDates = function(){
		/*var currentdate = new Date();
		var time = " 00:00:00";
		
		ToDate = currentdate.getFullYear()+'-' + (currentdate.getMonth()+1) + '-'+currentdate.getDate();
		$scope.toDate = ToDate;
		ToDate = ToDate + time;*/
		getOrders(0);
	}

    $('#inputGroup .datepicker').datepicker({
             color: 'blue',
			 format: 'yyyy-mm-dd',
    });

	$("#openBtn_creditDetails").hide();
	$("#openBtn_razorPayDetails").hide();
	
	
    var initialPopulate = function(){
        $scope.orders = [];
        $scope.pageNo = 1;
        lastOrderIds = [0];
        getOrders(0);
		
    }

    $scope.changeStatus = function(s){
        $scope.type = s;
        initialPopulate();
    }
			
	
	/*Number.prototype.padLeft = function(base,chr){
		var  len = (String(base || 10).length - String(this).length)+1;
		return len > 0? new Array(len).join(chr || '0')+this : this;
	}*/
	
    var getEngagements = function(token){
        var req = {
			userId: $scope.userId,
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
			userId: $scope.userId,
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
                    lastOrderId = response.lastOrderId;
                }else{
                    lastOrderId = -1
                }
            },
            error:function() {
            }
        });
    }

    //getUserData();
	setInitDates();
	
    $scope.nextOrders = function(){
        if(lastOrderId != -1){
            $scope.orders = [];
            $scope.pageNo++;
            lastOrderIds.push(lastOrderId);
            getOrders(lastOrderId);
        }
    }

    $scope.prevOrders = function(){
        if($scope.pageNo > 1){
            $scope.orders = [];
            $scope.pageNo--;
            getOrders(lastOrderIds[$scope.pageNo-1]);
        }
    }
	
	$scope.searchOrders = function(){
		
		var fdate = document.getElementById("fromDate").value;
		var tdate = document.getElementById("toDate").value;
		
		var time = " 00:00:00";
		FromDate = fdate+time;
		ToDate = tdate+time;
		
		if((FromDate == "" && ToDate !="")|| (ToDate == "" && FromDate !="")){
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
	
	$scope.showCreditDetails = function(index){
		$("#openBtn_creditDetails").click();
		$scope.showNext = true;
		orderId = $scope.orders[index].creditLogId;
		UserId = $scope.orders[index].orderUserId;
		
		getCredit(orderId,UserId);
	}
	
	var getCredit = function(OrderId,UserId){
		var req = {
			userId : UserId,
			creditId: OrderId,
			cookie: 0,
			limit: 1
		}
		getCreditSend(req);
	}
	
	var getCreditSend = function(req){
		$.ajax({
            url: '/GetCreditTimeline',
            type: 'post',
            data: JSON.stringify(req),
			contentType:"application/json",
			dataType:"json",
            success: function(response){
				console.log(response);
				if(response.returnCode == 0){
					console.log("Return code true");
                if(lastOffset == 0){
					console.log("offset true");
					$scope.$apply(function(){
						$scope.creditDetailsArray = [response.resList];
					});
                    }else{
						$scope.$apply(function(){
						$scope.creditDetailsArray.push(response.resList);
						});
						$scope.showNext = false;
                    }
                    lastOffset = response.lastOrderId;
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
	
	$scope.showOrderDetails = function(index){
		$("#openBtn_razorPayDetails").click();
		$scope.showNext = true;
		orderId = $scope.orders[index].razorPayId;
		UserId = $scope.orders[index].orderUserId;
		
		getOrder(orderId,UserId);
	}
	
	var getOrder = function(OrderId,UserId){
		var req = {
			userId : UserId,
			razorPayId: OrderId,
			cookie: 0,
			limit: 1
		}
		getOrderSend(req);
	}
	
	var getOrderSend = function(req){
		$.ajax({
            url: '/GetRazorPayDetailsByX',
            type: 'post',
            data: JSON.stringify(req),
			contentType:"application/json",
			dataType:"json",
            success: function(response){
				console.log(response);
				if(response.code == 0){
					console.log("Return code true");
                if(lastOffset == 0){
					console.log("offset true");
					$scope.$apply(function(){
						$scope.orderDetailsArray = [response.resList];
					});
                    }else{
						$scope.$apply(function(){
						$scope.orderDetailsArray.push(response.resList);
						});
						$scope.showNext = false;
                    }
                    lastOffset = response.lastOrderId;
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
		$scope.creditDetailsArray = [];
	}
	
	$scope.cancel_order = function(){
		lastOffset = 0;
		userFromDate = "";
		userToDate = "";
		$scope.orderDetailsArray = [];
	}
	
}]);
