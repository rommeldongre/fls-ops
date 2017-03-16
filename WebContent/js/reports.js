var reportsApp = angular.module('myApp');

reportsApp.controller('reportsCtrl', ['$scope', 'reportsApi', '$filter', function ($scope, reportsApi, $filter) {

    $scope.isCumulative = false;

    $scope.checkbox = {
        signUp: true,
        requests: false,
        leases: false,
        items: true,
        wishes: false
    };

    var origSeries, origData;

    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [{
        yAxisID: 'y-axis-1'
    }, {
        yAxisID: 'y-axis-2'
    }];
    $scope.options = {
        scales: {
            yAxes: [
                {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                },
                {
                    id: 'y-axis-2',
                    type: 'linear',
                    display: true,
                    position: 'right'
                }
            ]
        }
    };

    $scope.fromDate = new Date();
    $scope.fromDate.setDate($scope.fromDate.getDate() - 7 * 10);
    $scope.toDate = new Date();

    var generateReport = function () {
        reportsApi.getReport({
            report: 'USER_TRACTION',
            freq: 'WEEKLY',
            from: $filter('date')(new Date(Date.parse($scope.fromDate)), 'yyyy-MM-dd'),
            to: $filter('date')(new Date(Date.parse($scope.toDate)), 'yyyy-MM-dd')
        }).then(
            function (response) {
                var res = response.data;
                res.labels.forEach(function(label, index, labels){
                    if(index == 0)
                        labels[index] = "<" + $filter('date')(new Date(Date.parse(label)), 'd MMM yy');
                    else
                        labels[index] = $filter('date')(new Date(Date.parse(label)), 'd MMM yy');
                });
                $scope.labels = res.labels;
                $scope.series = res.series;
                origSeries = angular.copy(res.series);
                origData = angular.copy(res.data);
                $scope.data = res.data;
                $scope.cumulativeData = angular.copy(res.data);
                calcCumulative();
            },
            function (error) {
                console.log(error);
            }
        );
    }

    $scope.plot = function() {
        generateReport();
    }

    generateReport();

    var calcCumulative = function() {
        $scope.cumulativeData.forEach(function(d, i){
            var total = 0;
            d.forEach(function(c, j) {
                total = total + c;
                $scope.cumulativeData[i][j] = total;
            });
        });
    }

    $scope.$watch('checkbox', function(newCheckbox){
        console.log(newCheckbox);
    }, true);

}]);

reportsApp.service('reportsApi', ['$http', function ($http) {

    this.getReport = function (req) {
        return $http.post('/GetReport', JSON.stringify(req));
    }

}]);
