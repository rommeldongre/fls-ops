var promocodeApp = angular.module('myApp');

promocodeApp.controller('promocodeCtrl', ['$scope', '$http', 'modalService', 'loginService', function($scope, $http, modalService, loginService){

    // setting the defalut page no as one
    $scope.pageNo = 1;
	$scope.limit = 10;

    // saving the last item ids for page navigation in the ui
    var lastPromoCodeId = 0;
    var lastPromoCodeIds = [lastPromoCodeId];
	var lastOffset = 0

	//setting default from and to date values as null
	var FromDate =" 00:00:00";
	var ToDate =" 00:00:00";

	var ExpiryDate="";

	var userToDate="";
	var orderId = 0;

    $scope.userId = null;
    $scope.userName = "";
	$scope.type='FLS_ALL';
	$scope.searchString = "";

    var getPromoCodes = function(token){
        var req = {
			type: $scope.type,
			cookie: token,
			limit: $scope.limit,
			searchString: $scope.searchString,
			fromDate: FromDate,
			toDate: ToDate
        }
        displayPromoCodes(req);
    }

    var displayPromoCodes = function(req){
        $.ajax({
            url: '/GetPromoCodesByX',
            type:'post',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.code == 0){
                    $scope.$apply(function(){
                        $scope.promos = response.resList;
                    });
                    lastPromoCodeId = response.lastPromoCodeId;
                }else{
                    lastPromoCodeId = -1;
                }
            },
            error:function() {
            }
        });
    }

    $('#inputGroup .datepicker').datepicker({
             color: 'blue',
			 format: 'yyyy-mm-dd',
    });

    var initialPopulate = function(){
        $scope.promos = [];
        $scope.pageNo = 1;
        lastPromoCodeIds = [0];
        getPromoCodes(0);

    }

    $scope.changeStatus = function(s){
        $scope.type = s;
        initialPopulate();
    }


	getPromoCodes(0);

    $scope.nextCodes = function(){
        if(lastPromoCodeId != -1){
            $scope.promos = [];
            $scope.pageNo++;
            lastPromoCodeIds.push(lastPromoCodeId);
            getPromoCodes(lastPromoCodeId);
        }
    }

    $scope.prevCodes = function(){
        if($scope.pageNo > 1){
            $scope.promos = [];
            $scope.pageNo--;
            getPromoCodes(lastPromoCodeIds[$scope.pageNo-1]);
        }
    }

	$scope.searchPromoCodes = function(){

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

	$scope.addCode = function(){
		var currentdate = new Date();
		var time = " 00:00:00";

		var ExpiryDate = currentdate.getFullYear()+'-' + (currentdate.getMonth()+1) + '-'+currentdate.getDate();
		$scope.expiryDate = ExpiryDate;

		$scope.credit = 10;
		$scope.count = -1;
		$scope.personCount = -1;
		$scope.headingText = "Add Promo Code";

    }

	$scope.deleteCode = function(index){
		modalService.showModal({}, {bodyText: "Are you sure you want to Delete this promo Code ", showCancel: false, actionButtonText: 'Yes'}).then(function(result){
			var req = {
            table:"promocode",
            operation:"deletepromocode",
            row:{
                userId:loginService.user,
                accessToken:loginService.userAccessToken,
                promoCode:"",
                expiry:"",
                credit:10,
                count:-1,
                perPersonCount:-1,
                codeType:"FLS_EXTERNAL",
				promoCodeId:$scope.promos[index].promoCodeId
            },
		}
            $.ajax({
				url: '/AdminOps',
				type:'get',
				data: {req: JSON.stringify(req)},
				contentType:"application/json",
				dataType: "json",

				success: function(response) {
					modalService.showModal({}, {bodyText: response.Message, showCancel: false, actionButtonText: 'OK'}).then(
						function(r){
							location.reload();
						},
					function(){});
				},

				error: function() {
				}
			});
        },function(){});

    }

	$scope.editCode = function(index){

		var dte = $scope.promos[index].expiryDate;
		var ExpiryDate = parseInt(dte);
		var savedDate = new Date(ExpiryDate);
		var expiryDate = savedDate.getFullYear()+'-' + (savedDate.getMonth()+1) + '-'+savedDate.getDate();

		if($scope.promos[index].codeType=="FLS_EXTERNAL"){
			$scope.codeType = true;
		}else{
			$scope.codeType = false;
		}

		$scope.editPromo = true;
		$scope.promoCodeId = $scope.promos[index].promoCodeId;
		$scope.promoCode = $scope.promos[index].promoCode;
		$scope.expiryDate = expiryDate;
		$scope.credit = $scope.promos[index].credits;
		$scope.count = $scope.promos[index].count;
		$scope.personCount = $scope.promos[index].personCount;
		$scope.headingText = "Edit Promo Code";
	}

	$scope.closePromo = function(index){
		$scope.promoCode = "";
		$scope.expiryDate = "";
		$scope.credit = "";
		$scope.count = "";
		$scope.personCount = "";
		$scope.headingText = "";
		$scope.buttonText = "";
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

promocodeApp.controller('promoCodeModalCtrl', ['$scope', 'loginService', 'modalService', function($scope, loginService, modalService){

	$scope.addPromoCode = function(){

		$("#promoCodeModal").hide();
		var CodeType="";
		if($scope.codeType){
			CodeType = "FLS_EXTERNAL";
		}else{
			CodeType = "FLS_INTERNAL";
		}

		var req = {
            table:"promocode",
            operation:"addpromocode",
            row:{
                userId:loginService.user,
                accessToken:loginService.userAccessToken,
                promoCode:$scope.promoCode,
                expiry:$scope.expiryDate,
                credit:$scope.credit,
                count:$scope.count,
                perPersonCount:$scope.personCount,
                codeType:CodeType
            },
		}
		PromoCodeReqSend(req);


	}

	$scope.editPromoCode = function(){

		$("#promoCodeModal").hide();
		var CodeType="";
		if($scope.codeType){
			CodeType = "FLS_EXTERNAL";
		}else{
			CodeType = "FLS_INTERNAL";
		}

		var req = {
            table:"promocode",
            operation:"editpromocode",
            row:{
                userId:loginService.user,
                accessToken:loginService.userAccessToken,
                promoCode:$scope.promoCode,
                expiry:$scope.expiryDate,
                credit:$scope.credit,
                count:$scope.count,
                perPersonCount:$scope.personCount,
                codeType:CodeType,
				promoCodeId:$scope.promoCodeId
            },
		}
		PromoCodeReqSend(req);
	}

	PromoCodeReqSend = function(req) {
		$.ajax({
			url: '/AdminOps',
			type:'get',
			data: {req: JSON.stringify(req)},
			contentType:"application/json",
			dataType: "json",

			success: function(response) {
				modalService.showModal({}, {bodyText: response.Message, showCancel: false, actionButtonText: 'OK'}).then(
					function(r){
						location.reload();
					},
                function(){});
			},

			error: function() {
			}
		});
	};

}]);
