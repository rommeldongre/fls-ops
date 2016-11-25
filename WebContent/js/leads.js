var leadsApp = angular.module('myApp');

leadsApp.controller('leadsCtrl', ['$scope', '$http', 'modalService', function($scope, $http, modalService){

    // setting the defalut page no as one
    $scope.pageNo = 1;
	$scope.limit = 50;

    // saving the last item ids for page navigation in the ui
    var lastLeadId = 0;
    var lastLeadIds = [lastLeadId];
	
	//setting default from and to date values as null
	var FromDate="";
	var ToDate="";

    $scope.type = 'prime';
    
    $('.datepicker').datepicker({
             color: 'blue'
    });

    var initialPopulate = function(){
        $scope.leads = [];
        $scope.pageNo = 1;
        lastLeadIds = [0];
        getLeads(0);
    }

    $scope.changeStatus = function(s){
        $scope.type = s;
        initialPopulate();
    }

    var getLeads = function(token){
        var req = {
			userId: null,
			leadType: $scope.type,
			cookie: token,
			limit: $scope.limit,
			fromDate: FromDate,
			toDate : ToDate
        }
        displayLeads(req);
    }

    var displayLeads = function(req){
        $.ajax({
            url: '/GetLeadsByX',
            type:'post',
            data: JSON.stringify(req),
            contentType:"application/json",
            dataType: "json",
            success: function(response) {
                if(response.code == 0){
                    $scope.$apply(function(){
                        $scope.leads = response.resList;
                    });
                    lastLeadId = response.lastLeadId;
                }else{
                    lastLeadId = -1
                }
            },
            error:function() {
            }
        });
    }

    // calling the function initially when the file gets loaded
    getLeads(lastLeadId);

    $scope.nextLeads = function(){
        if(lastLeadId != -1){
            $scope.leads = [];
            $scope.pageNo++;
            lastLeadIds.push(lastLeadId);
            getLeads(lastLeadId);
        }
    }

    $scope.prevLeads = function(){
        if($scope.pageNo > 1){
            $scope.leads = [];
            $scope.pageNo--;
            getLeads(lastLeadIds[$scope.pageNo-1]);
        }
    }
	
	$scope.searchLeads = function(){
		
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
